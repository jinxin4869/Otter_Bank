# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Health', type: :request do
  describe 'GET /api/v1/health' do
    it '認証なしで200を返す' do
      get '/api/v1/health'
      expect(response).to have_http_status(:ok)
    end

    it 'statusとtimestampを含むJSONを返す' do
      get '/api/v1/health'
      json = response.parsed_body
      expect(json['status']).to eq('ok')
      expect(json['timestamp']).to be_present
    end
  end
end
