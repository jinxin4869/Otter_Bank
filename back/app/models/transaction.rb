# frozen_string_literal: true

class Transaction < ApplicationRecord
  belongs_to :user

  # 取引タイプを定義（string列のためキー文字列で格納）
  enum :transaction_type, {
    income: 'income',    # 収入（貯金）
    expense: 'expense'   # 支出
  }

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :description, presence: true
  validates :transaction_type, presence: true
  validates :date, presence: true
end
