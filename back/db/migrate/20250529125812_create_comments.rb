class CreateComments < ActiveRecord::Migration[7.1]
  def change
    create_table :comments do |t|
      t.references :post, null: false, foreign_key: true
      t.text :content
      t.string :author
      t.string :author_email
      t.integer :likes_count

      t.timestamps
    end
  end
end
