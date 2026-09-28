# frozen_string_literal: true

# user_actions はモデルと関連だけあって、どこからも書き込み・読み出しされていなかったため削除する
class DropUserActions < ActiveRecord::Migration[8.1]
  def change
    drop_table :user_actions do |t|
      t.string :action_type, null: false
      t.decimal :amount, precision: 10, scale: 2
      t.text :description
      t.references :user, null: false, foreign_key: true
      t.timestamps
      t.index :action_type
      t.index :created_at
      t.index %i[user_id created_at]
    end
  end
end
