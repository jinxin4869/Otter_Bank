# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ExceptionHandler
  include ActionController::Cookies

  before_action :authorize_request

  attr_reader :current_user

  # コントローラーから統一的にアクセスするためのヘルパー（エイリアス）
  alias current_api_v1_user current_user

  private

  # ログイン・登録時にアクセストークンを発行して返し、リフレッシュトークンを HttpOnly cookie に書き込む
  def issue_tokens_for(user)
    issue_refresh_token_for(user)
    JsonWebToken.encode(user_id: user.id)
  end

  # リフレッシュトークンだけを発行して HttpOnly cookie に書き込む
  def issue_refresh_token_for(user)
    write_refresh_token_cookie(RefreshToken.generate_for(user).token)
  end

  # Authorization ヘッダーの Bearer トークン（ヘッダーが無ければ nil）
  def bearer_token
    request.headers['Authorization']&.split&.last
  end

  # トークンを復号してユーザーを返す。JWT のエラーと RecordNotFound は呼び出し元で扱う
  def user_from_token!(token)
    User.find(JsonWebToken.decode(token)[:user_id])
  end

  # 認証が任意のアクション用。トークンが無い・不正・ユーザーが存在しない場合は nil
  def optional_current_user
    token = bearer_token
    token && user_from_token!(token)
  rescue StandardError
    nil
  end

  # 自分のユーザー情報として返す JSON
  def user_json(user)
    { id: user.id, email: user.email, username: user.username, name: user.name }
  end

  def write_refresh_token_cookie(token)
    cookies[:refresh_token] = refresh_token_cookie_attributes.merge(value: token, expires: 14.days.from_now)
  end

  # 削除の Set-Cookie にも発行時と同じ属性を付ける（本番はクロスサイトなので SameSite=None; Secure が無いと無視されうる）
  def delete_refresh_token_cookie
    cookies.delete(:refresh_token, refresh_token_cookie_attributes)
  end

  def refresh_token_cookie_attributes
    { httponly: true, secure: Rails.env.production?, same_site: Rails.env.production? ? :none : :lax }
  end

  # 認証不要のアクションは各コントローラーで skip_before_action :authorize_request, only: [...] を指定する
  def authorize_request
    token = bearer_token
    Rails.logger.info "Token: #{token.present? ? 'present' : 'missing'}" if Rails.env.development?

    # 401 の code はフロントが「期限切れなら更新して再試行」を判断するために使う（auth#verify と同じ値）
    begin
      if token
        @current_user = user_from_token!(token)
        Rails.logger.info "Current user set: #{Rails.env.development? ? @current_user.id : '[MASKED]'}"
      else
        Rails.logger.error 'Authorization token not provided' if Rails.env.development?
        render json: { error: '認証トークンが指定されていません', code: 'missing_header' }, status: :unauthorized
      end
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error "User not found: #{Rails.env.development? ? e.message : '[MASKED]'}"
      render json: { error: 'ユーザーが見つかりません', code: 'user_not_found' }, status: :unauthorized
    rescue JWT::ExpiredSignature => e
      Rails.logger.error "Token has expired: #{Rails.env.development? ? e.message : '[MASKED]'}"
      render json: { error: 'トークンの有効期限が切れています', code: 'token_expired' }, status: :unauthorized
    rescue JWT::DecodeError => e
      Rails.logger.error "Invalid token: #{Rails.env.development? ? e.message : '[MASKED]'}"
      render json: { error: '無効なトークンです', code: 'invalid_token' }, status: :unauthorized
    end
  end
end
