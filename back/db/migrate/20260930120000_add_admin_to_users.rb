# frozen_string_literal: true

# 運営が他人の投稿・コメントを削除できるようにする管理者フラグ。付与は rails runner か DB で行い、API からは変更できない
class AddAdminToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :admin, :boolean, default: false, null: false
  end
end
