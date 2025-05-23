class Api::V1::GuestSessionsController < ApplicationController
  # 認証をスキップ（ゲストログインなのでログイン前の処理）
  skip_before_action :authorize_request, only: [:create], raise: false
  
  def create
    user = User.guest
    user.update(name: 'ゲストユーザー') if user.name != 'ゲストユーザー'
    
    # JWTトークンを生成
    token = encode_token(user_id: user.id)
    
    render json: { 
      status: :created, 
      logged_in: true, 
      user: user.as_json(except: [:password_digest]), 
      token: token 
    }
  end
  
  private
  
  # encode_tokenメソッドが親クラスにない場合はここで定義
  def encode_token(payload)
    JWT.encode(payload, ENV['JWT_SECRET'] || 'my_secret')
  end
end
