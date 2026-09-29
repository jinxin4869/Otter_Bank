# frozen_string_literal: true

# 取引の日付は「日」だけを扱うのに datetime で持っていたため、タイムゾーン変換で日付がずれる余地があった。
# date 型にして、保存時刻やサーバーのタイムゾーンに依存しないようにする
class ChangeTransactionsDateToDate < ActiveRecord::Migration[8.1]
  def up
    change_column :transactions, :date, :date
  end

  def down
    change_column :transactions, :date, :datetime
  end
end
