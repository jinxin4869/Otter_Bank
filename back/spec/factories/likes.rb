# frozen_string_literal: true

FactoryBot.define do
  factory :like do
    association :user
    association :likeable, factory: :post
  end
end
