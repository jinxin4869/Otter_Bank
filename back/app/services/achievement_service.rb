class AchievementService
  def initialize(user)
    @user = user
  end

  # 貯金関連の実績を更新
  def update_savings_achievements(amount)
    achievements = @user.achievements.where(category: :savings, unlocked: false)
    
    achievements.each do |achievement|
      case achievement.original_achievement_id
      when 'first_savings'
        achievement.update_progress(1) if amount > 0
      when 'savings_milestone_1000'
        achievement.update_progress(amount)
      when 'savings_milestone_10000'
        achievement.update_progress(amount)
      when 'savings_milestone_100000'
        achievement.update_progress(amount)
      end
    end
  end

  # 連続記録の実績を更新
  def update_streak_achievements(days)
    achievements = @user.achievements.where(category: :streak, unlocked: false)
    
    achievements.each do |achievement|
      case achievement.original_achievement_id
      when 'streak_3_days'
        achievement.update_progress(days)
      when 'streak_7_days'
        achievement.update_progress(days)
      when 'streak_30_days'
        achievement.update_progress(days)
      end
    end
  end

  # マイルストーンの実績を更新
  def update_milestone_achievements(total_savings)
    achievements = @user.achievements.where(category: :milestone, unlocked: false)
    
    achievements.each do |achievement|
      case achievement.original_achievement_id
      when 'total_savings_1000'
        achievement.update_progress(total_savings)
      when 'total_savings_10000'
        achievement.update_progress(total_savings)
      when 'total_savings_100000'
        achievement.update_progress(total_savings)
      end
    end
  end

  # 新規ユーザーに初期実績を作成
  def create_initial_achievements
    initial_achievements = [
      {
        original_achievement_id: 'first_savings',
        title: '初めての貯金',
        description: '初めて貯金を記録しました',
        category: :savings,
        tier: :bronze,
        progress_target: 1,
        image_url: '/achievements/first_savings.png'
      },
      {
        original_achievement_id: 'savings_milestone_1000',
        title: '貯金マスター',
        description: '1,000円の貯金を達成',
        category: :savings,
        tier: :silver,
        progress_target: 1000,
        image_url: '/achievements/savings_1000.png'
      },
      {
        original_achievement_id: 'streak_3_days',
        title: '継続は力なり',
        description: '3日連続で貯金を記録',
        category: :streak,
        tier: :bronze,
        progress_target: 3,
        image_url: '/achievements/streak_3.png'
      }
    ]

    initial_achievements.each do |achievement_data|
      @user.achievements.create!(achievement_data)
    end
  end
end 