# frozen_string_literal: true

class JsonWebToken
  # 開発・テスト専用の署名鍵。本番では使わせない（resolve_secret で例外を投げる）
  INSECURE_DEVELOPMENT_SECRET = 'otter-bank-development-and-test-only-secret'

  class MissingSecretError < StandardError; end

  # JWT の署名鍵。JWT_SECRET 環境変数のみを参照する。
  # 以前は Rails.application.credentials.secret_key_base にフォールバックしていたが、
  # 復号鍵（config/master.key）がリポジトリに混入し公開されたため参照をやめた。
  # リフレッシュトークンのダイジェスト（RefreshToken.digest）もこの鍵を使う
  # resolve_secret は ENV を読むだけの冪等な処理なので、
  # マルチスレッド下で初回呼び出しが重なっても二重に計算されるだけで実害はない。
  # そのため意図的に mutex を使っていない
  def self.hmac_secret
    @hmac_secret ||= resolve_secret
  end

  # テストで環境変数を差し替えたあとにメモ化を捨てるために使う
  def self.reset_hmac_secret!
    @hmac_secret = nil
  end

  def self.encode(payload, exp = 30.minutes.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, hmac_secret)
  end

  def self.decode(token)
    raise JWT::DecodeError, 'Token is nil' if token.nil?

    decoded = JWT.decode(token, hmac_secret)[0]
    ActiveSupport::HashWithIndifferentAccess.new decoded
  rescue JWT::ExpiredSignature
    raise JWT::ExpiredSignature, 'Token has expired'
  rescue JWT::DecodeError => e
    raise JWT::DecodeError, "Invalid token: #{e.message}"
  end

  def self.resolve_secret
    secret = ENV['JWT_SECRET'].presence
    return secret if secret

    # 開発・テスト以外（本番・staging 等）では未設定を許さない。
    # production? での判定だと将来 staging を足したときに
    # 開発用の鍵へ黙ってフォールバックするため、許可リスト方式にする
    raise MissingSecretError, 'JWT_SECRET が設定されていません' unless Rails.env.local?

    INSECURE_DEVELOPMENT_SECRET
  end
  private_class_method :resolve_secret
end
