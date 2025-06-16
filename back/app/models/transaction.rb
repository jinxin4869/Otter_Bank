class Transaction < ApplicationRecord
  belongs_to :user
  
  # 取引タイプを定義
  enum transaction_type: {
    income: 0,    # 収入（貯金）
    expense: 1    # 支出
  }
  
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :transaction_type, presence: true
  validates :description, presence: true
end
