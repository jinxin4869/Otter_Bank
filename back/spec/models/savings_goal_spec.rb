# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SavingsGoal, type: :model do
  # アソシエーション
  it { should belong_to(:user) }

  # バリデーション
  it { should validate_presence_of(:title) }
  it { should validate_presence_of(:target_amount) }
  it { should validate_presence_of(:deadline) }
  it { should validate_numericality_of(:target_amount).is_greater_than(0) }
  it { should validate_numericality_of(:current_amount).is_greater_than_or_equal_to(0).allow_nil }

  describe 'ファクトリー' do
    it '有効なファクトリーを持つ' do
      expect(build(:savings_goal)).to be_valid
    end
  end

  describe 'current_amountのバリデーション' do
    it 'current_amountがtarget_amount以下の場合は有効' do
      goal = build(:savings_goal, target_amount: 100_000, current_amount: 50_000)
      expect(goal).to be_valid
    end

    it 'current_amountがtarget_amountと等しい場合は有効' do
      goal = build(:savings_goal, target_amount: 100_000, current_amount: 100_000)
      expect(goal).to be_valid
    end

    it 'current_amountがtarget_amountを超える場合は無効' do
      goal = build(:savings_goal, target_amount: 100_000, current_amount: 100_001)
      expect(goal).not_to be_valid
      expect(goal.errors[:current_amount]).to include('は目標金額以下である必要があります')
    end

    it 'current_amountが負の場合は無効' do
      goal = build(:savings_goal, current_amount: -1)
      expect(goal).not_to be_valid
    end

    it 'current_amountがnilの場合は有効' do
      goal = build(:savings_goal, current_amount: nil)
      expect(goal).to be_valid
    end
  end

  describe 'target_amountのバリデーション' do
    it '0以下のtarget_amountは無効' do
      goal = build(:savings_goal, target_amount: 0)
      expect(goal).not_to be_valid
    end

    it '負のtarget_amountは無効' do
      goal = build(:savings_goal, target_amount: -1000)
      expect(goal).not_to be_valid
    end
  end
end
