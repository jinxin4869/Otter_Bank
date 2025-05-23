class User < ApplicationRecord
    skip_before_action :authorize_request, only: [:login, :oauth_callback]

  # 通常のメール/パスワード認証
  def login
    user = User.find_by(email: params[:email])
    
    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      render json: { token: token, user: UserSerializer.new(user) }, status: :ok
    else
      render json: { error: '認証に失敗しました' }, status: :unauthorized
    end
  end

  # OAuth認証コールバック
  def oauth_callback
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
