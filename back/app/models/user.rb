class User < ApplicationRecord
    has_secure_password validations: false # OAuth認証の場合はパスワード不要

    has_many :oauth_providers, dependent: :destroy
    has_many :achievements, dependent: :destroy # ユーザーが獲得した実績
    has_many :savings_goals, dependent: :destroy

    validates :username, presence: true, uniqueness: { case_sensitive: false }, length: { minimum: 3, maximum: 20 }
    validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
    validates :password, presence: true, length: { minimum: 8 }, if: :password_required? # パスワード長を8文字に変更 (フロントエンドと合わせる)

    after_create :setup_initial_achievements # ユーザー作成時に初期実績を生成

    # OAuthアカウントのみかどうか
  def oauth_only?
    oauth_providers.any? && !password_digest.present?
  end

  # アカウントロック状態を確認するメソッド
  def locked?
    false  # デフォルトではロックされていない
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

  private

  def password_required
    password_digest.present? || !password.nil?
  end

  def setup_initial_achievements
    achievement_service = AchievementService.new(self)
    achievement_service.create_initial_achievements
  end

  def total_savings
    # ユーザーの総貯金額を計算するロジック
    savings.sum(:amount)
  end

  def current_streak
    return 0 if savings.empty?

    today = Date.current
    streak = 0
    current_date = today

    # 今日の記録があるか確認
    has_today_record = savings.exists?(created_at: today.beginning_of_day..today.end_of_day)
    
    # 昨日までの記録を確認
    while true
      has_record = savings.exists?(created_at: current_date.beginning_of_day..current_date.end_of_day)
      
      if has_record
        streak += 1
        current_date -= 1.day
      else
        break
      end
    end

    # 今日の記録がある場合は1を加算
    streak += 1 if has_today_record

    streak
  end

  def longest_streak
    return 0 if savings.empty?

    dates = savings.pluck(:created_at).map(&:to_date).uniq.sort
    return 0 if dates.empty?

    current_streak = 1
    longest_streak = 1
    previous_date = dates.first

    dates[1..].each do |date|
      if date == previous_date + 1.day
        current_streak += 1
        longest_streak = [longest_streak, current_streak].max
      else
        current_streak = 1
      end
      previous_date = date
    end

    longest_streak
  end

  def streak_status
    {
      current_streak: current_streak,
      longest_streak: longest_streak,
      last_record_date: savings.last&.created_at&.to_date
    }
  end
end