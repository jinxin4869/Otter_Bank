# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Contacts', type: :request do
  describe 'POST /api/v1/contacts' do
    let(:valid_params) do
      {
        contact: {
          name: '山田 太郎',
          email: 'yamada@example.com',
          subject: 'question',
          message: 'テストのお問い合わせ内容です。'
        }
      }
    end

    context '正常系' do
      it 'お問い合わせを作成して201を返す' do
        expect do
          post '/api/v1/contacts', params: valid_params
        end.to change(Contact, :count).by(1)

        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json['message']).to eq('お問い合わせを受け付けました。')
      end

      it '不正なAuthorizationヘッダーが付与されていても送信できる' do
        post '/api/v1/contacts', params: valid_params, headers: { 'Authorization' => 'Bearer invalid-token' }
        expect(response).to have_http_status(:created)
      end
    end

    context '異常系' do
      it '名前が空の場合は422を返す' do
        post '/api/v1/contacts', params: { contact: valid_params[:contact].merge(name: '') }
        expect(response).to have_http_status(:unprocessable_entity)
        json = response.parsed_body
        expect(json['errors']).to be_present
      end

      it 'メールアドレスが不正な場合は422を返す' do
        post '/api/v1/contacts', params: { contact: valid_params[:contact].merge(email: 'invalid-email') }
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'メッセージが空の場合は422を返す' do
        post '/api/v1/contacts', params: { contact: valid_params[:contact].merge(message: '') }
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'subjectが空の場合は422を返す' do
        post '/api/v1/contacts', params: { contact: valid_params[:contact].merge(subject: '') }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
