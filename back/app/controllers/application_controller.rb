class ApplicationController < ActionController::API
  include ExceptionHandler
  
  before_action :authorize_request
  
  def encode_token(payload)
    JWT.encode(payload, ENV['JWT_SECRET'] || 'my_secret')
  end

  def auth_header
    request.headers['Authorization']
  end

  def decoded_token
    if auth_header
      token = auth_header.split(' ')[1]
      begin
        JWT.decode(token, ENV['JWT_SECRET'] || 'my_secret', true, algorithm: 'HS256')
      rescue JWT::DecodeError
        nil
      end
    end
  end

  def current_user
    if decoded_token
      user_id = decoded_token[0]['user_id']
      @user = User.find_by(id: user_id)
    end
  end

  def logged_in?
    !!current_user
  end

  # authorize メソッドを追加して統一
  def authorize
    render json: { message: 'ログインが必要です' }, status: :unauthorized unless logged_in?
  end

  private
  
  def authorize_request
    # 特定のエンドポイントではスキップ
    return if skip_authorization?
    
    header = request.headers['Authorization']
    token = header.split(' ').last if header
    
    Rails.logger.info "Authorization header: #{header.present? ? 'present' : 'missing'}" if Rails.env.development?
    Rails.logger.info "Token: #{token.present? ? 'present' : 'missing'}" if Rails.env.development?
    
    begin
      if token
        @decoded = JsonWebToken.decode(token)
        Rails.logger.info "Decoded token: #{Rails.env.development? ? @decoded : '[MASKED]'}"
        if @decoded
          @current_user = User.find(@decoded[:user_id])
          Rails.logger.info "Current user set: #{Rails.env.development? ? @current_user.id : '[MASKED]'}"
        else
          Rails.logger.error "Invalid token payload" if Rails.env.development?
          render json: { error: 'Invalid token payload' }, status: :unauthorized
        end
      else
        Rails.logger.error "Authorization token not provided" if Rails.env.development?
       render json: { error: 'Authorization token not provided' }, status: :unauthorized
      end
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error "User not found: #{Rails.env.development? ? e.message : '[MASKED]'}"
      render json: { error: "User not found: #{e.message}" }, status: :unauthorized
    rescue JWT::ExpiredSignature => e
      Rails.logger.error "Token has expired: #{Rails.env.development? ? e.message : '[MASKED]'}"
      render json: { error: "Token has expired: #{e.message}" }, status: :unauthorized
    rescue JWT::DecodeError => e
      Rails.logger.error "Invalid token: #{Rails.env.development? ? e.message : '[MASKED]'}"
      render json: { error: "Invalid token: #{e.message}" }, status: :unauthorized
    end
  end
  
  def skip_authorization?
    # 認証をスキップするアクションを定義
    false
  end
end