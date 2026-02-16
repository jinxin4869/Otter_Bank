# frozen_string_literal: true

FactoryBot.define do
  factory :comment do
    association :post
    association :user
    sequence(:content) { |n| "これはコメントです。#{n}" }
    likes_count { 0 }
  end
end
