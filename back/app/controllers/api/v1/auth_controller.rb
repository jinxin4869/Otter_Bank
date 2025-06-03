class Api::V1::AuthController < ApplicationController
  include ActionController::Cookies
  skip_before_action :authorize_request, only: [:google, :google_callback]
  
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
      # フロントエンドへリダイレクト（トークンを含む）
      redirect_to "#{ENV['FRONTEND_URL']}/auth/callback?token=#{token}"
    else
      render json: { error: 'OAuth認証に失敗しました' }, status: :unprocessable_entity
    end
  end
end
