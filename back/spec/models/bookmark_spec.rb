# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookmark, type: :model do
  # アソシエーション
  it { should belong_to(:post) }
  it { should belong_to(:user) }

  describe 'ユニーク性バリデーション' do
    it '同じユーザーが同じ投稿を二重ブックマークできない' do
      user = create(:user)
      post_record = create(:post, user: create(:user))
      create(:bookmark, user: user, post: post_record)
      duplicate = build(:bookmark, user: user, post: post_record)
      expect(duplicate).not_to be_valid
    end

    it '別ユーザーは同じ投稿をブックマークできる' do
      post_record = create(:post, user: create(:user))
      create(:bookmark, user: create(:user), post: post_record)
      new_bookmark = build(:bookmark, user: create(:user), post: post_record)
      expect(new_bookmark).to be_valid
    end
  end
end
