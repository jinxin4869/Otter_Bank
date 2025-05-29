class CreatePosts < ActiveRecord::Migration[7.1]
  def change
    create_table :posts do |t|
      t.string :title
      t.text :content
      t.string :author
      t.string :author_email
      t.integer :likes_count
      t.integer :comments_count
      t.integer :views_count

      t.timestamps
    end
  end
end
