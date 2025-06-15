class AchievementService
  def initialize(user)
    @user = user
  end

  # 新規ユーザーに初期実績を作成
  def create_initial_achievements
    initial_achievements = [
      # 貯金関連実績
      {
        original_achievement_id: 'first_savings',
        title: '初めての貯金',
        description: '最初の貯金を記録しました',
        category: :savings,        # シンボルを使用
        tier: :bronze,            # シンボルを使用
        progress_target: 1,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/first_savings.png',
        reward: 'カワウソステッカー'
      },
      {
        original_achievement_id: 'savings_milestone_1000',
        title: '生活の足しに',
        description: '1,000円の貯金を達成しました',
        category: :savings,
        tier: :bronze,
        progress_target: 1000,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/savings_1000.png',
        reward: '貯金バッジ'
      },
      {
        original_achievement_id: 'savings_milestone_5000',
        title: '月末までの一安心',
        description: '5,000円の貯金を達成しました',
        category: :savings,
        tier: :silver,
        progress_target: 5000,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/savings_5000.png',
        reward: '金の貯金箱'
      },
      {
        original_achievement_id: 'savings_milestone_10000',
        title: '小さな贅沢',
        description: '10,000円の貯金を達成しました',
        category: :savings,
        tier: :silver,
        progress_target: 10000,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/savings_10000.png',
        reward: 'シルバーカワウソ'
      },
      {
        original_achievement_id: 'savings_milestone_30000',
        title: '大きな一歩',
        description: '30,000円の貯金を達成しました',
        category: :savings,
        tier: :gold,
        progress_target: 30000,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/savings_30000.png',
        reward: 'ゴールドカワウソ'
      },

      # 連続記録関連実績
      {
        original_achievement_id: 'streak_3_days',
        title: '継続は力なり',
        description: '3日連続で貯金を記録しました',
        category: :streak,
        tier: :bronze,
        progress_target: 3,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/streak_3.png',
        reward: '連続記録バッジ'
      },
      {
        original_achievement_id: 'streak_7_days',
        title: '一週間の習慣',
        description: '7日連続で貯金を記録しました',
        category: :streak,
        tier: :silver,
        progress_target: 7,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/streak_7.png',
        reward: 'ウィークリートロフィー'
      },
      {
        original_achievement_id: 'streak_30_days',
        title: '貯金習慣マスター',
        description: '30日連続で貯金を記録しました',
        category: :streak,
        tier: :gold,
        progress_target: 30,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/streak_30.png',
        reward: '連続記録トロフィー'
      },

      # 支出管理関連実績
      {
        original_achievement_id: 'budget_first_set',
        title: '予算の第一歩',
        description: '初めての予算を設定しました',
        category: :expense,       # シンボルを使用
        tier: :bronze,
        progress_target: 1,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/budget_first.png',
        reward: '予算管理ガイド'
      },
      {
        original_achievement_id: 'budget_keeper_month',
        title: '節約家',
        description: '月の支出を予算内に収めました',
        category: :expense,
        tier: :silver,
        progress_target: 1,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/budget_keeper.png',
        reward: '節約バッジ'
      },
      {
        original_achievement_id: 'budget_master_3months',
        title: '予算マスター',
        description: '3ヶ月連続で予算内に収まりました',
        category: :expense,
        tier: :gold,
        progress_target: 3,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/budget_master.png',
        reward: '予算管理バッジ'
      },

      # 特別実績
      {
        original_achievement_id: 'goal_first_achieved',
        title: '目標達成者',
        description: '初めての貯金目標を達成しました',
        category: :special,
        tier: :gold,
        progress_target: 1,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/goal_achieved.png',
        reward: '目標達成証明書'
      },
      {
        original_achievement_id: 'emergency_fund_created',
        title: '安心の備え',
        description: '緊急資金を準備しました',
        category: :special,
        tier: :platinum,
        progress_target: 1,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/emergency_fund.png',
        reward: '緊急資金バッジ'
      },
      {
        original_achievement_id: 'investment_debut',
        title: '投資家デビュー',
        description: '初めての投資を行いました',
        category: :special,
        tier: :gold,
        progress_target: 1,
        progress: 0,
        unlocked: false,
        image_url: '/achievements/investment_debut.png',
        reward: '投資家バッジ'
      }
    ]

    initial_achievements.each do |achievement_data|
      @user.achievements.create!(achievement_data)
    end
  end

  # 貯金関連の実績を更新
  # enum対応
  def update_savings_achievements(amount)
    # 総貯金額を取得
    savings_achievements = @user.achievements.where(category: :savings, unlocked: false)
    
    savings_achievements.each do |achievement|
      case achievement.original_achievement_id
      when 'first_savings'
        achievement.update_progress(1) if amount > 0
      when 'savings_milestone_1000'
        total_savings = @user.total_savings || 0
        achievement.update_progress(total_savings) if total_savings >= achievement.progress_target
      when 'savings_milestone_5000'
        total_savings = @user.total_savings || 0
        achievement.update_progress(total_savings) if total_savings >= achievement.progress_target
      when 'savings_milestone_10000'
        total_savings = @user.total_savings || 0
        achievement.update_progress(total_savings) if total_savings >= achievement.progress_target
      when 'savings_milestone_30000'
        total_savings = @user.total_savings || 0
        achievement.update_progress(total_savings) if total_savings >= achievement.progress_target
      end
    end
  end

  # 連続記録の実績を更新
  def update_streak_achievements(days)
    streak_achievements = @user.achievements.where(unlocked: false)
    
    streak_achievements.each do |achievement|
      case achievement.original_achievement_id
      when 'streak_3_days'
        achievement.update_progress(days) if days >= 3
      when 'streak_7_days'
        achievement.update_progress(days) if days >= 7
      when 'streak_30_days'
        achievement.update_progress(days) if days >= 30
      end
    end
  end

  # マイルストーンの実績を更新（改善版）
  def update_milestone_achievements(total_savings = nil)
    total_savings ||= @user.total_savings || 0
    
    milestone_achievements = @user.achievements.where(
      category: :savings, 
      unlocked: false,
      original_achievement_id: [
        'savings_milestone_1000', 
        'savings_milestone_5000', 
        'savings_milestone_10000', 
        'savings_milestone_30000'
      ]
    )
    
    milestone_achievements.each do |achievement|
      if total_savings >= achievement.progress_target
        achievement.update!(
          progress: achievement.progress_target,
          unlocked: true,
          unlocked_at: Time.current
        )
        # 実績解除時の通知などを追加する場合はここに記述
        Rails.logger.info "Achievement unlocked: #{achievement.title} for user #{@user.id}"
      else
        # 進捗のみ更新（未達成の場合）
        achievement.update!(progress: total_savings) if achievement.progress != total_savings
      end
    end
  end

  # 支出管理実績を更新
  def update_expense_achievements(budget_status)
    expense_achievements = @user.achievements.where(unlocked: false)
    
    expense_achievements.each do |achievement|
      case achievement.original_achievement_id
      when 'budget_first_set'
        achievement.update_progress(1) if budget_status[:budget_set]
      when 'budget_keeper_month'
        achievement.update_progress(1) if budget_status[:within_budget]
      when 'budget_master_3months'
        achievement.update_progress(budget_status[:consecutive_months]) if budget_status[:consecutive_months] >= 3
      end
    end
  end

  # 特別実績を更新
  def update_special_achievements(achievement_type, data = {})
    special_achievements = @user.achievements.where(unlocked: false)
    
    case achievement_type
    when :goal_achieved
      goal_achievement = special_achievements.find_by(original_achievement_id: 'goal_first_achieved')
      goal_achievement&.update_progress(1)
    when :emergency_fund
      emergency_achievement = special_achievements.find_by(original_achievement_id: 'emergency_fund_created')
      emergency_achievement&.update_progress(1)
    when :investment_debut
      investment_achievement = special_achievements.find_by(original_achievement_id: 'investment_debut')
      investment_achievement&.update_progress(1)
    end
  end
end