class AddUserIdToBoardTables < ActiveRecord::Migration[7.1]
  def change
    # posts テーブルに user_id を追加
    add_reference :posts, :user, null: true, foreign_key: true

    # comments テーブルに user_id を追加
    add_reference :comments, :user, null: true, foreign_key: true

    # likes テーブルに user_id を追加
    add_reference :likes, :user, null: true, foreign_key: true

    # bookmarks テーブルに user_id を追加
    add_reference :bookmarks, :user, null: true, foreign_key: true

    # 重複いいね・ブックマーク防止のユニークインデックス
    add_index :likes, [:user_id, :likeable_type, :likeable_id], unique: true, name: 'index_likes_on_user_and_likeable'
    add_index :bookmarks, [:user_id, :post_id], unique: true, name: 'index_bookmarks_on_user_and_post'
  end
end
