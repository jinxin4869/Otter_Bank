class UserAction < ApplicationRecord
  belongs_to :user

  validates :action_type, presence: true, inclusion: { 
    in: %w[deposit withdrawal budget_set goal_achieved transfer investment] 
  }
  validates :description, presence: true
  validates :amount, numericality: { greater_than_or_equal_to: 0 }, if: :amount_required?

  scope :recent, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(action_type: type) }
  scope :with_amount, -> { where.not(amount: nil) }

  private

  def amount_required?
    %w[deposit withdrawal transfer investment].include?(action_type)
  end
end
