# frozen_string_literal: true

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
           ENV.fetch('GOOGLE_CLIENT_ID', nil),
           ENV.fetch('GOOGLE_CLIENT_SECRET', nil),
           {
             scope: 'email,profile',
             access_type: 'offline',
             include_granted_scopes: true
           }
end

OmniAuth.config.allowed_request_methods = %i[post get]
OmniAuth.config.silence_get_warning = true
OmniAuth.config.logger = Rails.logger
OmniAuth.config.failure_raise_out_environments = []
