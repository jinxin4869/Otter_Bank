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

      it 'CONTACT_NOTIFY_TO が設定されていれば運営への通知メールも送る' do
        allow(ENV).to receive(:fetch).and_call_original
        allow(ENV).to receive(:fetch).with('CONTACT_NOTIFY_TO', nil).and_return('admin@example.com')

        expect do
          post '/api/v1/contacts', params: valid_params
        end.to have_enqueued_mail(ContactMailer, :confirmation).and have_enqueued_mail(ContactMailer, :notify_admin)
      end

      it 'CONTACT_NOTIFY_TO が未設定なら運営への通知は送らない（自動返信は送る）' do
        allow(ENV).to receive(:fetch).and_call_original
        allow(ENV).to receive(:fetch).with('CONTACT_NOTIFY_TO', nil).and_return(nil)

        expect do
          post '/api/v1/contacts', params: valid_params
        end.to have_enqueued_mail(ContactMailer, :confirmation)
        expect do
          post '/api/v1/contacts', params: valid_params
        end.not_to have_enqueued_mail(ContactMailer, :notify_admin)
      end

      it '不正なAuthorizationヘッダーが付与されていても送信できる' do
        post '/api/v1/contacts', params: valid_params, headers: { 'Authorization' => 'Bearer invalid-token' }
        expect(response).to have_http_status(:created)
      end
    end

    context '異常系' do
      it '名前が空の場合は422を返す' do
        post '/api/v1/contacts', params: { contact: valid_params[:contact].merge(name: '') }
        expect(response).to have_http_status(:unprocessable_content)
        json = response.parsed_body
        expect(json['errors']).to be_present
      end

      it 'メールアドレスが不正な場合は422を返す' do
        post '/api/v1/contacts', params: { contact: valid_params[:contact].merge(email: 'invalid-email') }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'メッセージが空の場合は422を返す' do
        post '/api/v1/contacts', params: { contact: valid_params[:contact].merge(message: '') }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'subjectが選択肢に無い値の場合は422を返す' do
        post '/api/v1/contacts', params: { contact: valid_params[:contact].merge(subject: '自由入力') }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'subjectが空の場合は422を返す' do
        post '/api/v1/contacts', params: { contact: valid_params[:contact].merge(subject: '') }
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
