class DropAchievements < ActiveRecord::Migration[7.1]
  def up
    drop_table :achievements
  end

  def down
    # ロールバック時にテーブルを再作成（既存の構造）
    create_table :achievements do |t|
      t.references :user, null: false, foreign_key: true
      t.string :original_achievement_id, null: false
      t.string :title, null: false
      t.text :description
      t.string :category  # 古い文字列型
      t.string :tier      # 古い文字列型
      t.boolean :unlocked, default: false
      t.integer :progress, default: 0
      t.integer :progress_target, null: false
      t.string :image_url
      t.string :reward
      t.datetime :unlocked_at
      t.timestamps
    end
    
    add_index :achievements, [:user_id, :original_achievement_id], unique: true
    add_index :achievements, :category
    add_index :achievements, :unlocked
  end
end
