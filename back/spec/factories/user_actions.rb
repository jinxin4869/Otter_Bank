FactoryBot.define do
  factory :user_action do
    user { nil }
    action_type { "MyString" }
    amount { "9.99" }
    description { "MyText" }
  end
end
