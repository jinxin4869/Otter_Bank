# frozen_string_literal: true

class AddSignInTrackingToUsers < ActiveRecord::Migration[8.1]
  def change
    # current_sign_in_at: 今回のサインイン時刻 / last_sign_in_at: 前回のサインイン時刻
    # sleeping mood（7日以上ぶりのログイン）判定には last_sign_in_at を参照する
    add_column :users, :current_sign_in_at, :datetime
    add_column :users, :last_sign_in_at, :datetime
  end
end
