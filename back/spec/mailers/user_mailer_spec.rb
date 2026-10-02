# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserMailer, type: :mailer do
  describe '#password_reset' do
    let(:user) { create(:user, email: 'reset@example.com') }
    let(:token) { 'sample-reset-token-abc123' }
    let(:mail) { described_class.password_reset(user, token) }

    it '宛先がユーザーのメールアドレスである' do
      expect(mail.to).to eq([user.email])
    end

    it '件名がパスワードリセットの案内である' do
      expect(mail.subject).to eq('【獺獺銀行】パスワードリセットのご案内')
    end

    it '本文にリセットトークンを含むURLが含まれる' do
      expect(mail.text_part.body.decoded).to include(token)
      expect(mail.html_part.body.decoded).to include(token)
    end
  end

  describe '#email_confirmation' do
    let(:user) { create(:user, :unconfirmed, email: 'confirm@example.com') }
    let(:mail) { described_class.email_confirmation(user) }

    it '宛先がユーザーのメールアドレスで、件名が確認のお願いである' do
      expect(mail.to).to eq([user.email])
      expect(mail.subject).to eq('【獺獺銀行】メールアドレスの確認のお願い')
    end

    it '本文の確認 URL のトークン（URL エンコード済み）を戻すとユーザーを引ける' do
      encoded = mail.text_part.body.decoded[%r{/confirm-email/(\S+)}, 1]
      expect(encoded).to match(/\A[A-Za-z0-9%\-_.~]+\z/) # パスに入れても区切られない
      expect(User.find_by_token_for(:email_confirmation, CGI.unescape(encoded))).to eq(user)
      expect(mail.html_part.body.decoded).to include("/confirm-email/#{encoded}")
    end

    it '本文にログインできなくなる期限を含む' do
      expect(mail.text_part.body.decoded).to include(I18n.l(user.email_confirmation_deadline, format: :long))
    end
  end

  describe '#email_change_confirmation' do
    let(:user) { create(:user, email: 'before@example.com', unconfirmed_email: 'after@example.com') }
    let(:mail) { described_class.email_change_confirmation(user) }

    it '新しいアドレスに送る' do
      expect(mail.to).to eq(['after@example.com'])
      expect(mail.subject).to eq('【獺獺銀行】新しいメールアドレスの確認のお願い')
    end

    it '本文の確認 URL のトークン（URL エンコード済み）を戻すとユーザーを引ける' do
      encoded = mail.text_part.body.decoded[%r{/confirm-email-change/(\S+)}, 1]
      expect(encoded).to match(/\A[A-Za-z0-9%\-_.~]+\z/)
      expect(User.find_by_token_for(:email_change, CGI.unescape(encoded))).to eq(user)
      expect(mail.html_part.body.decoded).to include("/confirm-email-change/#{encoded}")
    end

    it '申請が無ければ送らない' do
      user.update_columns(unconfirmed_email: nil)
      expect(mail.message).to be_a(ActionMailer::Base::NullMail)
    end
  end

  describe '#email_change_requested' do
    let(:user) { create(:user, email: 'before@example.com', unconfirmed_email: 'after@example.com') }
    let(:mail) { described_class.email_change_requested(user) }

    it '今のアドレスに、申請された新しいアドレスとパスワード変更の導線を送る' do
      expect(mail.to).to eq(['before@example.com'])
      expect(mail.subject).to eq('【獺獺銀行】メールアドレスの変更が申請されました')
      expect(mail.text_part.body.decoded).to include('after@example.com').and include('/reset-password')
    end
  end
end
