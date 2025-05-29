class CreateBookmarks < ActiveRecord::Migration[7.1]
  def change
    create_table :bookmarks do |t|
      t.references :post, null: false, foreign_key: true
      t.string :user_email

      t.timestamps
    end
  end
end
