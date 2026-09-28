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

  describe '#notify_admin' do
    let(:contact) { create(:contact, name: 'テスト太郎', email: 'contact@example.com', subject: 'bug', message: '不具合の報告です') }
    let(:mail) { described_class.notify_admin(contact) }

    before do
      allow(ENV).to receive(:fetch).and_call_original
      allow(ENV).to receive(:fetch).with('CONTACT_NOTIFY_TO').and_return('admin@example.com')
    end

    it '宛先が CONTACT_NOTIFY_TO で、返信先がお問い合わせ者である' do
      expect(mail.to).to eq(['admin@example.com'])
      expect(mail.reply_to).to eq([contact.email])
    end

    it '件名に ID と件名種別を含む' do
      expect(mail.subject).to eq("【Otter Bank】新しいお問い合わせ ##{contact.id}（bug）")
    end

    it '本文に名前・メールアドレス・内容が含まれる' do
      body = mail.body.decoded
      expect(body).to include(contact.name, contact.email, contact.message)
    end
  end
end
