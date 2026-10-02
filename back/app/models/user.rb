# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password validations: false # OAuth認証の場合はパスワード不要

  has_many :oauth_providers, dependent: :destroy
  has_many :achievements, dependent: :destroy # ユーザーが獲得した実績
  has_many :savings_goals, dependent: :destroy
  has_many :transactions, dependent: :destroy
  has_many :posts, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :bookmarks, dependent: :destroy
  has_many :budgets, dependent: :destroy
  has_many :refresh_tokens, dependent: :delete_all # 外部キーがあるため退会時に先に消す

  # 貯金関連のアソシエーション（transactions の中から income タイプを取得）
  has_many :savings, -> { where(transaction_type: 'income') }, class_name: 'Transaction'

  validates :username, presence: true, uniqueness: { case_sensitive: false }, length: { minimum: 3, maximum: 20 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, length: { minimum: 8 }, if: :password_required? # パスワード長を8文字に変更 (フロントエンドと合わせる)
  validates :unconfirmed_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_nil: true
  validate :unconfirmed_email_not_taken, if: :will_save_change_to_unconfirmed_email?

  after_create :setup_initial_achievements # ユーザー作成時に初期実績を生成

  # メールアドレスを確認しないままでもログインできる期間。過ぎたら確認するまでログインできない
  EMAIL_CONFIRMATION_GRACE_PERIOD = 7.days
  # 確認しないままのアカウントを残しておく期間。過ぎたら rake users:purge_unconfirmed で削除する
  UNCONFIRMED_RETENTION_PERIOD = 30.days

  # 確認メールのリンクに載せるトークン。メールアドレスが変わると無効になる
  generates_token_for :email_confirmation, expires_in: 24.hours do
    email
  end

  # メールアドレスの変更の確認リンクに載せるトークン。変更を申請し直すと（unconfirmed_email が変わると）無効になる
  generates_token_for :email_change, expires_in: 24.hours do
    unconfirmed_email
  end

  scope :unconfirmed_past_retention, lambda {
    where(email_confirmed_at: nil).where(created_at: ...UNCONFIRMED_RETENTION_PERIOD.ago)
  }

  def email_confirmed?
    email_confirmed_at.present?
  end

  # 確認せずにログインできる期限（確認済みなら nil）
  def email_confirmation_deadline
    return nil if email_confirmed?

    created_at + EMAIL_CONFIRMATION_GRACE_PERIOD
  end

  # 確認しないまま期限を過ぎたか。過ぎていればログイン・API の利用を止める
  def email_confirmation_expired?
    !email_confirmed? && email_confirmation_deadline.past?
  end

  def confirm_email!
    update_column(:email_confirmed_at, Time.current) unless email_confirmed?
  end

  # 変更を申請した新しいアドレスへ切り替える。新しいアドレスの持ち主が確認したので確認済みにする。
  # 申請から確認までの間に他のユーザーがそのアドレスを使い始めていたら切り替えず false を返す
  def confirm_email_change!
    with_lock do
      new_email = unconfirmed_email
      return false if new_email.blank? || User.where.not(id: id).exists?(email: new_email)

      now = Time.current
      update_columns(email: new_email, unconfirmed_email: nil, email_confirmed_at: now, updated_at: now)
    end
    true
  rescue ActiveRecord::RecordNotUnique # 確認と同時に他のユーザーが登録した
    false
  end

  # OAuthアカウントのみかどうか
  def oauth_only?
    oauth_providers.any? && password_digest.blank?
  end

  # サインイン時刻を記録する。last_sign_in_at には「前回」のサインイン時刻を
  # 保持し、フロントの sleeping mood（7日以上ぶりのログイン）判定に使う。
  # 初回サインインは前回がないため現在時刻を入れる（=経過0日で sleeping にしない）
  def track_sign_in!
    now = Time.current
    update_columns(last_sign_in_at: current_sign_in_at || now, current_sign_in_at: now)
  end

  # OAuthからユーザーを作成または検索
  def self.find_or_create_from_oauth(auth)
    # omniauth-google-oauth2 は Google が確認済みのアドレスだけを info.email に入れる（未確認なら nil）
    return nil unless auth&.info&.email

    # 既存のOAuthプロバイダーをチェック
    oauth_provider = OauthProvider.find_by(provider: auth.provider, uid: auth.uid)

    return oauth_provider.user if oauth_provider

    # 既存のユーザーをメールアドレスで検索
    user = User.find_by(email: auth.info.email)

    if user
      user.take_over_by_verified_owner! unless user.email_confirmed?
    else
      username = generate_username_from_email(auth.info.email)

      user = User.new(
        email: auth.info.email,
        username: username,
        name: auth.info.name || username,
        email_confirmed_at: Time.current # Google が確認済みのアドレスなので確認済みにする
      )

      user.save!(validate: false)
    end

    # OAuthプロバイダーの関連付けを作成
    begin
      user.oauth_providers.find_or_create_by!(
        provider: auth.provider,
        uid: auth.uid
      )
    rescue ActiveRecord::RecordNotUnique
      retry
    end

    user
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error "OAuth ユーザー作成エラー: #{e.message}"
    nil
  rescue StandardError => e
    Rails.logger.error "OAuth 予期しないエラー: #{e.message}"
    nil
  end

  # 未確認のアカウントは、アドレスの持ち主ではない人が先に登録した可能性がある。
  # Google がアドレスの持ち主だと確認したので、先に設定されたパスワードと全端末のログインを無効にしてから確認済みにする
  # （そのままつなぐと、先に登録した人がパスワードで持ち主の家計データを見られてしまう）。
  # 発行済みのアクセストークンは失効できないため、有効期限（30 分）までは使われうる
  def take_over_by_verified_owner!
    transaction do
      update_columns(password_digest: nil, email_confirmed_at: Time.current)
      revoke_all_refresh_tokens!
    end
  end

  TOKEN_EXPIRY_HOURS = 2

  def generate_password_reset_token!
    loop do
      token = SecureRandom.urlsafe_base64(32)
      unless User.exists?(reset_password_token: token)
        update_columns(reset_password_token: token, reset_password_sent_at: Time.current)
        return token
      end
    end
  end

  def password_reset_token_valid?
    reset_password_sent_at.present? &&
      reset_password_sent_at > TOKEN_EXPIRY_HOURS.hours.ago
  end

  def clear_password_reset_token!
    update_columns(reset_password_token: nil, reset_password_sent_at: nil)
  end

  # パスワードのリセット・変更後に、全端末のリフレッシュトークンを失効させる。
  # 漏れたトークンでログインし続けられないようにするため。戻り値は件数
  def revoke_all_refresh_tokens!
    refresh_tokens.where(revoked: false).update_all(revoked: true, updated_at: Time.current)
  end

  private

  # 申請中の新しいアドレスが他のユーザーに使われていないか（確認時にも改めて確かめる）
  def unconfirmed_email_not_taken
    return if unconfirmed_email.blank?

    errors.add(:unconfirmed_email, :taken) if User.where.not(id: id).exists?(email: unconfirmed_email)
  end

  def password_required?
    # 新規作成時でパスワードが設定されている場合は必須
    # OAuthユーザーの場合は不要
    return false if oauth_only?

    # 通常ユーザーの場合、新規作成時またはパスワード変更時は必須
    new_record? || !password.nil?
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

  def setup_initial_achievements
    achievement_service = AchievementService.new(self)
    achievement_service.create_initial_achievements
  end

  public

  def total_savings
    # ユーザーの総貯金額を計算するロジック
    savings.sum(:amount) || 0
  end

  def current_streak
    dates = income_transaction_dates
    return 0 if dates.empty?

    today = Date.current
    # 今日に記録があればそこから、なければ昨日から遡る
    start_date = dates.include?(today) ? today : today - 1.day
    return 0 unless dates.include?(start_date)

    streak = 0
    check_date = start_date
    while dates.include?(check_date)
      streak += 1
      check_date -= 1.day
    end
    streak
  end

  def longest_streak
    dates = income_transaction_dates
    return 0 if dates.empty?
    return 1 if dates.size == 1

    current = 1
    longest = 1
    dates[1..].each_with_index do |date, i|
      if date == dates[i] + 1.day
        current += 1
        longest = [longest, current].max
      else
        current = 1
      end
    end
    longest
  end

  def streak_status
    {
      current_streak: current_streak,
      longest_streak: longest_streak,
      last_record_date: transactions.where(transaction_type: 'income').maximum(:date)
    }
  end

  private

  def income_transaction_dates
    # date 列は date 型なので、そのまま Date として扱える
    transactions
      .where(transaction_type: 'income')
      .pluck(:date)
      .compact
      .uniq
      .sort
  end
end
