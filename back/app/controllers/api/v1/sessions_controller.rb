# frozen_string_literal: true

module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :authorize_request, only: %i[create destroy]

      # 未登録のメールアドレスでの照合に使うダミーのハッシュ（処理時間を登録済みの場合と揃える）
      DUMMY_PASSWORD_DIGEST = BCrypt::Password.create('dummy-password', cost: BCrypt::Engine.cost).to_s

      # POST /api/v1/sessions
      def create
        # パラメータが直接送信される場合とsessionネストの両方に対応
        email = params[:email] || params[:session]&.[](:email)
        password = params[:password] || params[:session]&.[](:password)

        user = User.find_by(email: email)

        # 未登録でもパスワード違いと同じ応答・同程度の処理時間にする（メールアドレスの登録有無を知られないため）
        if user.nil?
          BCrypt::Password.new(DUMMY_PASSWORD_DIGEST).is_password?(password.to_s)
          render_invalid_credentials
          return
        end

        if user.authenticate(password.to_s)
          Rails.logger.info "Authentication successful for user: #{user.id}" if Rails.env.development?
          user.track_sign_in! # sleeping mood 判定用に前回/今回のサインイン時刻を記録
          token = issue_tokens_for(user)
          render json: {
            status: 'success',
            message: 'ログインに成功しました。',
            token: token,
            user: user.as_json(only: %i[id email username]) # 必要に応じてユーザー情報を返す
          }, status: :ok
        else
          Rails.logger.info "Authentication failed for user: #{user.id}" if Rails.env.development?
          render_invalid_credentials
        end
      end

      # DELETE /api/v1/sessions
      def destroy
        token_value = cookies[:refresh_token]
        if token_value
          refresh_token = RefreshToken.find_active_by_token(token_value)
          refresh_token&.revoke!
        end

        cookies.delete(:refresh_token)

        render json: {
          status: 'success',
          message: 'ログアウトしました'
        }, status: :ok
      end

      private

      def render_invalid_credentials
        render json: {
          error: 'メールアドレスまたはパスワードが無効です',
          code: 'invalid_credentials'
        }, status: :unauthorized
      end
    end
  end
end
