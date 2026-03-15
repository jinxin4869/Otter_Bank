# frozen_string_literal: true

FactoryBot.define do
  factory :user_action do
    association :user
    action_type { :savings }
    amount { 1000 }
    description { 'テストアクション' }
  end
end
