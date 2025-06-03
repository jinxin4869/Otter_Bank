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
    return nil unless auth&.info&.email

    # 既存のOAuthプロバイダーをチェック
    oauth_provider = OauthProvider.find_by(provider: auth.provider, uid: auth.uid)
    
    if oauth_provider
      return oauth_provider.user
    end

    # 既存のユーザーをメールアドレスで検索
    user = User.find_by(email: auth.info.email)
    
    unless user
      username = generate_username_from_email(auth.info.email)
      
      user = User.new(
        email: auth.info.email,
        username: username,
        name: auth.info.name || username
      )
      
      user.save!(validate: false)
    end

    # OAuthプロバイダーの関連付けを作成（重複チェック）
    unless user.oauth_providers.exists?(provider: auth.provider, uid: auth.uid)
      user.oauth_providers.create!(
        provider: auth.provider,
        uid: auth.uid
      )
    end

    user
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error "OAuth ユーザー作成エラー: #{e.message}"
    nil
  rescue => e
    Rails.logger.error "OAuth 予期しないエラー: #{e.message}"
    nil
  end

  private

  def password_required?
    # OAuth認証の場合はパスワードを必須にしない
    return false if oauth_only?
    true
  end

  def self.generate_username_from_email(email)
    base_username = email.split('@').first
    username = base_username
    counter = 1
    
    # ユニークなusernameを生成
    while User.exists?(username: username)
      username = "#{base_username}#{counter}"
      counter += 1
    end
    
    # 最低3文字を保証
    username.length >= 3 ? username : "#{username}#{SecureRandom.hex(2)}"
  end
end
