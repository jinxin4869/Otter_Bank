# frozen_string_literal: true

# メールアドレスの確認（#458）。確認した時刻を持ち、nil なら未確認
class AddEmailConfirmedAtToUsers < ActiveRecord::Migration[8.1]
  def up
    add_column :users, :email_confirmed_at, :datetime
    # 既存ユーザー（開発用と Google ログインのユーザーのみ）は確認済みとして扱う
    execute 'UPDATE users SET email_confirmed_at = created_at'
  end

  def down
    remove_column :users, :email_confirmed_at
  end
end
