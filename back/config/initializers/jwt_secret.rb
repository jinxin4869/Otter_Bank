# frozen_string_literal: true

# 本番・staging で JWT_SECRET が未設定のまま起動するのを防ぐ。
#
# 署名鍵は初回利用時に解決されるため、未設定でもアプリは正常に起動したように見え、
# ログインとトークン検証を伴うリクエストだけが全件 500 になる。
# 認証不要のヘルスチェックしか叩かない構成ではデプロイ直後に気づけないため、
# 起動時点で落として前のバージョンを生かしたままデプロイを失敗させる
Rails.application.config.after_initialize do
  JsonWebToken.hmac_secret unless Rails.env.local?
end
