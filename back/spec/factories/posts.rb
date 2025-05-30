FactoryBot.define do
  factory :post do
    sequence(:title) { |n| "投稿タイトル#{n}" }
    sequence(:content) { |n| "これは投稿の内容です。#{n}" }
    sequence(:author) { |n| "ユーザー#{n}" }
    sequence(:author_email) { |n| "user#{n}@example.com" }
    likes_count { 0 }
    comments_count { 0 }
    views_count { 0 }
  end
end