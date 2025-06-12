class Achievement < ApplicationRecord
  belongs_to :user

  # 実績の種類を定義
  enum category: {
    savings: 0,      # 貯金関連
    streak: 1,       # 連続記録
    milestone: 2,    # マイルストーン
    special: 3       # 特別な実績
  }

  # 実績のティア（難易度）を定義
  enum tier: {
    bronze: 0,
    silver: 1,
    gold: 2,
    platinum: 3
  }

  validates :title, presence: true
  validates :description, presence: true
  validates :category, presence: true
  validates :tier, presence: true
  validates :progress_target, presence: true, numericality: { greater_than: 0 }
  validates :original_achievement_id, presence: true, uniqueness: { scope: :user_id }

  # 実績の進捗を更新するメソッド
  def update_progress(new_progress)
    return if unlocked

    self.progress = new_progress
    if progress >= progress_target
      self.unlocked = true
      self.unlocked_at = Time.current
    end
    save
  end

  # 実績の進捗率を計算
  def progress_percentage
    return 100 if unlocked
    ((progress.to_f / progress_target) * 100).round
  end
end
