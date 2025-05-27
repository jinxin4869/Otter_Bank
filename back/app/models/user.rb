class User < ApplicationRecord
    has_secure_password validations: false # OAuth認証の場合はパスワード不要

    has_many :oauth_providers, dependent: :destroy

    validates :username, presence: true, uniqueness: { case_sensitive: false }, length: { minimum: 3, maximum: 20 }
    validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
    validates :password, presence: true, length: { minimum: 8 }, if: :password_required? # パスワード長を8文字に変更 (フロントエンドと合わせる)



    # ゲストユーザーを生成または取得するクラスメソッド
  def self.guest
    find_or_create_by!(email: 'demo@example.com') do |user|
      user.password = SecureRandom.urlsafe_base64
      user.name = 'ゲストユーザー'
      # 必要に応じて他の属性も設定
    end
  end

    # OAuthアカウントのみかどうか
  def oauth_only?
    oauth_providers.any? && !password_digest.present?
  end

  # OAuthからユーザーを作成または検索
  def self.find_or_create_from_oauth(auth)
    # 既存のOAuthプロバイダーを検索
    oauth = OauthProvider.find_by(provider: auth.provider, uid: auth.uid)
    return oauth.user if oauth.present?
    
    # メールアドレスでユーザーを検索
    user = User.find_by(email: auth.info.email)
    
    if user
      # 既存ユーザーにOAuthプロバイダーを追加
      user.oauth_providers.create(
        provider: auth.provider,
        uid: auth.uid,
        access_token: auth.credentials.token,
        refresh_token: auth.credentials.refresh_token,
        expires_at: auth.credentials.expires_at ? Time.at(auth.credentials.expires_at) : nil
      )
    else
      # 新規ユーザーを作成
      user = User.create!(
        email: auth.info.email,
        name: auth.info.name,
        password: SecureRandom.hex(10) # ランダムパスワード
      )
      user.oauth_providers.create(
        provider: auth.provider,
        uid: auth.uid,
        access_token: auth.credentials.token,
        refresh_token: auth.credentials.refresh_token,
        expires_at: auth.credentials.expires_at ? Time.at(auth.credentials.expires_at) : nil
      )
    end
    
    user
  end

  private

  def password_required?
    # OAuth認証の場合はパスワードを必須にしない
    return false if oauth_only?
    true
  end
end
