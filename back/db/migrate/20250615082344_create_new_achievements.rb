class CreateNewAchievements < ActiveRecord::Migration[7.1]
  def change
    create_table :achievements do |t|
      t.references :user, null: false, foreign_key: true
      t.string :original_achievement_id, null: false
      t.string :title, null: false
      t.text :description
      t.integer :category, null: false, default: 0  # 整数型でenum対応
      t.integer :tier, null: false, default: 0      # 整数型でenum対応
      t.boolean :unlocked, default: false, null: false
      t.integer :progress, default: 0, null: false
      t.integer :progress_target, null: false
      t.string :image_url
      t.string :reward
      t.datetime :unlocked_at
      t.timestamps
    end
    
    # インデックスを追加
    add_index :achievements, [:user_id, :original_achievement_id], unique: true, name: 'index_achievements_on_user_and_original_id'
    add_index :achievements, :category
    add_index :achievements, :tier
    add_index :achievements, :unlocked
    add_index :achievements, :created_at
  end
end
