class AddDetailsToAchievements < ActiveRecord::Migration[7.1]
  def change
    add_column :achievements, :original_achievement_id, :integer
    add_column :achievements, :category, :string
    add_column :achievements, :image_url, :string
    add_column :achievements, :reward, :string
    add_column :achievements, :tier, :integer
  end
end
