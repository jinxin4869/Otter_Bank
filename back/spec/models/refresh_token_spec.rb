# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RefreshToken, type: :model do
  subject { build(:refresh_token) }

  # アソシエーション
  it { should belong_to(:user) }

  # バリデーション
  it { should validate_presence_of(:expires_at) }

  # token_digest は before_validation :set_token_digest で token から生成されるため、
  # shoulda の validate_presence_of/uniqueness_of ではコールバックが値を再生成してしまう。
  # モデルの設計に沿って明示的に検証する。
  describe 'token_digest' do
    it 'token が存在すると before_validation で token_digest を生成する' do
      refresh_token = build(:refresh_token, token: 'plain-token-abc')
      refresh_token.valid?
      expect(refresh_token.token_digest).to be_present
    end

    it 'token も token_digest も無い場合は無効' do
      refresh_token = build(:refresh_token, token: nil, token_digest: nil)
      expect(refresh_token).to be_invalid
      expect(refresh_token.errors[:token_digest]).to be_present
    end

    it 'token_digest が重複する場合は無効' do
      existing = create(:refresh_token)
      duplicate = build(:refresh_token, token: nil, token_digest: existing.token_digest)
      expect(duplicate).to be_invalid
      expect(duplicate.errors[:token_digest]).to be_present
    end
  end

  describe '.generate_for' do
    let(:user) { create(:user) }

    it 'ユーザーに紐づくトークンを生成する' do
      token = described_class.generate_for(user)
      expect(token).to be_persisted
      expect(token.user).to eq(user)
      expect(token.revoked).to be false
    end

    it '有効期限を14日後に設定する' do
      token = described_class.generate_for(user)
      expect(token.expires_at).to be_within(1.minute).of(14.days.from_now)
    end
  end

  describe '#active?' do
    it '有効期限内かつ revoked:false の場合は true を返す' do
      token = create(:refresh_token)
      expect(token.active?).to be true
    end

    it '期限切れの場合は false を返す' do
      token = create(:refresh_token, :expired)
      expect(token.active?).to be false
    end

    it 'revoked の場合は false を返す' do
      token = create(:refresh_token, :revoked)
      expect(token.active?).to be false
    end
  end

  describe '#revoke!' do
    it 'revoked を true に更新する' do
      token = create(:refresh_token)
      expect { token.revoke! }.to change { token.revoked }.from(false).to(true)
    end
  end

  describe '.active scope' do
    it '有効なトークンのみ返す' do
      active = create(:refresh_token)
      create(:refresh_token, :expired)
      create(:refresh_token, :revoked)
      expect(described_class.active).to contain_exactly(active)
    end
  end
end
