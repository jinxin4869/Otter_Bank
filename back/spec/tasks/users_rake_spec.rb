# frozen_string_literal: true

require 'rails_helper'
require 'rake'

RSpec.describe 'users:purge_unconfirmed' do
  let(:task) { Rake::Task['users:purge_unconfirmed'] }

  before do
    Rails.application.load_tasks unless Rake::Task.task_defined?('users:purge_unconfirmed')
    task.reenable
  end

  it '確認しないまま 30 日を過ぎたユーザーだけを削除する' do
    expired = travel_to(31.days.ago) { create(:user, :unconfirmed) }
    old_confirmed = travel_to(31.days.ago) { create(:user) }
    recent_unconfirmed = create(:user, :unconfirmed)

    expect { task.invoke }.to output(/1 件削除しました/).to_stdout

    expect(User.exists?(expired.id)).to be false
    expect(User.exists?(old_confirmed.id)).to be true
    expect(User.exists?(recent_unconfirmed.id)).to be true
  end

  it '1 件の削除に失敗しても残りの削除を続ける' do
    failing, other = travel_to(31.days.ago) { create_list(:user, 2, :unconfirmed) }
    failing_service = instance_double(AccountDeletionService)
    allow(failing_service).to receive(:call).and_raise(StandardError, '削除に失敗')
    allow(AccountDeletionService).to receive(:new).and_call_original
    allow(AccountDeletionService).to receive(:new).with(failing).and_return(failing_service)

    expect { task.invoke }.to output(/1 件削除しました（失敗 1 件: user_id=#{failing.id}）/).to_stdout
    expect(User.exists?(failing.id)).to be true
    expect(User.exists?(other.id)).to be false
  end
end
