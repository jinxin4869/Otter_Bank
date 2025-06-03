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

  def authorize
    render json: { message: 'ログインが必要です' }, status: :unauthorized unless logged_in?
  end

  private
  
  def authorize_request
    header = request.headers['Authorization']
    token = header.split(' ').last if header
    
    begin
      if token
        @decoded = JsonWebToken.decode(token)
        if @decoded
          @current_user = User.find(@decoded[:user_id])
        else
          render json: { error: 'Invalid token payload' }, status: :unauthorized
        end
      else
       render json: { error: 'Authorization token not provided' }, status: :unauthorized
      end
    rescue ActiveRecord::RecordNotFound => e
      render json: { error: "User not found: #{e.message}" }, status: :unauthorized
    rescue JWT::ExpiredSignature => e
      render json: { error: "Token has expired: #{e.message}" }, status: :unauthorized
    rescue JWT::DecodeError => e
      render json: { error: "Invalid token: #{e.message}" }, status: :unauthorized
    end
  end
end