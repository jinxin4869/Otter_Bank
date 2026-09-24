# frozen_string_literal: true

require 'rails_helper'

# フロントは本文を JSON で送る。JSON の解析（json gem と ActiveSupport の組み合わせ）が壊れていないことを確認する
RSpec.describe 'JSON 形式のリクエスト', type: :request do
  let(:password) { 'password123' }
  let(:user) { create(:user, password: password) }

  it 'JSON で送ったログインが成功する' do
    post '/api/v1/sessions', params: { email: user.email, password: password }, as: :json
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body['token']).to be_present
  end

  it 'JSON で送った取引の登録が成功する' do
    headers = { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: user.id)}" }
    params = { transaction: { amount: 1000, transaction_type: 'expense', description: '昼食', category: '食費',
                              date: Date.current.to_s } }
    post '/api/v1/transactions', params: params, headers: headers, as: :json
    expect(response).to have_http_status(:created)
  end

  it 'ActiveSupport::JSON.decode が JSON を解析できる' do
    expect(ActiveSupport::JSON.decode('{"a":1}')).to eq('a' => 1)
  end
end
