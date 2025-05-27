class Api::V1::SessionsController < ApplicationController
  skip_before_action :authorize_request, only: [:create]

  # POST /api/v1/sessions
  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:session][:password])
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
        error: 'メールアドレスまたはパスワードが無効です' 
      }, status: :unauthorized
    end
  end

  # DELETE /api/v1/sessions (ログアウト処理の例)
  # def destroy
  #   # トークン無効化処理など (JWTはステートレスなのでクライアント側でトークンを削除するのが一般的)
  #   render json: { message: 'ログアウトしました' }, status: :ok
  # end
end
