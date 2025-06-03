class Api::V1::AuthController < ApplicationController
  include ActionController::Cookies
  skip_before_action :authorize_request, only: [:google, :google_callback, :auth_failure]
  
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

  # OAuth認証失敗時の処理
  def auth_failure
    error_type = params[:error] || params[:strategy] || 'unknown'
    error_message = params[:message] || params[:error_description] || 'Authentication failed'
    
    Rails.logger.error "OAuth認証失敗: #{error_type} - #{error_message}"
    Rails.logger.error "失敗パラメータ: #{params.inspect}"
    
    # invalid_grant エラーの場合は再試行を促す
    if error_message.include?('invalid_grant') || error_message.include?('invalid_credentials')
      redirect_to "#{ENV['FRONTEND_URL']}/auth/retry?error=#{error_message}"
    elsif error_type == 'access_denied' || error_message.include?('cancel')
      redirect_to "#{ENV['FRONTEND_URL']}/auth/cancelled"
    else
      redirect_to "#{ENV['FRONTEND_URL']}/auth/error?message=#{error_message}"
    end
  end
end
