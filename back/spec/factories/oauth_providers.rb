FactoryBot.define do
  factory :oauth_provider do
    user { nil }
    provider { "MyString" }
    uid { "MyString" }
    access_token { "MyString" }
    refresh_token { "MyString" }
    expires_at { "2025-05-23 17:35:26" }
  end
end
