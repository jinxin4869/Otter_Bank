# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget, type: :model do
  it { should belong_to(:user) }
  it { should validate_presence_of(:year) }
  it { should validate_presence_of(:month) }
  it { should validate_presence_of(:amount) }

  describe 'バリデーション' do
    let(:user) { create(:user) }

    it '有効な予算を作成できる' do
      budget = build(:budget, user: user)
      expect(budget).to be_valid
    end

    it 'amount が 0 以下の場合は無効' do
      budget = build(:budget, user: user, amount: 0)
      expect(budget).not_to be_valid
    end

    it 'month が 0 の場合は無効' do
      budget = build(:budget, user: user, month: 0)
      expect(budget).not_to be_valid
    end

    it 'month が 13 の場合は無効' do
      budget = build(:budget, user: user, month: 13)
      expect(budget).not_to be_valid
    end

    it '同一ユーザー・同一月の予算は重複登録できない' do
      create(:budget, user: user, year: 2026, month: 6)
      duplicate = build(:budget, user: user, year: 2026, month: 6)
      expect(duplicate).not_to be_valid
    end

    it '別ユーザーの同一月は登録できる' do
      other_user = create(:user)
      create(:budget, user: user, year: 2026, month: 6)
      budget = build(:budget, user: other_user, year: 2026, month: 6)
      expect(budget).to be_valid
    end
  end
end
