# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SavingsGoal, type: :model do
  # アソシエーション
  it { should belong_to(:user) }

  describe 'ファクトリー' do
    it '有効なファクトリーを持つ' do
      expect(build(:savings_goal)).to be_valid
    end
  end

  describe '属性' do
    it 'title属性を持つ' do
      goal = SavingsGoal.new
      expect(goal).to respond_to(:title)
    end

    it 'target_amount属性を持つ' do
      goal = SavingsGoal.new
      expect(goal).to respond_to(:target_amount)
    end

    it 'current_amount属性を持つ' do
      goal = SavingsGoal.new
      expect(goal).to respond_to(:current_amount)
    end

    it 'deadline属性を持つ' do
      goal = SavingsGoal.new
      expect(goal).to respond_to(:deadline)
    end
  end
end
