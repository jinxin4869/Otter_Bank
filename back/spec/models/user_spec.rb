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
  it { should have_many(:refresh_tokens).dependent(:delete_all) }

  it '管理者フラグの既定値は false' do
    expect(described_class.new.admin).to be(false)
  end

  # バリデーション
  it { should validate_presence_of(:username) }
  it { should validate_presence_of(:email) }
  it { should validate_uniqueness_of(:email) }

  describe '#revoke_all_refresh_tokens!' do
    let(:user) { create(:user) }

    it '自分の有効なリフレッシュトークンだけを失効させ、他のユーザーのものには触れない' do
      mine = Array.new(2) { RefreshToken.generate_for(user) }
      others = RefreshToken.generate_for(create(:user))

      expect(user.revoke_all_refresh_tokens!).to eq(2)
      expect(mine.map { |t| t.reload.revoked }).to all(be true)
      expect(others.reload.revoked).to be false
    end
  end

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

    it '日本時間の早朝（UTC ではまだ前日）でも、その日の記録を今日として数える' do
      # 2026-09-01 23:00 UTC = 2026-09-02 08:00 JST。time_zone が UTC だと「今日」が 9/1 になり 1 を返す
      travel_to Time.utc(2026, 9, 1, 23, 0) do
        create(:transaction, user: user, transaction_type: :income, date: Date.new(2026, 9, 2))
        create(:transaction, user: user, transaction_type: :income, date: Date.new(2026, 9, 1))
        expect(user.current_streak).to eq(2)
      end
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

  describe 'メールアドレスの確認' do
    let(:user) { create(:user, :unconfirmed) }

    it '確認前は未確認で、期限は登録から 7 日後' do
      expect(user.email_confirmed?).to be false
      expect(user.email_confirmation_deadline).to be_within(1.second).of(user.created_at + 7.days)
    end

    it '期限までは email_confirmation_expired? が false、過ぎたら true' do
      travel_to(user.created_at + 7.days - 1.minute) { expect(user.email_confirmation_expired?).to be false }
      travel_to(user.created_at + 7.days + 1.minute) { expect(user.email_confirmation_expired?).to be true }
    end

    it '確認済みなら期限を過ぎても止めない' do
      confirmed = create(:user)
      travel_to(confirmed.created_at + 30.days) { expect(confirmed.email_confirmation_expired?).to be false }
      expect(confirmed.email_confirmation_deadline).to be_nil
    end

    it '#confirm_email! で確認済みになり、2 回目では確認時刻を変えない' do
      user.confirm_email!
      confirmed_at = user.reload.email_confirmed_at
      expect(confirmed_at).to be_present

      travel_to(1.day.from_now) { user.confirm_email! }
      expect(user.reload.email_confirmed_at).to eq(confirmed_at)
    end

    it '確認トークンからユーザーを引ける' do
      token = user.generate_token_for(:email_confirmation)
      expect(described_class.find_by_token_for(:email_confirmation, token)).to eq(user)
    end

    it '確認トークンは 24 時間で無効になる' do
      token = user.generate_token_for(:email_confirmation)
      travel_to(25.hours.from_now) do
        expect(described_class.find_by_token_for(:email_confirmation, token)).to be_nil
      end
    end

    it 'メールアドレスが変わると確認トークンは無効になる' do
      token = user.generate_token_for(:email_confirmation)
      user.update!(email: 'changed@example.com')
      expect(described_class.find_by_token_for(:email_confirmation, token)).to be_nil
    end
  end

  describe 'メールアドレスの変更（unconfirmed_email）' do
    let(:user) { create(:user, email: 'before@example.com') }

    it '形式が正しくない新しいアドレスは保存できない' do
      expect(user.update(unconfirmed_email: 'not-an-email')).to be false
    end

    it '他のユーザーが使っているアドレスは申請できない' do
      create(:user, email: 'taken@example.com')
      expect(user.update(unconfirmed_email: 'taken@example.com')).to be false
      expect(user.errors[:unconfirmed_email]).to be_present
    end

    it '変更のトークンは申請中のアドレスに結びつき、申請し直すと前のトークンは無効になる' do
      user.update!(unconfirmed_email: 'after@example.com')
      token = user.generate_token_for(:email_change)
      expect(described_class.find_by_token_for(:email_change, token)).to eq(user)

      user.update!(unconfirmed_email: 'other@example.com')
      expect(described_class.find_by_token_for(:email_change, token)).to be_nil
    end

    describe '#confirm_email_change!' do
      it '新しいアドレスへ切り替えて確認済みにし、申請を消す' do
        user.update_columns(unconfirmed_email: 'after@example.com', email_confirmed_at: nil)

        expect(user.confirm_email_change!).to be true
        user.reload
        expect(user.email).to eq('after@example.com')
        expect(user.unconfirmed_email).to be_nil
        expect(user.email_confirmed?).to be true
      end

      it '申請が無ければ何もせず false を返す' do
        expect(user.confirm_email_change!).to be false
        expect(user.reload.email).to eq('before@example.com')
      end

      it '他のユーザーが使い始めていたら切り替えず false を返す' do
        user.update_columns(unconfirmed_email: 'after@example.com')
        create(:user, email: 'after@example.com')

        expect(user.confirm_email_change!).to be false
        expect(user.reload.email).to eq('before@example.com')
      end
    end
  end

  describe '.unconfirmed_past_retention' do
    it '確認しないまま 30 日を過ぎたユーザーだけを返す' do
      old_unconfirmed = travel_to(31.days.ago) { create(:user, :unconfirmed) }
      travel_to(31.days.ago) { create(:user) } # 確認済み
      create(:user, :unconfirmed) # 30 日以内

      expect(described_class.unconfirmed_past_retention).to contain_exactly(old_unconfirmed)
    end
  end

  describe '.find_or_create_from_oauth' do
    let(:email) { 'owner@example.com' }
    let(:auth) do
      OmniAuth::AuthHash.new(provider: 'google_oauth2', uid: 'google-uid-1', info: { email: email, name: 'Owner' })
    end

    it '新しく作ったユーザーは確認済みにする' do
      user = described_class.find_or_create_from_oauth(auth)
      expect(user.email_confirmed?).to be true
    end

    it 'Google が確認していないアドレス（info.email が空）ではユーザーを返さない' do
      auth.info.email = nil
      expect(described_class.find_or_create_from_oauth(auth)).to be_nil
    end

    context '同じアドレスの未確認アカウントがある（他人が先に登録した可能性がある）とき' do
      let!(:existing) { create(:user, :unconfirmed, email: email, password: 'attacker-pass') }

      it 'パスワードを消し、全端末のログインを無効にして、確認済みにしてからつなぐ' do
        refresh_token = RefreshToken.generate_for(existing)

        user = described_class.find_or_create_from_oauth(auth)

        expect(user).to eq(existing)
        existing.reload
        expect(existing.password_digest).to be_nil
        expect(existing.authenticate('attacker-pass')).to be false
        expect(existing.email_confirmed?).to be true
        expect(refresh_token.reload.revoked).to be true
        expect(existing.oauth_providers.pluck(:uid)).to eq(['google-uid-1'])
      end
    end

    context '同じアドレスの確認済みアカウントがあるとき' do
      let!(:existing) { create(:user, email: email, password: 'owner-pass') }

      it 'パスワードを残したままつなぐ' do
        expect(described_class.find_or_create_from_oauth(auth)).to eq(existing)
        expect(existing.reload.authenticate('owner-pass')).to be_truthy
      end
    end
  end
end
