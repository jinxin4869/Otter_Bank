# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Achievements', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/achievements' do
    it '認証済みユーザーの実績一覧とサマリーを返す' do
      unlocked_achievement = create(:achievement, user: user, unlocked: true)
      locked_achievement   = create(:achievement, user: user, unlocked: false)

      get '/api/v1/achievements', headers: headers
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['achievements']).to be_an(Array)
      expect(json['achievements'].map { |a| a['id'] }).to match_array([unlocked_achievement.id, locked_achievement.id])
      expect(json['summary']).to include('total_achievements', 'unlocked_achievements')
      expect(json['summary']['total_achievements']).to eq(2)
      expect(json['summary']['unlocked_achievements']).to eq(1)
    end

    it '未認証ではアクセスできない' do
      get '/api/v1/achievements'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/achievements/:id' do
    let!(:achievement) { create(:achievement, user: user) }

    it '自分の実績を取得できる' do
      get "/api/v1/achievements/#{achievement.id}", headers: headers
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['achievement']['id']).to eq(achievement.id)
      expect(json['achievement']).to include('title', 'description', 'category', 'unlocked')
      expect(json['related_achievements']).to be_an(Array)
    end

    it '他ユーザーの実績にはアクセスできない' do
      other_achievement = create(:achievement, user: create(:user))
      get "/api/v1/achievements/#{other_achievement.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it '未認証ではアクセスできない' do
      get "/api/v1/achievements/#{achievement.id}"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PATCH /api/v1/achievements/:id' do
    let!(:achievement) { create(:achievement, user: user, progress: 0, unlocked: false) }

    it '自分の実績の進捗を更新できる' do
      patch "/api/v1/achievements/#{achievement.id}",
            params: { achievement: { progress: 5 } },
            headers: headers
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['progress']).to eq(5)
    end

    it '他ユーザーの実績は更新できない' do
      other_achievement = create(:achievement, user: create(:user))
      patch "/api/v1/achievements/#{other_achievement.id}",
            params: { achievement: { progress: 5 } },
            headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it '未認証では更新できない' do
      patch "/api/v1/achievements/#{achievement.id}", params: { achievement: { progress: 5 } }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
