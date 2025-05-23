class CreateSavingsGoals < ActiveRecord::Migration[7.1]
  def change
    create_table :savings_goals do |t|
      t.string :title
      t.decimal :target_amount
      t.decimal :current_amount
      t.date :deadline
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
