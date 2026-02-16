# frozen_string_literal: true

FactoryBot.define do
  factory :transaction do
    association :user
    amount { 1000 }
    transaction_type { :expense }
    description { 'テスト取引' }
    category { '食費' }
    date { Date.current }
  end
end
