# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::SavingsGoals', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/savings_goals' do
    before { create_list(:savings_goal, 2, user: user) }

    it '認証済みユーザーの貯金目標一覧を返す' do
      get '/api/v1/savings_goals', headers: headers
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.length).to eq(2)
    end

    it '未認証ではアクセスできない' do
      get '/api/v1/savings_goals'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/savings_goals' do
    let(:valid_params) do
      { savings_goal: { title: '旅行積立', target_amount: 200_000, current_amount: 0,
                        deadline: 1.year.from_now.to_date } }
    end

    it '貯金目標を作成できる' do
      expect do
        post '/api/v1/savings_goals', params: valid_params, headers: headers
      end.to change(SavingsGoal, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it '未認証では作成できない' do
      post '/api/v1/savings_goals', params: valid_params
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PATCH /api/v1/savings_goals/:id' do
    let!(:savings_goal) { create(:savings_goal, user: user, title: '元のタイトル', target_amount: 50_000) }

    it '自分の貯金目標を更新できる' do
      patch "/api/v1/savings_goals/#{savings_goal.id}",
            params: { savings_goal: { title: '新しいタイトル', current_amount: 10_000 } },
            headers: headers
      expect(response).to have_http_status(:ok)
      expect(savings_goal.reload.title).to eq('新しいタイトル')
      expect(savings_goal.reload.current_amount.to_f).to eq(10_000.0)
    end

    it '他ユーザーの貯金目標にはアクセスできない' do
      other_goal = create(:savings_goal, user: create(:user))
      patch "/api/v1/savings_goals/#{other_goal.id}",
            params: { savings_goal: { title: '書き換え' } },
            headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it '未認証では更新できない' do
      patch "/api/v1/savings_goals/#{savings_goal.id}", params: { savings_goal: { title: '書き換え' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'DELETE /api/v1/savings_goals/:id' do
    let!(:savings_goal) { create(:savings_goal, user: user) }

    it '自分の貯金目標を削除できる' do
      expect do
        delete "/api/v1/savings_goals/#{savings_goal.id}", headers: headers
      end.to change(SavingsGoal, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it '他ユーザーの貯金目標は削除できない' do
      other_goal = create(:savings_goal, user: create(:user))
      delete "/api/v1/savings_goals/#{other_goal.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it '未認証では削除できない' do
      delete "/api/v1/savings_goals/#{savings_goal.id}"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
