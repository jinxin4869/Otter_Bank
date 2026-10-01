# frozen_string_literal: true

namespace :users do
  desc 'メールアドレスを確認しないまま 30 日を過ぎたユーザーを削除する（手動で実行する）'
  task purge_unconfirmed: :environment do
    deleted = 0
    failed_ids = []
    User.unconfirmed_past_retention.find_each do |user|
      AccountDeletionService.new(user).call
      deleted += 1
    rescue StandardError => e
      # 1 件の失敗で残りを止めない。失敗したユーザーは ID だけ残し、あとで調べる
      failed_ids << user.id
      Rails.logger.error "未確認ユーザーの削除に失敗 user_id=#{user.id}: #{e.class}"
    end
    message = "未確認ユーザーを #{deleted} 件削除しました"
    message += "（失敗 #{failed_ids.size} 件: user_id=#{failed_ids.join(', ')}）" if failed_ids.any?
    Rails.logger.info message
    puts message
  end
end
