# frozen_string_literal: true

FactoryBot.define do
  factory :contact do
    sequence(:name) { |n| "テストユーザー#{n}" }
    sequence(:email) { |n| "test#{n}@example.com" }
    subject { 'question' }
    sequence(:message) { |n| "お問い合わせ内容#{n}" }
    status { :pending }
  end
end
