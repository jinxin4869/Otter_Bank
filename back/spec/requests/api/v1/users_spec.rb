# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Users', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'POST /api/v1/users' do
    let(:valid_params) do
      { user: { username: 'newuser', email: 'new@example.com', password: 'password123',
                password_confirmation: 'password123' } }
    end

    it '検証エラーを日本語（属性名も日本語）で返す' do
      post '/api/v1/users', params: { user: { username: 'ab', email: 'new@example.com', password: 'short' } }
      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body['errors']).to include(
        'ユーザー名は3文字以上で入力してください', 'パスワードは8文字以上で入力してください'
      )
    end

    it 'ユーザーを登録できる' do
      expect do
        post '/api/v1/users', params: valid_params
      end.to change(User, :count).by(1)
      expect(response).to have_http_status(:created)
      expect(response.parsed_body['token']).to be_present
    end

    it '登録したユーザーは未確認で、確認メールを送る' do
      expect do
        post '/api/v1/users', params: valid_params
      end.to have_enqueued_mail(UserMailer, :email_confirmation)
      expect(User.find_by(email: 'new@example.com').email_confirmed?).to be false
    end

    it '登録に失敗したときは確認メールを送らない' do
      expect do
        post '/api/v1/users', params: { user: { username: 'ab', email: 'new@example.com', password: 'short' } }
      end.not_to have_enqueued_mail(UserMailer, :email_confirmation)
    end

    it '登録時に admin を送っても管理者にはならない' do
      post '/api/v1/users', params: { user: valid_params[:user].merge(admin: true) }
      expect(response).to have_http_status(:created)
      expect(User.find_by(email: 'new@example.com').admin).to be(false)
    end

    it 'メールアドレス重複ではエラーを返す' do
      create(:user, email: 'new@example.com')
      post '/api/v1/users', params: valid_params
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'GET /api/v1/user' do
    it '認証済みユーザーの情報を返す' do
      get '/api/v1/user', headers: headers
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['id']).to eq(user.id)
      expect(json['email']).to eq(user.email)
    end

    it '未認証ではアクセスできない' do
      get '/api/v1/user'
      expect(response).to have_http_status(:unauthorized)
    end

    context 'メールアドレスを確認していないとき' do
      let(:user) { create(:user, :unconfirmed) }

      it '期限内なら確認状態と期限を返す' do
        get '/api/v1/user', headers: headers
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['email_confirmed']).to be false
        expect(Time.zone.parse(json['email_confirmation_deadline'])).to be_within(1.second).of(user.created_at + 7.days)
      end

      it '期限を過ぎたら 403 と email_unconfirmed コードを返す' do
        user # 期限の起点（登録時刻）を先に作る
        travel_to(8.days.from_now) do
          get '/api/v1/user', headers: headers
          expect(response).to have_http_status(:forbidden)
          expect(response.parsed_body['code']).to eq('email_unconfirmed')
        end
      end
    end

    it '確認済みなら email_confirmed が true で期限は null' do
      get '/api/v1/user', headers: headers
      json = response.parsed_body
      expect(json['email_confirmed']).to be true
      expect(json['email_confirmation_deadline']).to be_nil
    end
  end

  describe 'PATCH /api/v1/user' do
    it '自分のプロフィールを更新できる' do
      patch '/api/v1/user', params: { user: { username: '新ユーザー名' } }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(user.reload.username).to eq('新ユーザー名')
    end

    it 'API から自分を管理者にすることはできない' do
      patch '/api/v1/user', params: { user: { username: '新ユーザー名', admin: true } }, headers: headers
      expect(user.reload.admin).to be(false)
    end

    it 'バリデーションエラーは 422 を返す' do
      patch '/api/v1/user', params: { user: { username: 'ab' } }, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it '未認証では更新できない' do
      patch '/api/v1/user', params: { user: { username: '書き換え' } }
      expect(response).to have_http_status(:unauthorized)
    end

    context 'パスワード・メールアドレスの変更' do
      let(:user) { create(:user, password: 'current-pass', password_confirmation: 'current-pass') }

      it '現在のパスワード無しではパスワードを変更できない' do
        patch '/api/v1/user', params: { user: { password: 'new-pass-123', password_confirmation: 'new-pass-123' } },
                              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body['code']).to eq('invalid_current_password')
        expect(user.reload.authenticate('current-pass')).to be_truthy
      end

      it '現在のパスワードが正しければパスワードを変更できる' do
        patch '/api/v1/user',
              params: { user: { current_password: 'current-pass', password: 'new-pass-123',
                                password_confirmation: 'new-pass-123' } },
              headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload.authenticate('new-pass-123')).to be_truthy
      end

      it 'パスワードを変えると他の端末のリフレッシュトークンは失効し、この端末には新しいトークンを発行する' do
        other_device = RefreshToken.generate_for(user)

        patch '/api/v1/user',
              params: { user: { current_password: 'current-pass', password: 'new-pass-123',
                                password_confirmation: 'new-pass-123' } },
              headers: headers

        expect(response).to have_http_status(:ok)
        expect(other_device.reload.revoked).to be true
        new_token = response.cookies['refresh_token']
        expect(new_token).to be_present

        cookies[:refresh_token] = other_device.token
        post '/api/v1/auth/refresh'
        expect(response).to have_http_status(:unauthorized)

        cookies[:refresh_token] = new_token
        post '/api/v1/auth/refresh'
        expect(response).to have_http_status(:ok)
      end

      it 'この端末の古い Cookie も失効し、新しいトークンに置き換わる' do
        this_device = RefreshToken.generate_for(user)
        cookies[:refresh_token] = this_device.token

        patch '/api/v1/user',
              params: { user: { current_password: 'current-pass', password: 'new-pass-123',
                                password_confirmation: 'new-pass-123' } },
              headers: headers

        expect(this_device.reload.revoked).to be true
        expect(response.cookies['refresh_token']).to be_present
        expect(response.cookies['refresh_token']).not_to eq(this_device.token)
      end

      it 'パスワード以外の変更ではリフレッシュトークンを失効させない' do
        other_device = RefreshToken.generate_for(user)

        patch '/api/v1/user', params: { user: { name: '表示名' } }, headers: headers

        expect(response).to have_http_status(:ok)
        expect(other_device.reload.revoked).to be false
        expect(response.cookies).not_to have_key('refresh_token')
      end

      it '現在のパスワード無しではメールアドレスを変更できない' do
        patch '/api/v1/user', params: { user: { email: 'changed@example.com' } }, headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'OAuth のみ（パスワード未設定）のユーザーには password_not_set を返す' do
        # Google ログインで作られたユーザーは password_digest が無い（User.find_or_create_from_oauth と同じ状態）
        oauth_user = create(:user)
        oauth_user.oauth_providers.create!(provider: 'google_oauth2', uid: 'uid-1')
        oauth_user.update_columns(password_digest: nil)
        oauth_headers = { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: oauth_user.id)}" }
        patch '/api/v1/user', params: { user: { password: 'new-pass-123', password_confirmation: 'new-pass-123' } },
                              headers: oauth_headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body['code']).to eq('password_not_set')
      end

      it '同じメールアドレスを送るだけなら現在のパスワードは不要' do
        patch '/api/v1/user', params: { user: { email: user.email, name: '表示名' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload.name).to eq('表示名')
        expect(user.unconfirmed_email).to be_nil
      end
    end

    context 'メールアドレスの変更の申請' do
      let(:user) do
        create(:user, email: 'before@example.com', password: 'current-pass', password_confirmation: 'current-pass')
      end
      let(:change_params) { { user: { email: 'after@example.com', current_password: 'current-pass' } } }

      it 'email はすぐには変えず、確認待ちの新しいアドレスとして返す' do
        patch '/api/v1/user', params: change_params, headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to include('email' => 'before@example.com',
                                                'unconfirmed_email' => 'after@example.com')
        user.reload
        expect(user.email).to eq('before@example.com')
        expect(user.unconfirmed_email).to eq('after@example.com')
        expect(user.email_confirmed?).to be true
      end

      it '新しいアドレスに確認メールを、今のアドレスにお知らせを送る' do
        expect { patch '/api/v1/user', params: change_params, headers: headers }
          .to have_enqueued_mail(UserMailer, :email_change_confirmation)
          .and have_enqueued_mail(UserMailer, :email_change_requested)
      end

      it 'メールの送信予約に失敗しても申請は受け付ける' do
        allow(UserMailer).to receive(:email_change_confirmation).and_raise(StandardError)
        patch '/api/v1/user', params: change_params, headers: headers

        expect(response).to have_http_status(:ok)
        expect(user.reload.unconfirmed_email).to eq('after@example.com')
      end

      it '他のユーザーが使っているアドレスには変えられない' do
        create(:user, email: 'after@example.com')

        expect { patch '/api/v1/user', params: change_params, headers: headers }
          .not_to have_enqueued_mail(UserMailer, :email_change_confirmation)
        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body['errors']).to include('新しいメールアドレスはすでに存在します')
        expect(user.reload.unconfirmed_email).to be_nil
      end

      it '形式が正しくないアドレスには変えられない' do
        patch '/api/v1/user', params: { user: { email: 'not-an-email', current_password: 'current-pass' } },
                              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.unconfirmed_email).to be_nil
      end

      it 'プロフィールの更新だけならメールは送らない' do
        expect { patch '/api/v1/user', params: { user: { name: '表示名' } }, headers: headers }
          .not_to have_enqueued_mail(UserMailer, :email_change_confirmation)
      end
    end
  end

  describe 'DELETE /api/v1/user' do
    it '自身のアカウントを削除できる' do
      delete '/api/v1/user', headers: headers
      expect(response).to have_http_status(:no_content)
      expect(User.exists?(user.id)).to be false
    end

    it '家計データ・投稿もまとめて削除し、リフレッシュトークンの Cookie も消す' do
      create(:transaction, user: user)
      create(:post, user: user)
      cookies[:refresh_token] = RefreshToken.generate_for(user).token

      expect { delete '/api/v1/user', headers: headers }
        .to change(Transaction, :count).by(-1).and change(Post, :count).by(-1)
      expect(response).to have_http_status(:no_content)
      expect(Array(response.headers['Set-Cookie']).join("\n")).to match(/refresh_token=;/)
    end

    it 'リフレッシュトークンを持つユーザーも削除でき、トークンも消える' do
      RefreshToken.generate_for(user)
      expect { delete '/api/v1/user', headers: headers }.to change(RefreshToken, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it '未認証ではアクセスできない' do
      delete '/api/v1/user'
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
