# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AccountDeletionService do
  let(:leaving_user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:others_post) { create(:post, user: other_user, comments_count: 3, likes_count: 2) }
  let(:others_comment) { create(:comment, post: others_post, user: other_user, likes_count: 1) }

  describe '#call' do
    before do
      create(:comment, post: others_post, user: leaving_user)
      create(:like, user: leaving_user, likeable: others_post)
      create(:like, user: leaving_user, likeable: others_comment)
    end

    it 'ユーザーを削除する' do
      described_class.new(leaving_user).call
      expect(User.exists?(leaving_user.id)).to be false
    end

    it '他人の投稿のコメント数・いいね数と、他人のコメントのいいね数を減らす' do
      described_class.new(leaving_user).call

      expect(others_post.reload.comments_count).to eq(2)
      expect(others_post.likes_count).to eq(1)
      expect(others_comment.reload.likes_count).to eq(0)
    end

    it '件数が既にずれていても 0 未満にはしない' do
      others_comment.update_columns(likes_count: 0)
      described_class.new(leaving_user).call
      expect(others_comment.reload.likes_count).to eq(0)
    end

    it '自分の投稿に付けた自分のコメント・いいねは、投稿ごと消えるので他に影響しない' do
      own_post = create(:post, user: leaving_user)
      create(:comment, post: own_post, user: leaving_user)
      create(:like, user: leaving_user, likeable: own_post)

      expect { described_class.new(leaving_user).call }.to change(Post, :count).by(-1)
      expect(others_post.reload.comments_count).to eq(2)
    end

    it '削除に失敗したら件数の変更も取り消す' do
      allow(leaving_user).to receive(:destroy!).and_raise(ActiveRecord::RecordNotDestroyed)

      expect { described_class.new(leaving_user).call }.to raise_error(ActiveRecord::RecordNotDestroyed)
      expect(others_post.reload.comments_count).to eq(3)
    end
  end
end
