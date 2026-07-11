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

    it 'レスポンスに last_sign_in_at キーを含む' do
      user.update_columns(last_sign_in_at: 3.days.ago)
      get '/api/v1/auth/verify', headers: headers
      json = response.parsed_body
      expect(json).to have_key('last_sign_in_at')
      expect(json['last_sign_in_at']).to be_present
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
      cookies[:refresh_token] = refresh_token.token
      post '/api/v1/auth/refresh'
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['token']).to be_present
      expect(response.cookies['refresh_token']).to be_present
    end

    it '使用済みリフレッシュトークンは無効化される' do
      cookies[:refresh_token] = refresh_token.token
      post '/api/v1/auth/refresh'
      expect(refresh_token.reload.revoked).to be true
    end

    it 'リフレッシュ時にサインイン時刻が更新される' do
      user.update_columns(current_sign_in_at: 10.days.ago, last_sign_in_at: 10.days.ago)
      cookies[:refresh_token] = refresh_token.token
      post '/api/v1/auth/refresh'
      # current は現在時刻に、last には前回（10日前）が保持される
      expect(user.reload.current_sign_in_at).to be_within(5.seconds).of(Time.current)
      expect(user.last_sign_in_at).to be_within(1.second).of(10.days.ago)
    end

    it 'リフレッシュ後に新しいリフレッシュトークンが発行される' do
      cookies[:refresh_token] = refresh_token.token
      post '/api/v1/auth/refresh'
      response.parsed_body
      expect(response.cookies['refresh_token']).not_to eq(refresh_token.token)
    end

    it '期限切れのリフレッシュトークンで 401 を返す' do
      expired = create(:refresh_token, :expired, user: user)
      cookies[:refresh_token] = expired.token
      post '/api/v1/auth/refresh'
      expect(response).to have_http_status(:unauthorized)
      json = response.parsed_body
      expect(json['code']).to eq('invalid_refresh_token')
    end

    it '失効済みリフレッシュトークンで 401 を返す' do
      revoked = create(:refresh_token, :revoked, user: user)
      cookies[:refresh_token] = revoked.token
      post '/api/v1/auth/refresh'
      expect(response).to have_http_status(:unauthorized)
      json = response.parsed_body
      expect(json['code']).to eq('invalid_refresh_token')
    end

    it '不正なリフレッシュトークンで 401 を返す' do
      cookies[:refresh_token] = 'invalid-token'
      post '/api/v1/auth/refresh'
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
    let(:user) { create(:user) }
    let(:auth_hash) do
      OmniAuth::AuthHash.new(
        provider: 'google_oauth2',
        uid: '123456789',
        info: {
          email: user.email,
          name: user.username,
          first_name: user.username
        },
        credentials: {
          token: 'mock_google_token',
          expires_at: 1.week.from_now.to_i
        }
      )
    end

    before do
      allow(ENV).to receive(:fetch).and_call_original
      allow(ENV).to receive(:fetch).with('FRONTEND_URL', nil).and_return('http://localhost:3001')
    end

    context 'OAuth認証成功時' do
      before do
        allow(User).to receive(:find_or_create_from_oauth).and_return(user)
      end

      it 'フロントエンドのコールバックURLにリダイレクトする' do
        get '/api/v1/auth/google/callback', env: { 'omniauth.auth' => auth_hash }
        expect(response).to have_http_status(:redirect)
        expect(response.headers['Location']).to include('/auth/callback?token=')
      end

      it 'リフレッシュトークンをHttpOnly Cookieにセットする' do
        get '/api/v1/auth/google/callback', env: { 'omniauth.auth' => auth_hash }
        expect(response.cookies['refresh_token']).to be_present
      end

      it 'DBにリフレッシュトークンが作成される' do
        expect do
          get '/api/v1/auth/google/callback', env: { 'omniauth.auth' => auth_hash }
        end.to change(RefreshToken, :count).by(1)
      end
    end

    context 'OAuth認証失敗時（ユーザー取得・作成不可）' do
      before do
        allow(User).to receive(:find_or_create_from_oauth).and_return(nil)
      end

      it '422 を返す' do
        get '/api/v1/auth/google/callback', env: { 'omniauth.auth' => auth_hash }
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
