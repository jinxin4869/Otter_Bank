# frozen_string_literal: true

namespace :refresh_tokens do
  desc 'すべてのリフレッシュトークンを失効させる（JWT署名鍵のローテーション後に実行する）'
  task revoke_all: :environment do
    count = RefreshToken.revoke_all!
    Rails.logger.info "リフレッシュトークンを #{count} 件失効させました"
    puts "リフレッシュトークンを #{count} 件失効させました"
  end
end
