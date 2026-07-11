# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContactMailer, type: :mailer do
  describe '#confirmation' do
    let(:contact) { create(:contact, name: 'テスト太郎', email: 'contact@example.com', message: 'お問い合わせ本文です') }
    let(:mail) { described_class.confirmation(contact) }

    it '宛先がお問い合わせ者のメールアドレスである' do
      expect(mail.to).to eq([contact.email])
    end

    it '件名がお問い合わせ受付の案内である' do
      expect(mail.subject).to eq('【Otter Bank】お問い合わせを受け付けました')
    end

    it '本文にお問い合わせ者の名前と内容が含まれる' do
      expect(mail.text_part.body.decoded).to include(contact.name)
      expect(mail.text_part.body.decoded).to include(contact.message)
    end
  end
end
