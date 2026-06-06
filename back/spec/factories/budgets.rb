# frozen_string_literal: true

FactoryBot.define do
  factory :budget do
    association :user
    year  { Date.current.year }
    month { Date.current.month }
    amount { 50_000 }
  end
end
