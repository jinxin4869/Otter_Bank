# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Users', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'POST /api/v1/users' do
    let(:valid_params) do
      { user: { username: 'newuser', email: 'new@example.com', password: 'password123',
                password_confirmation: 'password123' } }
    end

    it 'ユーザーを登録できる' do
      expect do
        post '/api/v1/users', params: valid_params
      end.to change(User, :count).by(1)
      expect(response).to have_http_status(:created)
      expect(response.parsed_body['token']).to be_present
    end

    it 'メールアドレス重複ではエラーを返す' do
      create(:user, email: 'new@example.com')
      post '/api/v1/users', params: valid_params
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'GET /api/v1/user' do
    it '認証済みユーザーの情報を返す' do
      get '/api/v1/user', headers: headers
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['id']).to eq(user.id)
      expect(json['email']).to eq(user.email)
    end

    it '未認証ではアクセスできない' do
      get '/api/v1/user'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PATCH /api/v1/user' do
    it '自分のプロフィールを更新できる' do
      patch '/api/v1/user', params: { user: { username: '新ユーザー名' } }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(user.reload.username).to eq('新ユーザー名')
    end

    it 'バリデーションエラーは 422 を返す' do
      other_user = create(:user)
      patch '/api/v1/user', params: { user: { email: other_user.email } }, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it '未認証では更新できない' do
      patch '/api/v1/user', params: { user: { username: '書き換え' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
