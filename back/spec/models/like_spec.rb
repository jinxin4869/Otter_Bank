# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Like, type: :model do
  # アソシエーション
  it { should belong_to(:user) }
  it { should belong_to(:likeable) }

  describe 'ユニーク性バリデーション' do
    it '同じユーザーが同じリソースに二重いいねできない' do
      user = create(:user)
      post_record = create(:post, user: create(:user))
      create(:like, user: user, likeable: post_record)
      duplicate_like = build(:like, user: user, likeable: post_record)
      expect(duplicate_like).not_to be_valid
    end

    it '別ユーザーは同じリソースにいいねできる' do
      post_record = create(:post, user: create(:user))
      create(:like, user: create(:user), likeable: post_record)
      new_like = build(:like, user: create(:user), likeable: post_record)
      expect(new_like).to be_valid
    end

    it '同じユーザーが別リソースにいいねできる' do
      user = create(:user)
      post1 = create(:post, user: create(:user))
      post2 = create(:post, user: create(:user))
      create(:like, user: user, likeable: post1)
      new_like = build(:like, user: user, likeable: post2)
      expect(new_like).to be_valid
    end
  end

  describe 'ポリモーフィック' do
    it '投稿へのいいねを作成できる' do
      post_record = create(:post, user: create(:user))
      like = create(:like, user: create(:user), likeable: post_record)
      expect(like.likeable_type).to eq('Post')
    end

    it 'コメントへのいいねを作成できる' do
      comment = create(:comment, post: create(:post, user: create(:user)), user: create(:user))
      like = create(:like, user: create(:user), likeable: comment)
      expect(like.likeable_type).to eq('Comment')
    end
  end
end
