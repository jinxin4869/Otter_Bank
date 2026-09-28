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

    it '不正なトークンでも復号エラーの詳細を返さない' do
      get '/api/v1/auth/verify', headers: { 'Authorization' => 'Bearer invalid-token' }
      expect(response.parsed_body.keys).not_to include('details')
    end

    it '不正なトークンで invalid_token コードを返す' do
      get '/api/v1/auth/verify', headers: { 'Authorization' => 'Bearer invalid-token' }
      expect(response).to have_http_status(:unauthorized)
      json = response.parsed_body
      expect(json['code']).to eq('invalid_token')
    end

    it '削除済みユーザーのトークンで user_not_found コードを返す' do
      deleted_token = JsonWebToken.encode(user_id: user.id)
      user.destroy
      get '/api/v1/auth/verify', headers: { 'Authorization' => "Bearer #{deleted_token}" }
      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body['code']).to eq('user_not_found')
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

    # OmniAuth のミドルウェアがコールバックのパスを処理するため、テストモードで Google の応答を差し替える
    before do
      allow(ENV).to receive(:fetch).and_call_original
      allow(ENV).to receive(:fetch).with('FRONTEND_URL', nil).and_return('http://localhost:3001')
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:google_oauth2] = auth_hash
    end

    after do
      OmniAuth.config.test_mode = false
      OmniAuth.config.mock_auth[:google_oauth2] = nil
    end

    it '開始 URL からのリダイレクト先がコールバックのルートと一致する' do
      get '/auth/google_oauth2'
      expect(response.headers['Location']).to end_with('/api/v1/auth/google/callback')
    end

    context 'OAuth認証成功時' do
      before do
        allow(User).to receive(:find_or_create_from_oauth).and_return(user)
      end

      it 'トークンを URL に載せずにフロントエンドのコールバック画面へリダイレクトする' do
        get '/api/v1/auth/google/callback'
        expect(response).to have_http_status(:redirect)
        expect(response.headers['Location']).to eq('http://localhost:3001/auth/callback')
      end

      it 'サインイン時刻はここでは記録しない（フロントが続けて呼ぶリフレッシュで 1 回だけ記録する）' do
        user.update_columns(last_sign_in_at: 10.days.ago, current_sign_in_at: 10.days.ago)
        expect do
          get '/api/v1/auth/google/callback'
        end.not_to(change { user.reload.current_sign_in_at })
      end

      it 'リフレッシュトークンをHttpOnly Cookieにセットする' do
        get '/api/v1/auth/google/callback'
        expect(response.cookies['refresh_token']).to be_present
      end

      it 'DBにリフレッシュトークンが作成される' do
        expect do
          get '/api/v1/auth/google/callback'
        end.to change(RefreshToken, :count).by(1)
      end
    end

    context 'OAuth認証失敗時（ユーザー取得・作成不可）' do
      before do
        allow(User).to receive(:find_or_create_from_oauth).and_return(nil)
      end

      it 'ログイン画面へ oauth_error=failed を付けてリダイレクトする' do
        get '/api/v1/auth/google/callback'
        expect(response.headers['Location']).to eq('http://localhost:3001/login?oauth_error=failed')
      end
    end

    it 'ユーザーがキャンセルしたら oauth_error=cancelled でログイン画面へ戻す' do
      OmniAuth.config.mock_auth[:google_oauth2] = :access_denied
      get '/api/v1/auth/google/callback'
      expect(response.headers['Location']).to eq('http://localhost:3001/login?oauth_error=cancelled')
    end

    it 'その他の失敗では oauth_error=failed でログイン画面へ戻す' do
      OmniAuth.config.mock_auth[:google_oauth2] = :invalid_credentials
      get '/api/v1/auth/google/callback'
      expect(response.headers['Location']).to eq('http://localhost:3001/login?oauth_error=failed')
    end
  end
end
