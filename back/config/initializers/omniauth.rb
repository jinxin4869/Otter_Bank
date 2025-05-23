Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'], {
    scope: 'email,profile',
    prompt: 'select_account'
  }
end

# CSRFトークン検証をスキップする設定（APIモードでは必要に応じて）
OmniAuth.config.allowed_request_methods = [:post, :get]