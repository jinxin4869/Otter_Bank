# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AchievementService do
  let(:user) { create(:user) }
  let(:service) { described_class.new(user) }

  def achievement(id)
    user.achievements.find_by!(original_achievement_id: id)
  end

  def state(id)
    a = achievement(id)
    [a.progress, a.unlocked, a.unlocked_at.present?]
  end

  # 収入の登録（取引コントローラーと同じく update_savings_achievements だけを呼ぶ。マイルストーンの更新も含む）
  def record_income(amount)
    create(:transaction, user: user, transaction_type: :income, amount: amount)
    service.update_savings_achievements(amount)
  end

  describe '貯金実績' do
    it '目標に届いた実績は解除し、届いていない実績は進捗に貯金額を記録する' do
      record_income(3000)

      expect(state('first_savings')).to eq([1, true, true])
      expect(state('savings_milestone_1000')).to eq([1000, true, true])
      expect(state('savings_milestone_5000')).to eq([3000, false, false])
      expect(state('savings_milestone_10000')).to eq([3000, false, false])
      expect(state('savings_milestone_300000')).to eq([3000, false, false])
    end

    it '貯金額が増えると次の実績を解除し、進捗は目標値で止める' do
      record_income(3000)
      record_income(3000)

      expect(state('savings_milestone_5000')).to eq([5000, true, true])
      expect(state('savings_milestone_10000')).to eq([6000, false, false])
    end

    it '解除済みの実績は、あとで貯金額が減っても解除のまま' do
      record_income(3000)
      record_income(3000)
      user.transactions.income.last.destroy
      service.update_milestone_achievements

      expect(state('savings_milestone_5000')).to eq([5000, true, true])
      expect(state('savings_milestone_10000')).to eq([3000, false, false])
    end

    it '貯金額が変わらなければ実績を保存し直さない' do
      record_income(3000)
      milestone = achievement('savings_milestone_5000')
      expect { service.update_milestone_achievements }.not_to(change { milestone.reload.updated_at })
    end

    it '金額が 0 以下のときは初めての貯金を解除しない' do
      service.update_savings_achievements(0)
      expect(state('first_savings')).to eq([0, false, false])
    end
  end

  describe '#update_community_likes_received_achievements' do
    let(:post_record) { create(:post, user: user, likes_count: 5) }

    it '目標に届くまでは進捗にいいね数を記録し、届いたら解除する' do
      post_record
      service.update_community_likes_received_achievements
      expect(state('community_likes_10')).to eq([5, false, false])

      post_record.update_columns(likes_count: 12)
      service.update_community_likes_received_achievements
      expect(state('community_likes_10')).to eq([10, true, true])
      expect(state('community_likes_50')).to eq([12, false, false])
    end
  end

  describe '予算の判定' do
    before do
      create(:transaction, user: user, transaction_type: :expense, amount: 3000, date: Date.current)
      create(:transaction, user: user, transaction_type: :income, amount: 99_999, date: Date.current)
      create(:transaction, user: user, transaction_type: :expense, amount: 9000, date: Date.current.prev_month)
    end

    it '#within_current_month_budget? は今月の支出だけで判定する' do
      expect(service.within_current_month_budget?(3000)).to be true
      expect(service.within_current_month_budget?(2999)).to be false
    end

    it '#calculate_consecutive_budget_months は予算内の月を今月から遡って数える' do
      this_month = [Date.current.year, Date.current.month]
      prev = Date.current.prev_month
      prev_month = [prev.year, prev.month]

      expect(service.calculate_consecutive_budget_months(this_month => 5000, prev_month => 10_000)).to eq(2)
      expect(service.calculate_consecutive_budget_months(this_month => 5000, prev_month => 8000)).to eq(1)
      expect(service.calculate_consecutive_budget_months(this_month => 1000)).to eq(0)
    end
  end
end
