# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Likes', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }
  let!(:post_record) { create(:post, user: create(:user), likes_count: 0) }

  describe '投稿へのいいね' do
    describe 'POST /api/v1/posts/:post_id/like' do
      it '投稿にいいねできる' do
        post "/api/v1/posts/#{post_record.id}/like", headers: headers
        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json['likes_count']).to eq(1)
      end

      it '未認証ではいいねできない' do
        post "/api/v1/posts/#{post_record.id}/like"
        expect(response).to have_http_status(:unauthorized)
      end

      it '存在しない投稿には404を返す' do
        post '/api/v1/posts/0/like', headers: headers
        expect(response).to have_http_status(:not_found)
      end

      it '同じ投稿に二重いいねしようとすると422を返す' do
        create(:like, user: user, likeable: post_record)
        post "/api/v1/posts/#{post_record.id}/like", headers: headers
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    describe 'POST /api/v1/posts/:post_id/unlike' do
      before { create(:like, user: user, likeable: post_record) }

      it '投稿のいいねを取り消せる' do
        post "/api/v1/posts/#{post_record.id}/unlike", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it '未認証ではいいねを取り消せない' do
        post "/api/v1/posts/#{post_record.id}/unlike"
        expect(response).to have_http_status(:unauthorized)
      end

      it 'いいねしていない投稿のいいね取り消しは404を返す' do
        other_post = create(:post, user: create(:user))
        post "/api/v1/posts/#{other_post.id}/unlike", headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'コメントへのいいね' do
    let!(:comment) { create(:comment, post: post_record, user: create(:user), likes_count: 0) }

    describe 'POST /api/v1/posts/:post_id/comments/:id/like' do
      it 'コメントにいいねできる' do
        post "/api/v1/posts/#{post_record.id}/comments/#{comment.id}/like", headers: headers
        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json['likes_count']).to eq(1)
      end

      it '未認証ではいいねできない' do
        post "/api/v1/posts/#{post_record.id}/comments/#{comment.id}/like"
        expect(response).to have_http_status(:unauthorized)
      end

      it '存在しないコメントには404を返す' do
        post "/api/v1/posts/#{post_record.id}/comments/0/like", headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end

    describe 'POST /api/v1/posts/:post_id/comments/:id/unlike' do
      before { create(:like, user: user, likeable: comment) }

      it 'コメントのいいねを取り消せる' do
        post "/api/v1/posts/#{post_record.id}/comments/#{comment.id}/unlike", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it '未認証ではいいねを取り消せない' do
        post "/api/v1/posts/#{post_record.id}/comments/#{comment.id}/unlike"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
