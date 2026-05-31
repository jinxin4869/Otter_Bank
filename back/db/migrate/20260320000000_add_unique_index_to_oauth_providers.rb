class AddUniqueIndexToOauthProviders < ActiveRecord::Migration[7.1]
  def change
    add_index :oauth_providers, [:provider, :uid], unique: true
  end
end