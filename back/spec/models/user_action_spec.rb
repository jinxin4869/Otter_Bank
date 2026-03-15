# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserAction, type: :model do
  # アソシエーション
  it { should belong_to(:user) }

  # バリデーション
  it { should validate_presence_of(:action_type) }
  it { should validate_numericality_of(:amount).is_greater_than(0).allow_nil }

  describe 'action_type enum' do
    %i[savings expense goal_achieved emergency_fund investment].each do |type|
      it "#{type}が有効" do
        user_action = build(:user_action, action_type: type)
        expect(user_action).to be_valid
      end
    end
  end

  describe 'amountのバリデーション' do
    it 'nilのamountは有効' do
      user_action = build(:user_action, amount: nil)
      expect(user_action).to be_valid
    end

    it '0以下のamountは無効' do
      user_action = build(:user_action, amount: 0)
      expect(user_action).not_to be_valid
    end

    it '負のamountは無効' do
      user_action = build(:user_action, amount: -100)
      expect(user_action).not_to be_valid
    end

    it '正のamountは有効' do
      user_action = build(:user_action, amount: 1000)
      expect(user_action).to be_valid
    end
  end
end
