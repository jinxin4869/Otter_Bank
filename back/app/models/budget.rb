# frozen_string_literal: true

class Budget < ApplicationRecord
  belongs_to :user

  validates :year,   presence: true, numericality: { only_integer: true, greater_than: 2000 }
  validates :month,  presence: true, numericality: { only_integer: true, in: 1..12 }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :year, uniqueness: { scope: %i[user_id month], message: 'その月の予算はすでに登録されています' }
end
