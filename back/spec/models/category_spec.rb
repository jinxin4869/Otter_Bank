# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Category, type: :model do
  describe 'ファクトリー' do
    it '有効なファクトリーを持つ' do
      expect(build(:category)).to be_valid
    end
  end

  describe '属性' do
    it 'name属性を持つ' do
      category = Category.new
      expect(category).to respond_to(:name)
    end
  end
end
