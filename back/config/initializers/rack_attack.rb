# frozen_string_literal: true

# Rack::Attack によるレート制限設定
# ブルートフォース攻撃・不正アクセスからAPIを保護する

# rubocop:disable Style/ClassAndModuleChildren
class Rack::Attack
  # rubocop:enable Style/ClassAndModuleChildren
  # キャッシュストア（デフォルトはメモリ、本番ではRedisに変更を推奨）
  # Rack::Attack.cache.store = ActiveSupport::Cache::RedisCacheStore.new(url: ENV['REDIS_URL'])

  # ログイン試行のレート制限（IPごとに1分間5回まで）
  throttle('ログイン/ip', limit: 5, period: 1.minute) do |req|
    req.ip if req.post? && req.path == '/api/v1/sessions'
  end

  # ユーザー登録のレート制限（IPごとに1時間10回まで）
  throttle('ユーザー登録/ip', limit: 10, period: 1.hour) do |req|
    req.ip if req.post? && req.path == '/api/v1/users'
  end

  # パスワードリセット関連のレート制限（IPごとに1時間5回まで）
  throttle('パスワードリセット/ip', limit: 5, period: 1.hour) do |req|
    req.ip if req.post? && req.path.start_with?('/api/v1/passwords')
  end

  # お問い合わせのレート制限（IPごとに1時間3回まで）
  throttle('お問い合わせ/ip', limit: 3, period: 1.hour) do |req|
    req.ip if req.post? && req.path == '/api/v1/contacts'
  end

  # Google OAuthのレート制限（IPごとに1分間10回まで）
  throttle('OAuth/ip', limit: 10, period: 1.minute) do |req|
    req.ip if req.path.start_with?('/api/v1/auth/google')
  end

  # レート制限超過時のレスポンス（429 Too Many Requests）
  self.throttled_responder = lambda do |req|
    match_data = req.env['rack.attack.match_data']
    retry_after = match_data && match_data[:period] ? match_data[:period].to_s : nil

    headers = {
      'Content-Type' => 'application/json'
    }
    headers['Retry-After'] = retry_after if retry_after

    [
      429,
      headers,
      [{ error: 'リクエストが多すぎます。しばらくしてから再試行してください。' }.to_json]
    ]
  end
end
