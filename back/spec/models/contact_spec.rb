# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Contact, type: :model do
  # バリデーション
  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:email) }
  it { should validate_presence_of(:subject) }
  it { should validate_presence_of(:message) }

  describe 'メールアドレスのバリデーション' do
    it '正しい形式のメールアドレスは有効' do
      contact = build(:contact, email: 'valid@example.com')
      expect(contact).to be_valid
    end

    it '不正な形式のメールアドレスは無効' do
      contact = build(:contact, email: 'invalid_email')
      expect(contact).not_to be_valid
    end
  end

  describe 'enum' do
    it 'デフォルトステータスは pending' do
      contact = create(:contact)
      expect(contact.status).to eq('pending')
    end

    it 'resolved に変更できる' do
      contact = create(:contact)
      contact.resolved!
      expect(contact.status).to eq('resolved')
    end
  end
end
