# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Sessions', type: :request do
  let(:password) { 'password123' }
  let(:user) { create(:user, password: password) }

  describe 'POST /api/v1/sessions' do
    context '正常系' do
      it 'メールアドレスとパスワードが正しい場合はJWTトークンを返す' do
        post '/api/v1/sessions', params: { email: user.email, password: password }
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['status']).to eq('success')
        expect(json['token']).to be_present
        expect(response.cookies['refresh_token']).to be_present
        expect(json['user']).to include('id', 'email', 'username')
      end

      it 'sessionネスト形式のパラメータでもログインできる' do
        post '/api/v1/sessions', params: { session: { email: user.email, password: password } }
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['token']).to be_present
      end

      it 'ログイン成功時にサインイン時刻が記録される' do
        expect(user.current_sign_in_at).to be_nil
        post '/api/v1/sessions', params: { email: user.email, password: password }
        expect(response).to have_http_status(:ok)
        expect(user.reload.current_sign_in_at).to be_present
      end
    end

    context '異常系' do
      it '存在しないメールアドレスでも、パスワード違いと同じ応答を返す（登録有無を知られないため）' do
        post '/api/v1/sessions', params: { email: user.email, password: 'wrongpassword' }
        wrong_password = [response.status, response.parsed_body]

        post '/api/v1/sessions', params: { email: 'notfound@example.com', password: password }
        expect([response.status, response.parsed_body]).to eq(wrong_password)
        expect(response).to have_http_status(:unauthorized)
      end

      it 'パスワードが未送信・空文字でも、未登録・登録済みのどちらも同じ応答を返す' do
        responses = [
          { email: user.email }, { email: 'notfound@example.com' },
          { email: user.email, password: '' }, { email: 'notfound@example.com', password: '' }
        ].map do |params|
          post '/api/v1/sessions', params: params
          [response.status, response.parsed_body]
        end
        expect(responses.uniq.size).to eq(1)
        expect(responses.first.first).to eq(401)
      end

      it 'Google ログイン専用（パスワード未設定）のアカウントでも同じ応答を返す' do
        oauth_user = create(:user)
        oauth_user.update_columns(password_digest: nil)
        post '/api/v1/sessions', params: { email: oauth_user.email, password: 'anything' }
        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body['code']).to eq('invalid_credentials')
      end

      it 'パスワードが間違っている場合は401を返す' do
        post '/api/v1/sessions', params: { email: user.email, password: 'wrongpassword' }
        expect(response).to have_http_status(:unauthorized)
        json = response.parsed_body
        expect(json['code']).to eq('invalid_credentials')
      end
    end
  end

  describe 'DELETE /api/v1/sessions' do
    let!(:refresh_token) { RefreshToken.generate_for(user) }

    it 'ログアウト時にリフレッシュトークンを失効させる' do
      cookies[:refresh_token] = refresh_token.token
      delete '/api/v1/sessions'
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['status']).to eq('success')
      expect(refresh_token.reload.revoked).to be true
    end

    it 'リフレッシュトークンなしでもログアウトできる' do
      delete '/api/v1/sessions'
      expect(response).to have_http_status(:ok)
    end

    it '未認証（Authorizationヘッダーなし）でもログアウトできる' do
      cookies[:refresh_token] = refresh_token.token
      delete '/api/v1/sessions'
      expect(response).to have_http_status(:ok)
    end

    it 'ログアウト時にリフレッシュトークンCookieが削除される' do
      cookies[:refresh_token] = refresh_token.token
      delete '/api/v1/sessions'
      expect(response.cookies['refresh_token']).to be_blank
    end
  end
end
