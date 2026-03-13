# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "testuser#{n}" }
    sequence(:email) { |n| "test#{n}@example.com" }
    password { 'password123' }

    # 初期実績の自動生成をスキップしたい場合に使用
    trait :without_achievements do
      after(:create) { |user| user.achievements.delete_all }
    end
  end
end
