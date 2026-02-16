FactoryBot.define do
  factory :bookmark do
    association :post
    association :user
  end
end
