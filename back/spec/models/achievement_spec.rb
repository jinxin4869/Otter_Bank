# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Achievement, type: :model do
  # アソシエーション
  it { should belong_to(:user) }

  # バリデーション
  it { should validate_presence_of(:title) }
  it { should validate_presence_of(:description) }
  it { should validate_presence_of(:category) }
  it { should validate_presence_of(:tier) }
  it { should validate_numericality_of(:progress_target).is_greater_than(0) }

  describe '#update_progress' do
    let(:achievement) { create(:achievement, progress: 0, progress_target: 10) }

    it '進捗を更新する' do
      achievement.update_progress(5)
      expect(achievement.reload.progress).to eq(5)
    end

    it 'progress_targetを超えた値はprogress_targetにクランプされる' do
      achievement.update_progress(100)
      expect(achievement.reload.progress).to eq(10)
    end

    it 'ターゲット達成でunlockedがtrueになる' do
      achievement.update_progress(10)
      expect(achievement.reload.unlocked).to be true
    end

    it 'ターゲット未達ではunlockedはfalseのまま' do
      achievement.update_progress(9)
      expect(achievement.reload.unlocked).to be false
    end

    it 'アンロック時にunlocked_atがセットされる' do
      achievement.update_progress(10)
      expect(achievement.reload.unlocked_at).not_to be_nil
    end
  end

  describe '#progress_percentage' do
    it '進捗率を正しく計算する' do
      achievement = build(:achievement, progress: 5, progress_target: 10)
      expect(achievement.progress_percentage).to eq(50.0)
    end

    it '100%の進捗率を返す' do
      achievement = build(:achievement, progress: 10, progress_target: 10)
      expect(achievement.progress_percentage).to eq(100.0)
    end
  end

  describe '.growth_stage_for' do
    # 境界値（各ステージの下限・上限）を検証する
    {
      0 => 'none', 2 => 'none',
      3 => 'bronze', 7 => 'bronze',
      8 => 'silver', 12 => 'silver',
      13 => 'gold', 17 => 'gold',
      18 => 'platinum', 20 => 'platinum', 21 => 'platinum', 100 => 'platinum'
    }.each do |count, stage|
      it "解除数#{count}件はステージ#{stage}になる" do
        expect(described_class.growth_stage_for(count)[:stage]).to eq(stage)
      end
    end

    it '次のステージと残り件数、ステージ内の進捗率を返す' do
      expect(described_class.growth_stage_for(9)).to eq(
        stage: 'silver', next_stage: 'gold', achievements_to_next: 4, progress_percentage: 20
      )
    end

    it '次のステージ直前の解除数では残り1件を返す' do
      result = described_class.growth_stage_for(2)
      expect(result).to include(stage: 'none', next_stage: 'bronze', achievements_to_next: 1)
    end

    it '最終ステージでは次のステージが nil で進捗率は100になる' do
      expect(described_class.growth_stage_for(18)).to eq(
        stage: 'platinum', next_stage: nil, achievements_to_next: nil, progress_percentage: 100
      )
    end

    it '負数や nil は none として扱う' do
      expect(described_class.growth_stage_for(-5)[:stage]).to eq('none')
      expect(described_class.growth_stage_for(nil)[:stage]).to eq('none')
    end
  end

  describe 'category enum' do
    it { should define_enum_for(:category).with_values(savings: 0, streak: 1, expense: 2, special: 3) }
  end

  describe 'tier enum' do
    it { should define_enum_for(:tier).with_values(bronze: 0, silver: 1, gold: 2, platinum: 3) }
  end
end
