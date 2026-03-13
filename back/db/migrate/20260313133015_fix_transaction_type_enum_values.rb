# frozen_string_literal: true

class FixTransactionTypeEnumValues < ActiveRecord::Migration[8.1]
  def up
    # enumの整数値（"0", "1"）を文字列キー（"income", "expense"）に変換
    execute "UPDATE transactions SET transaction_type = 'income' WHERE transaction_type = '0'"
    execute "UPDATE transactions SET transaction_type = 'expense' WHERE transaction_type = '1'"
  end

  def down
    execute "UPDATE transactions SET transaction_type = '0' WHERE transaction_type = 'income'"
    execute "UPDATE transactions SET transaction_type = '1' WHERE transaction_type = 'expense'"
  end
end
