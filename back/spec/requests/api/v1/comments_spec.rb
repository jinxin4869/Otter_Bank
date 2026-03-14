# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Comments', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }
  let!(:post_record) { create(:post, user: user) }

  describe 'GET /api/v1/posts/:post_id/comments' do
    before { create_list(:comment, 2, post: post_record, user: user) }

    it 'コメント一覧を返す' do
      get "/api/v1/posts/#{post_record.id}/comments"
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json).to be_an(Array)
      expect(json.length).to eq(2)
    end

    it '認証なしでも一覧を取得できる' do
      get "/api/v1/posts/#{post_record.id}/comments"
      expect(response).to have_http_status(:ok)
    end

    it '存在しない投稿のコメントは404を返す' do
      get '/api/v1/posts/0/comments'
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/posts/:post_id/comments' do
    let(:valid_params) { { comment: { content: 'テストコメントです。' } } }

    it 'コメントを作成できる' do
      expect do
        post "/api/v1/posts/#{post_record.id}/comments", params: valid_params, headers: headers
      end.to change(Comment, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'コメント作成で投稿のcomments_countが増加する' do
      post "/api/v1/posts/#{post_record.id}/comments", params: valid_params, headers: headers
      expect(post_record.reload.comments_count).to eq(1)
    end

    it '未認証ではコメントできない' do
      post "/api/v1/posts/#{post_record.id}/comments", params: valid_params
      expect(response).to have_http_status(:unauthorized)
    end

    it 'contentなしでは422を返す' do
      post "/api/v1/posts/#{post_record.id}/comments", params: { comment: { content: '' } }, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'PATCH /api/v1/posts/:post_id/comments/:id' do
    let!(:comment) { create(:comment, post: post_record, user: user) }

    it '自分のコメントを更新できる' do
      patch "/api/v1/posts/#{post_record.id}/comments/#{comment.id}",
            params: { comment: { content: '更新コメント' } }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(comment.reload.content).to eq('更新コメント')
    end

    it '他ユーザーのコメントは更新できない' do
      other_comment = create(:comment, post: post_record, user: create(:user))
      patch "/api/v1/posts/#{post_record.id}/comments/#{other_comment.id}",
            params: { comment: { content: '不正更新' } }, headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it '未認証では更新できない' do
      patch "/api/v1/posts/#{post_record.id}/comments/#{comment.id}",
            params: { comment: { content: '更新' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'DELETE /api/v1/posts/:post_id/comments/:id' do
    let!(:comment) { create(:comment, post: post_record, user: user) }

    it '自分のコメントを削除できる' do
      expect do
        delete "/api/v1/posts/#{post_record.id}/comments/#{comment.id}", headers: headers
      end.to change(Comment, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it '他ユーザーのコメントは削除できない' do
      other_comment = create(:comment, post: post_record, user: create(:user))
      delete "/api/v1/posts/#{post_record.id}/comments/#{other_comment.id}", headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it '未認証では削除できない' do
      delete "/api/v1/posts/#{post_record.id}/comments/#{comment.id}"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
