# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Auths', type: :request do
  describe 'GET /api/v1/auth/verify' do
    let(:user) { create(:user) }
    let(:token) { JsonWebToken.encode(user_id: user.id) }
    let(:headers) { { 'Authorization' => "Bearer #{token}" } }

    it '有効なトークンでユーザー情報を返す' do
      get '/api/v1/auth/verify', headers: headers
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['id']).to eq(user.id)
      expect(json['email']).to eq(user.email)
    end

    it '期限切れトークンで token_expired コードを返す' do
      expired_token = JsonWebToken.encode({ user_id: user.id }, 1.second.ago)
      get '/api/v1/auth/verify', headers: { 'Authorization' => "Bearer #{expired_token}" }
      expect(response).to have_http_status(:unauthorized)
      json = response.parsed_body
      expect(json['code']).to eq('token_expired')
    end

    it '不正なトークンで invalid_token コードを返す' do
      get '/api/v1/auth/verify', headers: { 'Authorization' => 'Bearer invalid-token' }
      expect(response).to have_http_status(:unauthorized)
      json = response.parsed_body
      expect(json['code']).to eq('invalid_token')
    end

    it 'Authorizationヘッダーなしで missing_header コードを返す' do
      get '/api/v1/auth/verify'
      expect(response).to have_http_status(:unauthorized)
      json = response.parsed_body
      expect(json['code']).to eq('missing_header')
    end
  end

  describe 'POST /api/v1/auth/refresh' do
    let(:user) { create(:user) }
    let!(:refresh_token) { RefreshToken.generate_for(user) }

    it '有効なリフレッシュトークンで新しいアクセストークンを返す' do
      post '/api/v1/auth/refresh', params: { refresh_token: refresh_token.token }
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['token']).to be_present
      expect(json['refresh_token']).to be_present
    end

    it '使用済みリフレッシュトークンは無効化される' do
      post '/api/v1/auth/refresh', params: { refresh_token: refresh_token.token }
      expect(refresh_token.reload.revoked).to be true
    end

    it 'リフレッシュ後に新しいリフレッシュトークンが発行される' do
      post '/api/v1/auth/refresh', params: { refresh_token: refresh_token.token }
      json = response.parsed_body
      expect(json['refresh_token']).not_to eq(refresh_token.token)
    end

    it '期限切れのリフレッシュトークンで 401 を返す' do
      expired = create(:refresh_token, :expired, user: user)
      post '/api/v1/auth/refresh', params: { refresh_token: expired.token }
      expect(response).to have_http_status(:unauthorized)
      json = response.parsed_body
      expect(json['code']).to eq('invalid_refresh_token')
    end

    it '失効済みリフレッシュトークンで 401 を返す' do
      revoked = create(:refresh_token, :revoked, user: user)
      post '/api/v1/auth/refresh', params: { refresh_token: revoked.token }
      expect(response).to have_http_status(:unauthorized)
      json = response.parsed_body
      expect(json['code']).to eq('invalid_refresh_token')
    end

    it '不正なリフレッシュトークンで 401 を返す' do
      post '/api/v1/auth/refresh', params: { refresh_token: 'invalid-token' }
      expect(response).to have_http_status(:unauthorized)
    end

    it 'リフレッシュトークンなしで 400 を返す' do
      post '/api/v1/auth/refresh'
      expect(response).to have_http_status(:bad_request)
      json = response.parsed_body
      expect(json['code']).to eq('missing_refresh_token')
    end
  end

  describe 'GET /api/v1/auth/google/callback' do
    pending "Google OAuth のテストは別途実装 #{__FILE__}"
  end
end
