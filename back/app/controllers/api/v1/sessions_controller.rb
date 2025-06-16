class Api::V1::SessionsController < ApplicationController
  skip_before_action :authorize_request, only: [:create]

  # POST /api/v1/sessions
  def create
    # パラメータが直接送信される場合とsessionネストの両方に対応
    email = params[:email] || params[:session]&.[](:email)
    password = params[:password] || params[:session]&.[](:password)
    
    Rails.logger.info "Login attempt with email: #{email}" if Rails.env.development?
    
    user = User.find_by(email: email)

    if user.nil?
      Rails.logger.info "User not found for email: #{email}" if Rails.env.development?
      render json: { 
        status: 'error',
        error: 'アカウントが見つかりません',
        code: 'account_not_found'
      }, status: :not_found
      return
    end

    # パスワード認証のデバッグログ
    Rails.logger.info "User found: #{user.email}, has password_digest: #{user.password_digest.present?}" if Rails.env.development?
    Rails.logger.info "OAuth providers count: #{user.oauth_providers.count}" if Rails.env.development?
    Rails.logger.info "Password provided: #{!password.nil? && !password.empty?}" if Rails.env.development?

    if user&.authenticate(password)
      Rails.logger.info "Authentication successful for user: #{user.email}" if Rails.env.development?
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        status: 'success',
        message: 'ログインに成功しました。',
        token: token,
        user: user.as_json(only: [:id, :email, :username]) # 必要に応じてユーザー情報を返す
      }, status: :ok
    else
      Rails.logger.info "Authentication failed for user: #{user.email}" if Rails.env.development?
      render json: { 
        status: 'error', 
        error: 'メールアドレスまたはパスワードが無効です',
        code: 'invalid_credentials'
      }, status: :unauthorized
    end
  end
end
