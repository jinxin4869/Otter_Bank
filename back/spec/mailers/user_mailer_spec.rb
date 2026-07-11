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
end
