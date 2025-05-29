FactoryBot.define do
  factory :comment do
    post { nil }
    content { "MyText" }
    author { "MyString" }
    author_email { "MyString" }
    likes_count { 1 }
  end
end
