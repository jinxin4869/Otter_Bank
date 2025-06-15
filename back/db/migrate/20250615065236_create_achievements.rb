class CreateAchievements < ActiveRecord::Migration[7.1]
  def change
    create_table :achievements do |t|
      t.references :user, null: false, foreign_key: true
      t.string :original_achievement_id, null: false
      t.string :title, null: false
      t.text :description
      t.string :category, null: false
      t.string :tier
      t.boolean :unlocked, default: false
      t.integer :progress, default: 0
      t.integer :progress_target, default: 1
      t.string :image_url
      t.string :reward
      t.datetime :unlocked_at
      t.timestamps
    end
    
    # インデックス
    add_index :achievements, [:user_id, :original_achievement_id], unique: true
    add_index :achievements, :category
    add_index :achievements, :unlocked
    add_index :achievements, :tier
  end
end
