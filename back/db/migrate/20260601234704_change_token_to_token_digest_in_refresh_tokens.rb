# frozen_string_literal: true

class ChangeTokenToTokenDigestInRefreshTokens < ActiveRecord::Migration[7.1]
  def change
    # 既存のリフレッシュトークンは平文で保存されており、ダイジェスト化されたものと照合できなくなるため、
    # 自動的に無効化されます（セキュリティ上安全）
    rename_column :refresh_tokens, :token, :token_digest
  end
end
