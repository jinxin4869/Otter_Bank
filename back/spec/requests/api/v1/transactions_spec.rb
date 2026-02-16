# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Transactions', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/transactions' do
    before do
      create(:transaction, user: user, amount: 5000, transaction_type: :income, description: '給料', category: '給与',
                           date: Date.current)
      create(:transaction, user: user, amount: 1000, transaction_type: :expense, description: '食費', category: '食費',
                           date: Date.current)
      create(:transaction, user: user, amount: 3000, transaction_type: :income, description: '先月の給料', category: '給与',
                           date: 1.month.ago)
    end

    it '認証済みユーザーの取引一覧を返す' do
      get '/api/v1/transactions', headers: headers
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['transactions'].length).to eq(3)
      expect(json['summary']).to include('total_income', 'total_expense', 'balance')
    end

    it '期間フィルタが機能する' do
      get '/api/v1/transactions',
          params: { start_date: Date.current.beginning_of_month, end_date: Date.current.end_of_month }, headers: headers
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['transactions'].length).to eq(2)
    end

    it 'タイプフィルタが機能する' do
      get '/api/v1/transactions', params: { transaction_type: 'income' }, headers: headers
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['transactions'].length).to eq(2)
    end

    it 'サマリーがフィルタ後の値を反映する' do
      get '/api/v1/transactions', params: { transaction_type: 'income' }, headers: headers
      json = response.parsed_body
      expect(json['summary']['total_expense'].to_f).to eq(0)
    end

    it '未認証ではアクセスできない' do
      get '/api/v1/transactions'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/transactions' do
    let(:valid_params) do
      { transaction: { amount: 2000, transaction_type: 'expense', description: '交通費', category: '交通',
                       date: Date.current } }
    end

    it '取引を作成できる' do
      expect do
        post '/api/v1/transactions', params: valid_params, headers: headers
      end.to change(Transaction, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it '不正なパラメータではエラーを返す' do
      post '/api/v1/transactions', params: { transaction: { amount: nil } }, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'PATCH /api/v1/transactions/:id' do
    let!(:transaction) do
      create(:transaction, user: user, amount: 1000, transaction_type: :expense, description: '食費', category: '食費',
                           date: Date.current)
    end

    it '自分の取引を更新できる' do
      patch "/api/v1/transactions/#{transaction.id}", params: { transaction: { amount: 1500 } }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(transaction.reload.amount.to_f).to eq(1500.0)
    end

    it '他のユーザーの取引にはアクセスできない' do
      other_user = create(:user)
      other_transaction = create(:transaction, user: other_user, amount: 500, transaction_type: :expense,
                                               description: '他人の取引', category: 'その他', date: Date.current)
      patch "/api/v1/transactions/#{other_transaction.id}", params: { transaction: { amount: 9999 } }, headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'DELETE /api/v1/transactions/:id' do
    let!(:transaction) do
      create(:transaction, user: user, amount: 1000, transaction_type: :expense, description: '食費', category: '食費',
                           date: Date.current)
    end

    it '自分の取引を削除できる' do
      expect do
        delete "/api/v1/transactions/#{transaction.id}", headers: headers
      end.to change(Transaction, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
