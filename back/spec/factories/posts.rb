FactoryBot.define do
  factory :post do
    title { "MyString" }
    content { "MyText" }
    author { "MyString" }
    author_email { "MyString" }
    likes_count { 1 }
    comments_count { 1 }
    views_count { 1 }
  end
end
