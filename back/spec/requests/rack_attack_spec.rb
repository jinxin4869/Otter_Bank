# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Rack::Attack レート制限', type: :request do
  before do
    Rack::Attack.enabled = true
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
  end

  after do
    Rack::Attack.enabled = false
  end

  describe 'ログインエンドポイント (POST /api/v1/sessions)' do
    let(:params) { { session: { email: 'test@example.com', password: 'password' } } }

    it '制限回数以内では通常レスポンスを返す' do
      5.times { post '/api/v1/sessions', params: params, env: { 'REMOTE_ADDR' => '1.2.3.4' } }
      expect(response.status).not_to eq(429)
    end

    it '1分間に5回を超えると429を返す' do
      6.times { post '/api/v1/sessions', params: params, env: { 'REMOTE_ADDR' => '1.2.3.5' } }
      expect(response.status).to eq(429)
    end

    it '429レスポンスに日本語エラーメッセージを含む' do
      6.times { post '/api/v1/sessions', params: params, env: { 'REMOTE_ADDR' => '1.2.3.6' } }
      json = response.parsed_body
      expect(json['error']).to eq('リクエストが多すぎます。しばらくしてから再試行してください。')
    end
  end

  describe 'ユーザー登録エンドポイント (POST /api/v1/users)' do
    it '1時間に10回を超えると429を返す' do
      params = { user: { email: 'new@example.com', password: 'password123', username: 'test' } }
      11.times { post '/api/v1/users', params: params, env: { 'REMOTE_ADDR' => '2.2.3.4' } }
      expect(response.status).to eq(429)
    end
  end
end
