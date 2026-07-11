# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::PasswordResets', type: :request do
  let(:user) { create(:user, email: 'reset@example.com', password: 'password123') }

  describe 'POST /api/v1/auth/reset-password' do
    it 'リセットメールを送信しトークンを生成して200を返す' do
      expect do
        post '/api/v1/auth/reset-password', params: { email: user.email }
      end.to have_enqueued_mail(UserMailer, :password_reset)

      expect(response).to have_http_status(:ok)
      expect(user.reload.reset_password_token).to be_present
    end

    it '存在しないメールアドレスでも200を返し、メールは送信しない（列挙攻撃対策）' do
      expect do
        post '/api/v1/auth/reset-password', params: { email: 'nobody@example.com' }
      end.not_to have_enqueued_mail(UserMailer, :password_reset)

      expect(response).to have_http_status(:ok)
    end

    it '認証ヘッダーなしでもアクセスできる' do
      post '/api/v1/auth/reset-password', params: { email: user.email }
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /api/v1/auth/reset-password/confirm' do
    let(:token) { user.generate_password_reset_token! }

    it '有効なトークンでパスワードを更新しトークンを消去して200を返す' do
      post '/api/v1/auth/reset-password/confirm', params: { token: token, password: 'newpassword123' }

      expect(response).to have_http_status(:ok)
      expect(user.reload.authenticate('newpassword123')).to be_truthy
      expect(user.reset_password_token).to be_nil
    end

    it '無効なトークンでは422を返す' do
      post '/api/v1/auth/reset-password/confirm', params: { token: 'invalid-token', password: 'newpassword123' }

      expect(response).to have_http_status(:unprocessable_content)
    end

    it '期限切れトークンでは422を返す' do
      token # トークンを生成してから送信日時を有効期限より前に戻す
      user.update_columns(reset_password_sent_at: (User::TOKEN_EXPIRY_HOURS + 1).hours.ago)

      post '/api/v1/auth/reset-password/confirm', params: { token: token, password: 'newpassword123' }

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'パスワードが短い場合は422を返す' do
      post '/api/v1/auth/reset-password/confirm', params: { token: token, password: 'short' }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
