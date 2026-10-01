# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Post, type: :model do
  # アソシエーションのテスト
  it { should belong_to(:user) }
  it { should have_many(:comments).dependent(:destroy) }
  it { should have_many(:likes) }

  # バリデーションのテスト
  it { should validate_presence_of(:title) }
  it { should validate_presence_of(:content) }
  it { should validate_length_of(:title).is_at_most(100) }
  it { should validate_length_of(:content).is_at_most(5_000) }

  it '文字数超過のエラーは日本語で返る' do
    post = build(:post, title: 'あ' * 101)
    post.validate
    expect(post.errors.full_messages).to include('タイトルは100文字以内で入力してください')
  end

  # 基本的な属性のテスト
  describe 'attributes' do
    it 'has likes_count attribute' do
      post = Post.new
      expect(post).to respond_to(:likes_count)
    end

    it 'has comments_count attribute' do
      post = Post.new
      expect(post).to respond_to(:comments_count)
    end

    it 'has views_count attribute' do
      post = Post.new
      expect(post).to respond_to(:views_count)
    end
  end

  # メソッドのテスト
  describe '#increment_views!' do
    let(:post) { create(:post, views_count: 5) }

    it 'increments the views count' do
      expect { post.increment_views! }.to change { post.views_count }.by(1)
    end
  end
end
