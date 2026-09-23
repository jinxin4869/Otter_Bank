# frozen_string_literal: true

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
           ENV.fetch('GOOGLE_CLIENT_ID', nil),
           ENV.fetch('GOOGLE_CLIENT_SECRET', nil),
           {
             # Google から戻る先を、ルーティング（api/v1/auth/google/callback）と一致させる。
             # Google Cloud Console の「承認済みのリダイレクト URI」にも同じパスを登録する必要がある
             callback_path: '/api/v1/auth/google/callback',
             scope: 'email,profile',
             access_type: 'offline',
             include_granted_scopes: true
           }
end

OmniAuth.config.allowed_request_methods = %i[post get]
OmniAuth.config.silence_get_warning = true
OmniAuth.config.logger = Rails.logger
OmniAuth.config.failure_raise_out_environments = []

# 失敗・キャンセル時はフロントのログイン画面へ戻す。外部から渡された文字列は画面に出さず、固定の種類だけを渡す
OmniAuth.config.on_failure = proc do |env|
  error_type = env['omniauth.error.type'].to_s
  reason = error_type == 'access_denied' ? 'cancelled' : 'failed'
  Rails.logger.warn "OAuth認証失敗: type=#{error_type}"
  location = "#{ENV.fetch('FRONTEND_URL', nil)}/login?oauth_error=#{reason}"
  [302, { 'Location' => location, 'Content-Type' => 'text/html' }, []]
end
