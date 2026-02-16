FactoryBot.define do
  factory :post do
    association :user
    sequence(:title) { |n| "投稿タイトル#{n}" }
    sequence(:content) { |n| "これは投稿の内容です。#{n}" }
    likes_count { 0 }
    comments_count { 0 }
    views_count { 0 }
  end
end
