# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JsonWebToken do
  # hmac_secret はメモ化されるため、環境変数を差し替える前後で必ず捨てる
  around do |example|
    described_class.reset_hmac_secret!
    example.run
    described_class.reset_hmac_secret!
  end

  describe '.hmac_secret' do
    it 'JWT_SECRET が設定されていればその値を使う' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('JWT_SECRET').and_return('env-provided-secret')

      expect(described_class.hmac_secret).to eq('env-provided-secret')
    end

    it 'JWT_SECRET が空文字の場合は未設定として扱う' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('JWT_SECRET').and_return('')

      expect(described_class.hmac_secret).to eq(described_class::INSECURE_DEVELOPMENT_SECRET)
    end

    it '開発・テスト環境では JWT_SECRET 未設定でも開発用の鍵にフォールバックする' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('JWT_SECRET').and_return(nil)

      expect(described_class.hmac_secret).to eq(described_class::INSECURE_DEVELOPMENT_SECRET)
    end

    # 開発・テスト以外は許可リスト方式で弾く。staging を足しても
    # 開発用の鍵に黙ってフォールバックしないことを担保する
    [nil, ''].each do |blank|
      %w[production staging].each do |env_name|
        it "#{env_name} 環境で JWT_SECRET が #{blank.inspect} なら例外を投げる" do
          allow(ENV).to receive(:[]).and_call_original
          allow(ENV).to receive(:[]).with('JWT_SECRET').and_return(blank)
          allow(Rails).to receive(:env).and_return(
            ActiveSupport::EnvironmentInquirer.new(env_name)
          )

          expect { described_class.hmac_secret }.to raise_error(
            described_class::MissingSecretError, /JWT_SECRET/
          )
        end
      end
    end

    it 'credentials.secret_key_base を参照しない' do
      expect(Rails.application.credentials).not_to receive(:secret_key_base)

      described_class.hmac_secret
    end
  end

  describe '.encode / .decode' do
    it 'payload を往復できる' do
      token = described_class.encode(user_id: 42)

      expect(described_class.decode(token)[:user_id]).to eq(42)
    end

    it 'exp を付与する' do
      token = described_class.encode({ user_id: 1 }, 10.minutes.from_now)

      expect(described_class.decode(token)[:exp]).to be_present
    end

    it '期限切れトークンは ExpiredSignature を投げる' do
      token = described_class.encode({ user_id: 1 }, 1.minute.ago)

      expect { described_class.decode(token) }.to raise_error(JWT::ExpiredSignature)
    end

    it 'nil トークンは DecodeError を投げる' do
      expect { described_class.decode(nil) }.to raise_error(JWT::DecodeError, /nil/)
    end

    it '別の鍵で署名されたトークンは検証に失敗する' do
      foreign_token = JWT.encode({ user_id: 1, exp: 1.hour.from_now.to_i }, 'someone-elses-secret')

      expect { described_class.decode(foreign_token) }.to raise_error(JWT::DecodeError)
    end

    it 'alg=none のトークンは受け付けない' do
      none_token = JWT.encode({ user_id: 1 }, nil, 'none')

      expect { described_class.decode(none_token) }.to raise_error(JWT::DecodeError)
    end
  end
end
