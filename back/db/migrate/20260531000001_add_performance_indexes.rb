# frozen_string_literal: true

class AddPerformanceIndexes < ActiveRecord::Migration[8.1]
  def change
    add_index :users, :email, unique: true
    add_index :users, :username, unique: true
    add_index :transactions, %i[user_id date]
    add_index :transactions, :transaction_type
    add_index :categories, :name
  end
end
