# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Budgets', type: :request do
  let(:user)    { create(:user) }
  let(:token)   { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/budgets' do
    before { create(:budget, user: user) }

    it '認証済みで予算一覧を返す' do
      get '/api/v1/budgets', headers: headers
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to be_an(Array)
    end

    it '未認証では 401 を返す' do
      get '/api/v1/budgets'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/budgets/current' do
    context '今月の予算が存在する場合' do
      before do
        create(:budget, user: user, year: Date.current.year, month: Date.current.month, amount: 50_000)
        create(:transaction, user: user, transaction_type: :expense, amount: 20_000, date: Date.current)
      end

      it 'budget・total_expense・within_budget・remaining を返す' do
        get '/api/v1/budgets/current', headers: headers
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['budget']).to be_present
        expect(json['total_expense']).to eq('20000.0')
        expect(json['within_budget']).to be true
        expect(json['remaining']).to eq('30000.0')
      end
    end

    context '今月の予算が存在しない場合' do
      it 'budget が null を返す' do
        get '/api/v1/budgets/current', headers: headers
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['budget']).to be_nil
      end
    end

    it '未認証では 401 を返す' do
      get '/api/v1/budgets/current'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/budgets' do
    let(:valid_params) { { budget: { year: Date.current.year, month: Date.current.month, amount: 50_000 } } }

    it '有効なパラメータで予算を作成できる' do
      post '/api/v1/budgets', params: valid_params, headers: headers
      expect(response).to have_http_status(:created)
    end

    it '予算作成後に budget_first_set 実績が解除される' do
      achievement = user.achievements.find_by(original_achievement_id: 'budget_first_set')
      expect { post '/api/v1/budgets', params: valid_params, headers: headers }
        .to change { achievement.reload.unlocked }.from(false).to(true)
    end

    it '同一月の重複登録は 422 を返す' do
      create(:budget, user: user, year: Date.current.year, month: Date.current.month)
      post '/api/v1/budgets', params: valid_params, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it '未認証では 401 を返す' do
      post '/api/v1/budgets', params: valid_params
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PATCH /api/v1/budgets/:id' do
    let(:budget) { create(:budget, user: user) }

    it '自分の予算を更新できる' do
      patch "/api/v1/budgets/#{budget.id}", params: { budget: { amount: 60_000 } }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(budget.reload.amount).to eq(60_000)
    end

    it '他ユーザーの予算には 404 を返す' do
      other_budget = create(:budget, user: create(:user))
      patch "/api/v1/budgets/#{other_budget.id}", params: { budget: { amount: 60_000 } }, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it '未認証では 401 を返す' do
      patch "/api/v1/budgets/#{budget.id}", params: { budget: { amount: 60_000 } }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
