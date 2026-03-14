# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::GuestSessions', type: :request do
  describe 'POST /api/v1/guest_sessions' do
    it 'ゲストユーザーとしてログインできる' do
      post '/api/v1/guest_sessions'
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['logged_in']).to be true
      expect(json['token']).to be_present
      expect(json['user']['username']).to eq('guest_user')
    end

    it 'password_digest を返さない' do
      post '/api/v1/guest_sessions'
      json = response.parsed_body
      expect(json['user'].keys).not_to include('password_digest')
    end

    it '認証なしでアクセスできる' do
      post '/api/v1/guest_sessions'
      expect(response).to have_http_status(:ok)
    end

    it '複数回リクエストしても同じゲストユーザーを返す' do
      post '/api/v1/guest_sessions'
      first_user_id = response.parsed_body['user']['id']

      post '/api/v1/guest_sessions'
      second_user_id = response.parsed_body['user']['id']

      expect(first_user_id).to eq(second_user_id)
    end
  end
end
