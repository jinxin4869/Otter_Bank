# frozen_string_literal: true

FactoryBot.define do
  factory :savings_goal do
    association :user
    sequence(:title) { |n| "貯金目標#{n}" }
    target_amount { 100_000 }
    current_amount { 0 }
    deadline { 1.year.from_now.to_date }
  end
end
