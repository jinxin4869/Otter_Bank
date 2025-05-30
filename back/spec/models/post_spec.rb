require 'rails_helper'

RSpec.describe Post, type: :model do
  # アソシエーションのテスト
  it { should have_many(:comments).dependent(:destroy) }
  it { should have_many(:likes).dependent(:destroy) }

  # バリデーションのテスト
  it { should validate_presence_of(:title) }
  it { should validate_presence_of(:content) }
  it { should validate_presence_of(:author) }

  # 基本的な属性のテスト
  describe "attributes" do
    it "has likes_count attribute" do
      post = Post.new
      expect(post).to respond_to(:likes_count)
    end
    
    it "has comments_count attribute" do
      post = Post.new
      expect(post).to respond_to(:comments_count)
    end

    it "has views_count attribute" do
      post = Post.new
      expect(post).to respond_to(:views_count)
    end
  end

  # メソッドのテスト
  describe "#increment_views!" do
    let(:post) { create(:post, views_count: 5) }
    
    it "increments the views count" do
      expect { post.increment_views! }.to change { post.views_count }.by(1)
    end
  end
end

