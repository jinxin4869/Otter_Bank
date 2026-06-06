# frozen_string_literal: true

class CreateBudgets < ActiveRecord::Migration[8.1]
  def change
    create_table :budgets do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :year,   null: false
      t.integer :month,  null: false
      t.decimal :amount, null: false

      t.timestamps
    end

    add_index :budgets, %i[user_id year month], unique: true
  end
end
