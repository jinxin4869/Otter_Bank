# frozen_string_literal: true

class AddUniqueIndexToOauthProviders < ActiveRecord::Migration[7.1]
  def change
    add_index :oauth_providers, %i[provider uid], unique: true
  end
end
