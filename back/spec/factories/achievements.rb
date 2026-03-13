# frozen_string_literal: true

FactoryBot.define do
  factory :achievement do
    association :user
    sequence(:original_achievement_id) { |n| "test_achievement_#{n}" }
    sequence(:title) { |n| "実績タイトル#{n}" }
    sequence(:description) { |n| "実績の説明#{n}" }
    category { :savings }
    tier { :bronze }
    progress { 0 }
    progress_target { 10 }
    unlocked { false }
    unlocked_at { nil }
    image_url { nil }
    reward { nil }
  end
end
