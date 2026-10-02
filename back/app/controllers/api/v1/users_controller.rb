# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authorize_request, only: [:create]

      def show
        render json: user_json(@current_user)
      end

      def create
        user = User.new(user_params)
        if user.save
          send_email_confirmation(user)
          token = issue_tokens_for(user)
          render json: {
            status: 'success',
            message: 'ユーザー登録が正常に完了しました。',
            user: user.as_json(only: %i[id email username]),
            token: token
          }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        # パスワードやメールアドレスの変更は、盗まれたアクセストークンだけではできないよう現在のパスワードを求める。
        # 401 は「トークンが無効」の意味で使っているので、ここは検証エラーと同じ 422 で返す
        if changing_credentials?
          if @current_user.oauth_only?
            render json: { errors: ['パスワードが未設定です。パスワードリセットから設定してください'], code: 'password_not_set' },
                   status: :unprocessable_content
            return
          end
          unless @current_user.authenticate(params.dig(:user, :current_password).to_s)
            render json: { errors: ['現在のパスワードが正しくありません'], code: 'invalid_current_password' },
                   status: :unprocessable_content
            return
          end
        end

        if update_user_and_revoke_sessions
          # 他の端末は締め出し、操作中のこの端末だけ新しいトークンでログインを保つ
          issue_refresh_token_for(@current_user) if @current_user.saved_change_to_password_digest?
          send_email_change_mails(@current_user) if email_change_requested?
          render json: user_json(@current_user)
        else
          render json: { errors: @current_user.errors.full_messages }, status: :unprocessable_content
        end
      end

      # 退会。取引・実績・投稿・コメント・トークンなどは dependent で消え、他人の投稿の件数も合わせる
      def destroy
        AccountDeletionService.new(@current_user).call
        delete_refresh_token_cookie # 消したユーザーのトークンが Cookie に残らないようにする
        head :no_content
      end

      private

      # 確認しなくても期限までは使え、送り直しもできるので、送れなくても登録は失敗させない
      def send_email_confirmation(user)
        UserMailer.email_confirmation(user).deliver_later
      rescue StandardError => e
        Rails.logger.error "確認メールの送信予約に失敗 user_id=#{user.id}: #{e.class}"
      end

      # 新しいアドレスには確認のリンクを、今のアドレスには変更の申請があったことを送る。
      # 送れなくても申請はやり直せるので、更新は失敗させない
      def send_email_change_mails(user)
        UserMailer.email_change_confirmation(user).deliver_later
        UserMailer.email_change_requested(user).deliver_later
      rescue StandardError => e
        Rails.logger.error "メールアドレス変更のメール送信予約に失敗 user_id=#{user.id}: #{e.class}"
      end

      def user_params
        params.expect(user: %i[username email password password_confirmation])
      end

      # メールアドレスは確認なしでは変えない。新しいアドレスは確認が済むまで unconfirmed_email に置く
      # （確認せずに他人のアドレスへ変えておき、その人の Google ログインでつながるのを防ぐ）
      def update_user_params
        @update_user_params ||= begin
          attrs = params.expect(user: %i[username email name password password_confirmation])
          new_email = attrs.delete(:email)
          attrs[:unconfirmed_email] = new_email if new_email.present? && new_email != @current_user.email
          attrs
        end
      end

      def email_change_requested?
        update_user_params.key?(:unconfirmed_email)
      end

      # パスワードが変わったなら必ず全端末のセッションも失効しているよう、1 トランザクションで更新する
      def update_user_and_revoke_sessions
        User.transaction do
          next false unless @current_user.update(update_user_params)

          @current_user.revoke_all_refresh_tokens! if @current_user.saved_change_to_password_digest?
          true
        end
      end

      def changing_credentials?
        attrs = params[:user]
        return false unless attrs.respond_to?(:key?)

        attrs.key?(:password) || (attrs.key?(:email) && attrs[:email] != @current_user.email)
      end
    end
  end
end
