# frozen_string_literal: true

class RemoveAuthorFromPostsAndComments < ActiveRecord::Migration[8.1]
  def change
    remove_column :posts, :author, :string
    remove_column :comments, :author, :string
  end
end
