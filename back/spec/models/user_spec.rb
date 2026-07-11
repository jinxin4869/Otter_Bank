# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  # アソシエーション
  it { should have_many(:transactions).dependent(:destroy) }
  it { should have_many(:achievements).dependent(:destroy) }
  it { should have_many(:savings_goals).dependent(:destroy) }
  it { should have_many(:posts).dependent(:destroy) }
  it { should have_many(:comments).dependent(:destroy) }
  it { should have_many(:likes).dependent(:destroy) }
  it { should have_many(:bookmarks).dependent(:destroy) }
  it { should have_many(:oauth_providers).dependent(:destroy) }
  it { should have_many(:user_actions).dependent(:destroy) }

  # バリデーション
  it { should validate_presence_of(:username) }
  it { should validate_presence_of(:email) }
  it { should validate_uniqueness_of(:email) }

  describe 'ユーザー名のバリデーション' do
    it '3文字未満のユーザー名は無効' do
      user = build(:user, username: 'ab')
      expect(user).not_to be_valid
    end

    it '20文字超のユーザー名は無効' do
      user = build(:user, username: 'a' * 21)
      expect(user).not_to be_valid
    end

    it '3〜20文字のユーザー名は有効' do
      user = build(:user, username: 'validuser')
      expect(user).to be_valid
    end
  end

  describe 'パスワードのバリデーション' do
    it '8文字以上のパスワードは有効' do
      user = build(:user, password: 'password123')
      expect(user).to be_valid
    end

    it '8文字未満のパスワードは無効' do
      user = build(:user, password: 'short')
      expect(user).not_to be_valid
    end
  end

  describe 'メールアドレスのバリデーション' do
    it '不正なメールアドレス形式は無効' do
      user = build(:user, email: 'notanemail')
      expect(user).not_to be_valid
    end

    it '正しいメールアドレス形式は有効' do
      user = build(:user, email: 'valid@example.com')
      expect(user).to be_valid
    end
  end

  describe 'after_create コールバック' do
    it 'ユーザー作成時に初期実績が生成される' do
      user = create(:user)
      expect(user.achievements.count).to be > 0
    end
  end

  describe '#total_savings' do
    let(:user) { create(:user) }

    it '収入取引の合計を返す' do
      create(:transaction, user: user, amount: 3000, transaction_type: :income, description: '給料', category: '給与',
                           date: Date.current)
      create(:transaction, user: user, amount: 2000, transaction_type: :income, description: 'ボーナス', category: '給与',
                           date: Date.current)
      create(:transaction, user: user, amount: 500, transaction_type: :expense, description: '食費', category: '食費',
                           date: Date.current)
      expect(user.total_savings).to eq(5000)
    end

    it '取引がない場合は0を返す' do
      expect(user.total_savings).to eq(0)
    end
  end

  describe '#current_streak' do
    let(:user) { create(:user) }

    it '取引が0件のとき0を返す' do
      expect(user.current_streak).to eq(0)
    end

    it '今日だけ収入取引があるとき1を返す' do
      create(:transaction, user: user, transaction_type: :income, date: Date.current)
      expect(user.current_streak).to eq(1)
    end

    it '今日と昨日に収入取引があるとき2を返す' do
      create(:transaction, user: user, transaction_type: :income, date: Date.current)
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 1.day)
      expect(user.current_streak).to eq(2)
    end

    it '今日の記録がなく昨日まで連続している場合は昨日から遡った日数を返す' do
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 1.day)
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 2.days)
      expect(user.current_streak).to eq(2)
    end

    it '今日も昨日も記録がなければ0を返す' do
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 3.days)
      expect(user.current_streak).to eq(0)
    end

    it 'created_at ではなく date カラムを参照する' do
      # date は2日前だが created_at は今日の取引を作成
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 2.days)
      expect(user.current_streak).to eq(0)
    end

    it '二重カウントしない（今日の取引1件のとき1を返す）' do
      create(:transaction, user: user, transaction_type: :income, date: Date.current)
      expect(user.current_streak).to eq(1)
    end

    it '収入取引のみカウントし、支出取引は無視する' do
      create(:transaction, user: user, transaction_type: :expense, date: Date.current)
      expect(user.current_streak).to eq(0)
    end
  end

  describe '#longest_streak' do
    let(:user) { create(:user) }

    it '取引が0件のとき0を返す' do
      expect(user.longest_streak).to eq(0)
    end

    it '連続していない複数の期間があるとき最長を返す' do
      # 3日連続 + 1日空白 + 2日連続
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 6.days)
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 5.days)
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 4.days)
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 2.days)
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 1.day)
      expect(user.longest_streak).to eq(3)
    end

    it 'date カラムを参照する' do
      create(:transaction, user: user, transaction_type: :income, date: Date.current - 1.day)
      create(:transaction, user: user, transaction_type: :income, date: Date.current)
      expect(user.longest_streak).to eq(2)
    end
  end

  describe '#oauth_only?' do
    it 'OAuthプロバイダーのみで登録したユーザーはtrueを返す' do
      user = create(:user)
      user.update_columns(password_digest: nil)
      create(:oauth_provider, user: user)
      expect(user.oauth_only?).to be true
    end

    it '通常のパスワードユーザーはfalseを返す' do
      user = create(:user)
      expect(user.oauth_only?).to be false
    end
  end

  describe '#track_sign_in!' do
    it '初回サインインでは last と current の両方に現在時刻が入る' do
      user = create(:user)
      expect(user.current_sign_in_at).to be_nil

      user.track_sign_in!
      expect(user.current_sign_in_at).to be_within(1.second).of(Time.current)
      expect(user.last_sign_in_at).to be_within(1.second).of(Time.current)
    end

    it '2回目のサインインでは last_sign_in_at に前回の時刻が保持される' do
      user = create(:user)
      first_time = 10.days.ago
      user.update_columns(current_sign_in_at: first_time, last_sign_in_at: first_time)

      user.track_sign_in!
      expect(user.last_sign_in_at).to be_within(1.second).of(first_time)
      expect(user.current_sign_in_at).to be_within(1.second).of(Time.current)
    end
  end
end
