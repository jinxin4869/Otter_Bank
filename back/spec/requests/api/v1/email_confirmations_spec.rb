# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::EmailConfirmations', type: :request do
  let(:user) { create(:user, :unconfirmed) }

  describe 'POST /api/v1/auth/confirm-email' do
    it '有効なトークンでメールアドレスを確認済みにして 200 を返す' do
      token = user.generate_token_for(:email_confirmation)
      post '/api/v1/auth/confirm-email', params: { token: token }

      expect(response).to have_http_status(:ok)
      expect(user.reload.email_confirmed?).to be true
    end

    it '期限を過ぎてログインできないユーザーでも確認できる' do
      user
      travel_to(8.days.from_now) do
        post '/api/v1/auth/confirm-email', params: { token: user.generate_token_for(:email_confirmation) }
        expect(response).to have_http_status(:ok)
      end
      expect(user.reload.email_confirmed?).to be true
    end

    it '不正なトークンでは 422 を返す' do
      post '/api/v1/auth/confirm-email', params: { token: 'invalid-token' }
      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body['error']).to eq('確認リンクが無効または期限切れです。確認メールを送り直してください。')
      expect(user.reload.email_confirmed?).to be false
    end

    it '24 時間を過ぎたトークンでは 422 を返す' do
      token = user.generate_token_for(:email_confirmation)
      travel_to(25.hours.from_now) do
        post '/api/v1/auth/confirm-email', params: { token: token }
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    it 'トークンが無いときは 422 を返す' do
      post '/api/v1/auth/confirm-email'
      expect(response).to have_http_status(:unprocessable_content)
    end

    it '不正な Authorization ヘッダー付きでも認証なしで処理する' do
      post '/api/v1/auth/confirm-email', params: { token: user.generate_token_for(:email_confirmation) },
                                         headers: { 'Authorization' => 'Bearer invalid-token' }
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /api/v1/auth/confirm-email/resend' do
    it '未確認のユーザーには確認メールを送り直す' do
      expect do
        post '/api/v1/auth/confirm-email/resend', params: { email: user.email }
      end.to have_enqueued_mail(UserMailer, :email_confirmation)
      expect(response).to have_http_status(:ok)
    end

    it '確認済みのユーザーには送らないが、同じ 200 を返す' do
      confirmed = create(:user)
      expect do
        post '/api/v1/auth/confirm-email/resend', params: { email: confirmed.email }
      end.not_to have_enqueued_mail(UserMailer, :email_confirmation)
      expect(response).to have_http_status(:ok)
    end

    it '登録されていないアドレスでも同じ 200 を返し、メールは送らない（登録有無を知られないため）' do
      expect do
        post '/api/v1/auth/confirm-email/resend', params: { email: 'nobody@example.com' }
      end.not_to have_enqueued_mail(UserMailer, :email_confirmation)
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['message']).to eq('確認メールを送信しました。メールをご確認ください。')
    end

    it '不正な Authorization ヘッダー付きでも認証なしで処理する' do
      post '/api/v1/auth/confirm-email/resend', params: { email: user.email },
                                                headers: { 'Authorization' => 'Bearer invalid-token' }
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /api/v1/auth/confirm-email-change' do
    let(:user) { create(:user, email: 'before@example.com', unconfirmed_email: 'after@example.com') }
    let(:token) { user.generate_token_for(:email_change) }

    it '有効なトークンで新しいアドレスへ切り替え、確認済みにする（ログインしていなくてもよい）' do
      user.update_columns(email_confirmed_at: nil)
      post '/api/v1/auth/confirm-email-change', params: { token: token }

      expect(response).to have_http_status(:ok)
      user.reload
      expect(user.email).to eq('after@example.com')
      expect(user.unconfirmed_email).to be_nil
      expect(user.email_confirmed?).to be true
    end

    it '不正なトークンでは 422 を返し、アドレスは変えない' do
      post '/api/v1/auth/confirm-email-change', params: { token: 'invalid-token' }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body['error']).to eq('確認リンクが無効または期限切れです。設定画面からもう一度変更してください。')
      expect(user.reload.email).to eq('before@example.com')
    end

    it '24 時間を過ぎたトークンでは 422 を返す' do
      token
      travel_to(25.hours.from_now) do
        post '/api/v1/auth/confirm-email-change', params: { token: token }
        expect(response).to have_http_status(:unprocessable_content)
      end
      expect(user.reload.email).to eq('before@example.com')
    end

    it '別のアドレスへ申請し直したら、前の申請のリンクは使えない' do
      old_token = token
      user.update!(unconfirmed_email: 'other@example.com')

      post '/api/v1/auth/confirm-email-change', params: { token: old_token }
      expect(response).to have_http_status(:unprocessable_content)
      expect(user.reload.email).to eq('before@example.com')
    end

    it '申請のあとに他のユーザーがそのアドレスを使い始めていたら、切り替えずに 422 を返す' do
      token
      create(:user, email: 'after@example.com')

      post '/api/v1/auth/confirm-email-change', params: { token: token }
      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body['error']).to eq('このメールアドレスはすでに使われているため変更できません。')
      expect(user.reload.email).to eq('before@example.com')
    end

    it 'メールアドレスの確認用のトークンでは変更できない' do
      post '/api/v1/auth/confirm-email-change', params: { token: user.generate_token_for(:email_confirmation) }
      expect(response).to have_http_status(:unprocessable_content)
      expect(user.reload.email).to eq('before@example.com')
    end
  end
end
