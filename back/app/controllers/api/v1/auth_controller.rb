# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApplicationController
      include ActionController::Cookies

      skip_before_action :authorize_request, only: %i[google google_callback auth_failure verify logout refresh]

      # Googleログインへのリダイレクト
      def google
        redirect_to '/auth/google_oauth2'
      end

      # Google OAuth2コールバック処理
      def google_callback
        auth = request.env['omniauth.auth']
        user = User.find_or_create_from_oauth(auth)

        if user
          token = JsonWebToken.encode(user_id: user.id)
          refresh_token = RefreshToken.generate_for(user)
          # フロントエンドへリダイレクト（トークンを含む）
          callback_url = "#{ENV.fetch('FRONTEND_URL', nil)}/auth/callback" \
                         "?token=#{token}&refresh_token=#{refresh_token.token}"
          redirect_to callback_url
        else
          render json: { error: 'OAuth認証に失敗しました' }, status: :unprocessable_entity
        end
      end

      # OAuth認証失敗時の処理
      def auth_failure
        error_type = params[:error] || params[:strategy] || 'unknown'
        error_message = params[:message] || params[:error_description] || 'Authentication failed'

        Rails.logger.error "OAuth認証失敗: #{error_type} - #{error_message}"
        Rails.logger.error "失敗パラメータ: #{params.inspect}"

        # invalid_grant エラーの場合は再試行を促す
        if error_message.include?('invalid_grant') || error_message.include?('invalid_credentials')
          redirect_to "#{ENV.fetch('FRONTEND_URL', nil)}/auth/retry?error=#{error_message}"
        elsif error_type == 'access_denied' || error_message.include?('cancel')
          redirect_to "#{ENV.fetch('FRONTEND_URL', nil)}/auth/cancelled"
        else
          redirect_to "#{ENV.fetch('FRONTEND_URL', nil)}/auth/error?message=#{error_message}"
        end
      end

      def verify
        header = request.headers['Authorization']
        if header
          token = header.split.last
          begin
            decoded = JsonWebToken.decode(token)
            @current_user = User.find(decoded[:user_id])
            render json: {
              id: @current_user.id,
              email: @current_user.email,
              username: @current_user.username,
              name: @current_user.name
            }, status: :ok
          rescue JWT::ExpiredSignature
            render json: { error: 'Token has expired', code: 'token_expired' }, status: :unauthorized
          rescue JWT::DecodeError => e
            render json: { error: 'Invalid token', code: 'invalid_token', details: e.message }, status: :unauthorized
          rescue ActiveRecord::RecordNotFound
            render json: { error: 'User not found', code: 'user_not_found' }, status: :unauthorized
          end
        else
          render json: { error: 'Authorization header missing', code: 'missing_header' }, status: :unauthorized
        end
      end

      # リフレッシュトークンを使ってアクセストークンを再発行する
      def refresh
        token_value = params[:refresh_token]

        unless token_value
          render json: { error: 'リフレッシュトークンが必要です', code: 'missing_refresh_token' }, status: :bad_request
          return
        end

        new_token = nil
        new_refresh_token = nil

        ActiveRecord::Base.transaction do
          refresh_token = RefreshToken.lock.find_by(token: token_value)

          unless refresh_token&.active?
            render json: { error: 'リフレッシュトークンが無効または期限切れです', code: 'invalid_refresh_token' },
                   status: :unauthorized
            raise ActiveRecord::Rollback
          end

          user = refresh_token.user
          refresh_token.revoke!
          new_token = JsonWebToken.encode(user_id: user.id)
          new_refresh_token = RefreshToken.generate_for(user)
        end

        return unless new_token

        render json: {
          token: new_token,
          refresh_token: new_refresh_token.token
        }, status: :ok
      end

      # ログアウト処理
      def logout
        token_value = params[:refresh_token]
        if token_value
          refresh_token = RefreshToken.find_by(token: token_value)
          refresh_token&.revoke!
        end

        render json: {
          status: 'success',
          message: 'ログアウトしました'
        }, status: :ok
      end
    end
  end
end
