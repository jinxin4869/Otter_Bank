# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApplicationController
      def skip_authorization?
        action_name.in?(%w[google google_callback verify refresh])
      end

      # Googleログインへのリダイレクト
      def google
        redirect_to '/auth/google_oauth2'
      end

      # Google OAuth2コールバック処理
      def google_callback
        auth = request.env['omniauth.auth']
        user = User.find_or_create_from_oauth(auth)

        if user
          user.track_sign_in! # sleeping mood 判定用に前回/今回のサインイン時刻を記録
          token = issue_tokens_for(user)
          # フロントエンドへリダイレクト（トークンを含む）
          callback_url = "#{ENV.fetch('FRONTEND_URL', nil)}/auth/callback?token=#{token}"
          redirect_to callback_url, allow_other_host: true
        else
          render json: { error: 'OAuth認証に失敗しました' }, status: :unprocessable_content
        end
      end

      def verify
        token = bearer_token
        unless token
          render json: { error: 'Authorizationヘッダーがありません', code: 'missing_header' }, status: :unauthorized
          return
        end

        user = user_from_token!(token)
        # last_sign_in_at は sleeping mood 判定に使う前回サインイン時刻
        render json: user_json(user).merge(last_sign_in_at: user.last_sign_in_at), status: :ok
      rescue JWT::ExpiredSignature
        render json: { error: 'トークンの有効期限が切れています', code: 'token_expired' }, status: :unauthorized
      rescue JWT::DecodeError => e
        # 復号エラーの詳細は返さず、開発環境のログにだけ出す
        Rails.logger.warn("JWT復号エラー: #{e.message}") if Rails.env.development?
        render json: { error: '無効なトークンです', code: 'invalid_token' }, status: :unauthorized
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'ユーザーが見つかりません', code: 'user_not_found' }, status: :unauthorized
      end

      # リフレッシュトークンを使ってアクセストークンを再発行する
      def refresh
        token_value = cookies[:refresh_token]

        unless token_value
          render json: { error: 'リフレッシュトークンが必要です', code: 'missing_refresh_token' }, status: :bad_request
          return
        end

        new_token = nil
        new_refresh_token = nil

        ActiveRecord::Base.transaction do
          refresh_token = RefreshToken.find_active_by_token(token_value)

          unless refresh_token
            render json: { error: 'リフレッシュトークンが無効または期限切れです', code: 'invalid_refresh_token' },
                   status: :unauthorized
            raise ActiveRecord::Rollback
          end

          user = refresh_token.user
          user.track_sign_in! # アプリ再訪も「サインイン」とみなし、前回来訪時刻を更新する
          refresh_token.revoke!
          new_token = JsonWebToken.encode(user_id: user.id)
          new_refresh_token = RefreshToken.generate_for(user)
        end

        return unless new_token

        write_refresh_token_cookie(new_refresh_token.token)

        render json: {
          token: new_token
        }, status: :ok
      end
    end
  end
end
