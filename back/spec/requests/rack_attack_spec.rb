# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Rack::Attack レート制限', type: :request do
  # Rack::Attack は「現在時刻 ÷ 期間」で回数の区切りを決めるため、連続リクエストが分（時）の
  # 境目をまたぐと回数が 2 つに分かれ、上限を超えても 429 にならずテストがまれに落ちる。
  # 区切りの途中の時刻に止めて、すべてのリクエストを同じ区切りで数えさせる
  around do |example|
    travel_to(Time.zone.local(2026, 1, 1, 12, 30, 30)) { example.run }
  end

  before do
    Rack::Attack.enabled = true
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
  end

  after do
    Rack::Attack.reset!
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

  describe 'パスワードリセット (POST /api/v1/auth/reset-password)' do
    it 'リセットメールの送信は 1 時間に 5 回を超えると 429 を返す' do
      6.times do
        post '/api/v1/auth/reset-password', params: { email: 'a@example.com' }, env: { 'REMOTE_ADDR' => '3.3.3.3' }
      end
      expect(response.status).to eq(429)
    end

    it 'リセットの確定（トークンの総当たり）も同じ制限を受ける' do
      params = { token: 'guess', password: 'newpassword1' }
      6.times { post '/api/v1/auth/reset-password/confirm', params: params, env: { 'REMOTE_ADDR' => '3.3.3.4' } }
      expect(response.status).to eq(429)
    end

    it '制限回数以内では通常レスポンスを返す' do
      5.times do
        post '/api/v1/auth/reset-password', params: { email: 'a@example.com' }, env: { 'REMOTE_ADDR' => '3.3.3.5' }
      end
      expect(response.status).not_to eq(429)
    end
  end

  describe '掲示板の投稿・コメント' do
    let(:user) { create(:user) }
    let(:headers) { { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: user.id)}" } }
    let(:post_params) { { post: { title: 'タイトル', content: '本文' } } }

    it '投稿は 1 分間に 10 回を超えると 429 を返す' do
      11.times { post '/api/v1/posts', params: post_params, headers: headers, env: { 'REMOTE_ADDR' => '4.4.4.1' } }
      expect(response.status).to eq(429)
    end

    it '投稿は制限回数以内なら通常どおり作成できる' do
      10.times { post '/api/v1/posts', params: post_params, headers: headers, env: { 'REMOTE_ADDR' => '4.4.4.2' } }
      expect(response).to have_http_status(:created)
    end

    it 'コメントは 1 分間に 10 回を超えると 429 を返す' do
      target = create(:post)
      11.times do
        post "/api/v1/posts/#{target.id}/comments", params: { comment: { content: 'コメント' } }, headers: headers,
                                                    env: { 'REMOTE_ADDR' => '4.4.4.3' }
      end
      expect(response.status).to eq(429)
    end

    it '投稿の閲覧（GET）は制限の対象外' do
      11.times { get '/api/v1/posts', env: { 'REMOTE_ADDR' => '4.4.4.4' } }
      expect(response).to have_http_status(:ok)
    end
  end
end
