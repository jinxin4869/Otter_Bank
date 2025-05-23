class CreateAchievements < ActiveRecord::Migration[7.1]
  def change
    create_table :achievements do |t|
      t.string :title
      t.text :description
      t.boolean :unlocked
      t.integer :progress
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
