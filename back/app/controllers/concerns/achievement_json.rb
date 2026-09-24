# frozen_string_literal: true

# 実績のレスポンス JSON。フィールドを追加するときはここだけを変更する
module AchievementJson
  extend ActiveSupport::Concern

  private

  def achievement_json(achievement)
    {
      id: achievement.id,
      original_achievement_id: achievement.original_achievement_id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      unlocked: achievement.unlocked,
      progress: achievement.progress,
      progress_percentage: achievement.progress_percentage,
      progress_target: achievement.progress_target,
      image_url: achievement.image_url,
      reward: achievement.reward,
      tier: achievement.tier,
      created_at: achievement.created_at,
      updated_at: achievement.updated_at,
      unlocked_at: achievement.unlocked_at
    }
  end

  # 取引の登録・更新で新たに解除された実績（解除モーダルの表示に必要な項目だけ）
  def newly_unlocked_achievement_json(achievement)
    achievement_json(achievement).slice(:id, :title, :description, :tier, :category, :reward, :image_url)
  end
end
