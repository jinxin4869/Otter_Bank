# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Comment, type: :model do
  # アソシエーション
  it { should belong_to(:post) }
  it { should belong_to(:user) }
  it { should have_many(:likes).dependent(:destroy) }

  # バリデーション
  it { should validate_presence_of(:content) }

  describe 'ファクトリー' do
    it '有効なファクトリーを持つ' do
      expect(build(:comment)).to be_valid
    end
  end

  describe '属性' do
    it 'likes_count属性を持つ' do
      comment = Comment.new
      expect(comment).to respond_to(:likes_count)
    end
  end
end
