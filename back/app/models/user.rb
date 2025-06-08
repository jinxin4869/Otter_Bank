class User < ApplicationRecord
    has_secure_password validations: false # OAuth認証の場合はパスワード不要

    has_many :oauth_providers, dependent: :destroy
    has_many :achievements, dependent: :destroy # ユーザーが獲得した実績

    validates :username, presence: true, uniqueness: { case_sensitive: false }, length: { minimum: 3, maximum: 20 }
    validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
    validates :password, presence: true, length: { minimum: 8 }, if: :password_required? # パスワード長を8文字に変更 (フロントエンドと合わせる)

    after_create :create_initial_achievements # ユーザー作成時に初期実績を生成

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

  def create_initial_achievements
    # アプリでの実績一覧
    # 実際のDBテーブルから読み込むとかしたいのですが、どうすればいいかわかりません。
    # いったん、sampleAchievementsの内容を持ってくる。

    defined_achievements_data = [
      { id: 1, title: "初めての一歩", description: "初めて貯金をしました", category: "savings", imageUrl: "/placeholder.svg?height=120&width=120&text=First+Step", reward: "カワウソの基本表情", tier: 1 },
      { id: 2, title: "千円貯金", description: "累計1,000円を貯金しました", category: "savings", imageUrl: "/placeholder.svg?height=120&width=120&text=1000+Yen", reward: "カワウソの笑顔", tier: 2 },
      { id: 3, title: "一万円クラブ", description: "累計10,000円を貯金しました", category: "savings", imageUrl: "/placeholder.svg?height=120&width=120&text=10000+Yen", reward: "カワウソの新しい帽子", tier: 3 },
      { id: 4, title: "貯金の達人", description: "累計30,000円を貯金しました", category: "savings", imageUrl: "/placeholder.svg?height=120&width=120&text=30000+Yen", reward: "カワウソの新しい環境", tier: 4 },
      { id: 5, title: "十万円達成", description: "累計100,000円を貯金しました", category: "savings", imageUrl: "/placeholder.svg?height=120&width=120&text=100K+Yen", reward: "カワウソの特別な環境", tier: 5 },
      { id: 6, title: "半分ミリオネア", description: "累計500,000円を貯金しました", category: "savings", imageUrl: "/placeholder.svg?height=120&width=120&text=500K+Yen", reward: "銀のカワウソ像", tier: 6 },
      { id: 7, title: "ミリオネア", description: "累計1,000,000円を貯金しました", category: "savings", imageUrl: "/placeholder.svg?height=120&width=120&text=Millionaire", reward: "金のカワウソ像", tier: 7 },

      # 継続は力なりシリーズ
      { id: 50, title: "初日の決意", description: "1日連続でアプリを使用しました", category: "streak", imageUrl: "/placeholder.svg?height=120&width=120&text=Day+1", reward: "継続バッジ（初級）", tier: 1 },
      { id: 51,  title: "一週間の慣れ", description: "7日連続でアプリを使用しました", category: "streak", imageUrl: "/placeholder.svg?height=120&width=120&text=Week+1", reward: "カワウソのカレンダー", tier:2 },
      { id: 52, title: "10日間の継続", description: "10日連続でアプリを使用しました", category: "streak", imageUrl: "/placeholder.svg?height=120&width=120&text=10+Days", reward: "継続バッジ（中級）", tier: 3 },
      { id: 53, title: "半月の努力", description: "15日連続でアプリを使用しました", category: "streak", imageUrl: "/placeholder.svg?height=120&width=120&text=15+Days", reward: "カワウソの特別衣装", tier: 4 },
      { id: 54, title: "継続の達人", description: "30日連続でアプリを使用しました", category: "streak", imageUrl: "/placeholder.svg?height=120&width=120&text=30+Days", reward: "継続バッジ（金）とカワウソの王冠", tier: 5 },

      # 節約の達人シリーズ
      { id: 100, title: "節約の始まり", description: "1ヶ月の支出を前月より10%削減しました", category: "expense", imageUrl: "/placeholder.svg?height=120&width=120&text=Save+10%", reward: "節約バッジ（銅）", tier: 1},
      { id: 101,  title: "節約の実践者",  description: "1ヶ月の支出を前月より20%削減しました",  category: "expense", imageUrl: "/placeholder.svg?height=120&width=120&text=Save+20%",  reward: "節約バッジ（銀）",  tier: 2 },
      { id: 102,  title: "節約の達人",  description: "1ヶ月の支出を前月より30%削減しました",  category: "expense", imageUrl: "/placeholder.svg?height=120&width=120&text=Save+30%",  reward: "節約バッジ（金）",  tier: 3 },

      # 特別な実績
      { id: 150, title: "予算マスター", description: "3ヶ月連続で予算内に収まりました", category: "special", imageUrl: "/placeholder.svg?height=120&width=120&text=Budget+Master", reward: "予算管理バッジ" },
      { id: 151, title: "投資家デビュー", description: "初めての投資を行いました", category: "special", imageUrl: "/placeholder.svg?height=120&width=120&text=Investor", reward: "投資家バッジ" },
      { id: 152, title: "完璧な記録", description: "1ヶ月間毎日支出を記録しました", category: "special", imageUrl: "/placeholder.svg?height=120&width=120&text=Perfect+Record", reward: "記録キーパーバッジ" },
      { id: 153, title: "目標達成者", description: "設定した貯金目標を達成しました", category: "special", imageUrl: "/placeholder.svg?height=120&width=120&text=Goal+Achiever", reward: "目標達成バッジ" },
      { id: 154, title: "分析の達人", description: "すべての分析レポートを確認しました", category: "special", imageUrl: "/placeholder.svg?height=120&width=120&text=Analyst", reward: "分析バッジ" }
    ]

  defined_achievements_data.each do |ach_data|
      attributes_to_create = {
        original_achievement_id: ach_data[:id],
        title: ach_data[:title],
        description: ach_data[:description],
        category: ach_data[:category].to_s,
        image_url: ach_data[:imageUrl],
        reward: ach_data[:reward],
        tier: ach_data[:tier],
        unlocked: false, # 初期状態は未解除
        progress: 0      # 初期進捗は0
      }
      self.achievements.create!(attributes_to_create)
    end
  end
end