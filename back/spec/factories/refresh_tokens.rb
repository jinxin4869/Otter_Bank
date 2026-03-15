# frozen_string_literal: true

FactoryBot.define do
  factory :refresh_token do
    association :user
    sequence(:token) { |n| "refresh_token_#{n}_#{SecureRandom.hex(8)}" }
    expires_at { 30.days.from_now }
    revoked { false }

    trait :expired do
      expires_at { 1.day.ago }
    end

    trait :revoked do
      revoked { true }
    end
  end
end
