# frozen_string_literal: true

FactoryBot.define do
  factory :bookmark do
    association :post
    association :user
  end
end
