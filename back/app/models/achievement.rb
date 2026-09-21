# frozen_string_literal: true

class Achievement < ApplicationRecord
  belongs_to :user

  # 実績の種類を定義
  enum :category, {
    savings: 0,      # 貯金関連
    streak: 1,       # 連続記録
    expense: 2,      # マイルストーン
    special: 3       # 特別な実績
  }

  # 実績のティア（難易度）を定義
  enum :tier, {
    bronze: 0,
    silver: 1,
    gold: 2,
    platinum: 3
  }

  # カワウソの成長ステージ（[ステージ名, 必要な解除実績数の下限]）。閾値はここだけで管理する
  GROWTH_STAGES = [['none', 0], ['bronze', 3], ['silver', 8], ['gold', 13], ['platinum', 18]].freeze

  validates :title, presence: true
  validates :description, presence: true
  validates :category, presence: true
  validates :tier, presence: true
  validates :progress_target, presence: true, numericality: { greater_than: 0 }
  validates :original_achievement_id, presence: true, uniqueness: { scope: :user_id }

  # 実績の進捗を更新するメソッド
  def update_progress(value)
    self.progress = [value, progress_target].min
    self.unlocked = (progress >= progress_target)
    self.unlocked_at = Time.current if unlocked && unlocked_at.nil?
    save!
  end

  # 実績の進捗率を計算
  def progress_percentage
    return 0 if progress_target.zero?

    ((progress.to_f / progress_target) * 100).round(1)
  end

  # 解除済み実績数から成長ステージと次のステージまでの進捗を返す
  def self.growth_stage_for(unlocked_count)
    count = [unlocked_count.to_i, 0].max
    index = GROWTH_STAGES.rindex { |_, min| count >= min }
    stage, lower = GROWTH_STAGES[index]
    next_stage, upper = GROWTH_STAGES[index + 1]

    # 最終ステージは次がないため nil / 100% とする
    return { stage: stage, next_stage: nil, achievements_to_next: nil, progress_percentage: 100 } unless next_stage

    {
      stage: stage,
      next_stage: next_stage,
      achievements_to_next: upper - count,
      progress_percentage: ((count - lower).to_f / (upper - lower) * 100).round
    }
  end
end
