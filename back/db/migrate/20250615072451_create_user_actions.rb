class CreateUserActions < ActiveRecord::Migration[7.1]
  def change
    create_table :user_actions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :action_type, null: false
      t.decimal :amount, precision: 10, scale: 2
      t.text :description
      t.timestamps
    end

    add_index :user_actions, :action_type
    add_index :user_actions, :created_at
    add_index :user_actions, [:user_id, :created_at]
  end
end
