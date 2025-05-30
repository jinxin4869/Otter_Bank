FactoryBot.define do
  factory :post do
    title { "投稿タイトル#{rand(1000)}" }
    content { "これは投稿の内容です。#{rand(1000)}" }
    author { "ユーザー#{rand(100)}" }
    author_email { "user#{rand(100)}@example.com" }
    likes_count { 0 }
    comments_count { 0 }
    views_count { 0 }
  end
end