# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Bookmarks', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }
  let!(:post_record) { create(:post, user: create(:user)) }

  describe 'POST /api/v1/posts/:post_id/bookmark' do
    it '投稿をブックマークできる' do
      post "/api/v1/posts/#{post_record.id}/bookmark", headers: headers
      expect(response).to have_http_status(:created)
    end

    it '未認証ではブックマークできない' do
      post "/api/v1/posts/#{post_record.id}/bookmark"
      expect(response).to have_http_status(:unauthorized)
    end

    it '存在しない投稿は404を返す' do
      post '/api/v1/posts/0/bookmark', headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it '同じ投稿を二重ブックマークしようとすると422を返す' do
      create(:bookmark, user: user, post: post_record)
      post "/api/v1/posts/#{post_record.id}/bookmark", headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'DELETE /api/v1/posts/:post_id/bookmark' do
    before { create(:bookmark, user: user, post: post_record) }

    it 'ブックマークを解除できる' do
      delete "/api/v1/posts/#{post_record.id}/bookmark", headers: headers
      expect(response).to have_http_status(:ok)
    end

    it '未認証ではブックマーク解除できない' do
      delete "/api/v1/posts/#{post_record.id}/bookmark"
      expect(response).to have_http_status(:unauthorized)
    end

    it 'ブックマークしていない投稿の解除は404を返す' do
      other_post = create(:post, user: create(:user))
      delete "/api/v1/posts/#{other_post.id}/bookmark", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
