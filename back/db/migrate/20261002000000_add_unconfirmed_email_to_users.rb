# frozen_string_literal: true

# メールアドレスの変更の確認（#459）。新しいアドレスは確認が済むまでここに置き、email は変えない
class AddUnconfirmedEmailToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :unconfirmed_email, :string
  end
end
