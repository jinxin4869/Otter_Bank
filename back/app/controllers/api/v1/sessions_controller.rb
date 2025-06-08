class Api::V1::SessionsController < ApplicationController
  skip_before_action :authorize_request, only: [:create]

  # POST /api/v1/sessions
  def create
    user = User.find_by(email: params[:email])

    if user.nil?
      render json: { 
        status: 'error',
        error: 'アカウントが見つかりません',
        code: 'account_not_found'
      }, status: :not_found
      return
    end

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        status: 'success',
        message: 'ログインに成功しました。',
        token: token,
        user: user.as_json(only: [:id, :email, :username]) # 必要に応じてユーザー情報を返す
      }, status: :ok
    else
      render json: { 
        status: 'error', 
        error: 'メールアドレスまたはパスワードが無効です',
        code: 'invalid_credentials'
      }, status: :unauthorized
    end
  end
end
