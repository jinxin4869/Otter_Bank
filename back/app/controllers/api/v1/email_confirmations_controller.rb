# frozen_string_literal: true

module Api
  module V1
    class EmailConfirmationsController < ApplicationController
      # 確認期限を過ぎてログインできないユーザーも使えるよう、どちらも認証不要にする
      skip_before_action :authorize_request, only: %i[confirm resend confirm_change]

      # POST /api/v1/auth/confirm-email
      # 確認メールのリンクのトークンを受け取り、メールアドレスを確認済みにする
      def confirm
        user = User.find_by_token_for(:email_confirmation, params[:token].to_s)

        unless user
          render json: { error: '確認リンクが無効または期限切れです。確認メールを送り直してください。' },
                 status: :unprocessable_content
          return
        end

        user.confirm_email!
        render json: { message: 'メールアドレスを確認しました。' }, status: :ok
      end

      # POST /api/v1/auth/confirm-email/resend
      # 確認メールを送り直す。登録の有無・確認済みかどうかにかかわらず同じ 200 を返す
      def resend
        user = User.find_by(email: params[:email].to_s)
        UserMailer.email_confirmation(user).deliver_later if user && !user.email_confirmed?

        render json: { message: '確認メールを送信しました。メールをご確認ください。' }, status: :ok
      end

      # POST /api/v1/auth/confirm-email-change
      # メールアドレス変更の確認メールのリンクのトークンを受け取り、新しいアドレスへ切り替える。
      # リンクを開いた端末がログインしているとは限らないので、認証は求めない（トークンが本人確認になる）
      def confirm_change
        user = User.find_by_token_for(:email_change, params[:token].to_s)

        unless user
          render json: { error: '確認リンクが無効または期限切れです。設定画面からもう一度変更してください。' },
                 status: :unprocessable_content
          return
        end

        unless user.confirm_email_change!
          render json: { error: 'このメールアドレスはすでに使われているため変更できません。' }, status: :unprocessable_content
          return
        end

        render json: { message: 'メールアドレスを変更しました。' }, status: :ok
      end
    end
  end
end
