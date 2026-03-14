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
        expect(json['user']).to include('id', 'email', 'username')
      end

      it 'sessionネスト形式のパラメータでもログインできる' do
        post '/api/v1/sessions', params: { session: { email: user.email, password: password } }
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['token']).to be_present
      end
    end

    context '異常系' do
      it '存在しないメールアドレスの場合は404を返す' do
        post '/api/v1/sessions', params: { email: 'notfound@example.com', password: password }
        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['code']).to eq('account_not_found')
      end

      it 'パスワードが間違っている場合は401を返す' do
        post '/api/v1/sessions', params: { email: user.email, password: 'wrongpassword' }
        expect(response).to have_http_status(:unauthorized)
        json = response.parsed_body
        expect(json['code']).to eq('invalid_credentials')
      end
    end
  end
end
