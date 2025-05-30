FactoryBot.define do
  factory :comment do
    association :post
    content { "これはコメントです。#{rand(1000)}" }
    author { "コメントユーザー#{rand(100)}" }
    author_email { "comment_user#{rand(100)}@example.com" }
    likes_count { 0 }
  end
end
