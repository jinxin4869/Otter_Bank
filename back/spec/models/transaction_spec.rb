# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Transaction, type: :model do
  # アソシエーション
  it { should belong_to(:user) }

  # バリデーション
  it { should validate_presence_of(:amount) }
  it { should validate_presence_of(:description) }
  it { should validate_presence_of(:transaction_type) }
  it { should validate_presence_of(:date) }
  it { should validate_numericality_of(:amount).is_greater_than(0) }

  describe 'transaction_type enum' do
    it 'incomeが有効' do
      transaction = build(:transaction, transaction_type: :income)
      expect(transaction).to be_valid
    end

    it 'expenseが有効' do
      transaction = build(:transaction, transaction_type: :expense)
      expect(transaction).to be_valid
    end
  end

  describe 'amountのバリデーション' do
    it '0以下のamountは無効' do
      transaction = build(:transaction, amount: 0)
      expect(transaction).not_to be_valid
    end

    it '負のamountは無効' do
      transaction = build(:transaction, amount: -100)
      expect(transaction).not_to be_valid
    end

    it '正のamountは有効' do
      transaction = build(:transaction, amount: 1000)
      expect(transaction).to be_valid
    end
  end
end
