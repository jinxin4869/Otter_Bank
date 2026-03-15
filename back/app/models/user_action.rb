# frozen_string_literal: true

class UserAction < ApplicationRecord
  belongs_to :user

  # アクションタイプを定義（AchievementService の更新トリガーとして活用）
  enum :action_type, {
    savings: 'savings',           # 貯金記録
    expense: 'expense',           # 支出記録
    goal_achieved: 'goal_achieved',   # 貯金目標達成
    emergency_fund: 'emergency_fund', # 緊急資金設定
    investment: 'investment'          # 投資記録
  }

  validates :action_type, presence: true
  validates :amount, numericality: { greater_than: 0 }, allow_nil: true
end
