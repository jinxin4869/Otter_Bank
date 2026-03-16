# frozen_string_literal: true

class RemoveRedundantEmailColumns < ActiveRecord::Migration[8.1]
  def change
    remove_column :posts,      :author_email, :string
    remove_column :comments,   :author_email, :string
    remove_column :likes,      :user_email,   :string
    remove_column :bookmarks,  :user_email,   :string
  end
end
