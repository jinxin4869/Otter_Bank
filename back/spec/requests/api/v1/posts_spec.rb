# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Posts', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/posts' do
    before { create_list(:post, 3, user: user) }

    it '投稿一覧を返す' do
      get '/api/v1/posts'
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json).to be_an(Array)
      expect(json.length).to eq(3)
    end

    it '認証なしでも一覧を取得できる' do
      get '/api/v1/posts'
      expect(response).to have_http_status(:ok)
    end

    it 'レスポンスに必要なフィールドが含まれる' do
      get '/api/v1/posts', headers: headers
      json = response.parsed_body
      post_data = json.first
      expect(post_data).to include('id', 'title', 'content', 'author', 'likes_count', 'comments_count', 'views_count',
                                   'liked_by_me', 'bookmarked_by_me')
    end

    it '認証済みユーザーはliked_by_meが正しく返る' do
      post_record = create(:post, user: user)
      create(:like, user: user, likeable: post_record)

      get '/api/v1/posts', headers: headers
      json = response.parsed_body
      liked_post = json.find { |p| p['id'] == post_record.id }
      expect(liked_post['liked_by_me']).to be true
    end
  end

  describe 'GET /api/v1/posts/:id' do
    let!(:post_record) { create(:post, user: user) }

    it '投稿詳細を返す' do
      get "/api/v1/posts/#{post_record.id}"
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['id']).to eq(post_record.id)
      expect(json['title']).to eq(post_record.title)
    end

    it '存在しない投稿は404を返す' do
      get '/api/v1/posts/0'
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/posts' do
    let(:valid_params) { { post: { title: 'テスト投稿', content: 'テスト内容です。' } } }

    it '投稿を作成できる' do
      expect do
        post '/api/v1/posts', params: valid_params, headers: headers
      end.to change(Post, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'カテゴリ付きで投稿を作成できる' do
      params = { post: { title: 'テスト投稿', content: 'テスト内容です。', category_names: %w[節約 家計簿] } }
      post '/api/v1/posts', params: params, headers: headers
      expect(response).to have_http_status(:created)
      json = response.parsed_body
      expect(json['categories']).to include('節約', '家計簿')
    end

    it '未認証では投稿できない' do
      post '/api/v1/posts', params: valid_params
      expect(response).to have_http_status(:unauthorized)
    end

    it 'タイトルなしでは422を返す' do
      post '/api/v1/posts', params: { post: { content: '内容だけ' } }, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'PATCH /api/v1/posts/:id' do
    let!(:post_record) { create(:post, user: user) }

    it '自分の投稿を更新できる' do
      patch "/api/v1/posts/#{post_record.id}", params: { post: { title: '更新タイトル' } }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(post_record.reload.title).to eq('更新タイトル')
    end

    it '他ユーザーの投稿は更新できない' do
      other_post = create(:post, user: create(:user))
      patch "/api/v1/posts/#{other_post.id}", params: { post: { title: '不正更新' } }, headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it '未認証では更新できない' do
      patch "/api/v1/posts/#{post_record.id}", params: { post: { title: '更新' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'DELETE /api/v1/posts/:id' do
    let!(:post_record) { create(:post, user: user) }

    it '自分の投稿を削除できる' do
      expect do
        delete "/api/v1/posts/#{post_record.id}", headers: headers
      end.to change(Post, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it '他ユーザーの投稿は削除できない' do
      other_post = create(:post, user: create(:user))
      delete "/api/v1/posts/#{other_post.id}", headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it '未認証では削除できない' do
      delete "/api/v1/posts/#{post_record.id}"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/posts/:id/increment_views' do
    let!(:post_record) { create(:post, user: user, views_count: 0) }

    it '閲覧数をインクリメントする' do
      post "/api/v1/posts/#{post_record.id}/increment_views"
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['views_count']).to eq(1)
    end

    it '認証なしでもインクリメントできる' do
      post "/api/v1/posts/#{post_record.id}/increment_views"
      expect(response).to have_http_status(:ok)
    end
  end
end
