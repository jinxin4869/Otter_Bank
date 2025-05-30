FactoryBot.define do
  factory :comment do
    association :post
    sequence(:content) { |n| "これはコメントです。#{n}" }
    sequence(:author) { |n| "コメントユーザー#{n}" }
    sequence(:author_email) { |n| "comment_user#{n}@example.com" }
    likes_count { 0 }
  end
end
