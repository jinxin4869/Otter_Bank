# frozen_string_literal: true

class SavingsGoal < ApplicationRecord
  belongs_to :user

  validates :title, presence: true
  validates :target_amount, presence: true, numericality: { greater_than: 0 }
  validates :current_amount, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :deadline, presence: true

  validate :current_amount_within_target

  private

  def current_amount_within_target
    return unless current_amount.present? && target_amount.present?

    return unless current_amount > target_amount

    errors.add(:current_amount, 'は目標金額以下である必要があります')
  end
end
