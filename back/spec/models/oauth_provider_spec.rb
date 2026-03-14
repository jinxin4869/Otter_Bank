# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OauthProvider, type: :model do
  # アソシエーション
  it { should belong_to(:user) }

  # バリデーション
  it { should validate_presence_of(:provider) }
  it { should validate_presence_of(:uid) }

  describe 'ユニーク性バリデーション' do
    it '同じproviderとuidの組み合わせは無効' do
      user = create(:user)
      create(:oauth_provider, user: user, provider: 'google', uid: 'uid123')
      duplicate = build(:oauth_provider, user: user, provider: 'google', uid: 'uid123')
      expect(duplicate).not_to be_valid
    end

    it '同じuidでも異なるproviderなら有効' do
      user = create(:user)
      create(:oauth_provider, user: user, provider: 'google', uid: 'uid123')
      new_provider = build(:oauth_provider, user: user, provider: 'github', uid: 'uid123')
      expect(new_provider).to be_valid
    end
  end
end
