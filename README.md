# Otter Bank（獺獺銀行）🦦💰

カワウソのマスコットと一緒に家計を管理するゲーミフィケーション家計簿アプリ。
収支記録・貯金目標・実績バッジ・コミュニティ掲示板を搭載。

## サービス概要

衝動買いや散財癖をなくすため、カワウソが支出に応じてリアクションしてくれる家計簿アプリ。
実績システムやバッジで継続するモチベーションを高め、コミュニティ機能で仲間と情報交換できる。

## 主な機能

### 家計管理
- 収入・支出の記録と分析
- カテゴリ別支出の可視化
- 貯金目標の設定と進捗管理

### ゲーミフィケーション
- **アチーブメントシステム**: 行動に応じて実績・バッジを獲得（Bronze / Silver / Gold / Platinum）
- **カワウソアニメーション**: 貯金額・支出に応じてリアクション

### コミュニティ
- 掲示板への投稿・コメント・いいね・ブックマーク

## 技術スタック

### フロントエンド
| 項目 | 技術 |
| --- | --- |
| フレームワーク | Next.js 16（App Router） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS 4 |
| UI コンポーネント | shadcn/ui, Radix UI, Lucide React |
| チャート | Recharts |
| デプロイ | Vercel |

### バックエンド
| 項目 | 技術 |
| --- | --- |
| フレームワーク | Ruby on Rails 8.1（API モード） |
| 言語 | Ruby 3.4.10 |
| DB（開発・テスト） | PostgreSQL 16（Docker Compose の db サービス） |
| DB（本番） | PostgreSQL 16（Neon） |
| 認証 | JWT + bcrypt, Google OAuth2（OmniAuth） |
| デプロイ | Render（DB は Neon） |

### インフラ・CI
| 項目 | 技術 |
| --- | --- |
| コンテナ | Docker / Docker Compose |
| CI/CD | GitHub Actions |

## セットアップ

### 前提条件

- Docker / Docker Compose
- （個別起動の場合）Node.js 22+、Ruby 3.4.10、Bundler

---

### Docker で起動する（推奨）

```bash
# リポジトリをクローン
git clone https://github.com/jinxin4869/Otter_Bank.git
cd Otter_Bank

# 環境変数ファイルを作成（下記「環境変数」を参照）
cp back/.env.example back/.env        # バックエンド用
cp front/.env.example front/.env.local  # フロントエンド用

# コンテナをビルドして起動
docker compose up --build
```

| サービス | URL |
| --- | --- |
| フロントエンド | http://localhost:4000 |
| バックエンド API | http://localhost:3000 |
| PostgreSQL | localhost:5433 |

初回起動後にマイグレーションとシードを実行：

```bash
docker compose exec back bundle exec rails db:migrate
docker compose exec back bundle exec rails db:seed
```

停止・ボリューム削除：

```bash
docker compose down -v
```

---

### 個別に起動する

#### バックエンド

```bash
cd back
bundle install
bundle exec rails db:migrate
bundle exec rails db:seed
bundle exec rails s -b 0.0.0.0   # http://localhost:3000
```

#### フロントエンド

```bash
cd front
npm install
npm run dev   # http://localhost:3000（バックとポートが被る場合は .env.local で調整）
```

---

### 環境変数

テンプレートをコピーして値を埋める。各変数の説明はテンプレート内のコメントを参照。

| ファイル | 作り方 | 主な変数 |
| --- | --- | --- |
| `back/.env` | `cp back/.env.example back/.env` | `JWT_SECRET`（本番必須）, `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`, `FRONTEND_URL_PROD`, `CONTACT_NOTIFY_TO`（任意。お問い合わせの通知先、未設定なら通知しない） |
| `front/.env.local` | `cp front/.env.example front/.env.local` | `NEXT_PUBLIC_DEV_URL`, `NEXT_PUBLIC_API_URL` |

本番（Render）では上記に加えて DB の接続先 `DATABASE_URL`（Neon の直接接続 URL）と、メール送信用の変数（`SMTP_ADDRESS`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAILER_FROM`）が必要。未設定だと起動に失敗する。値は Render のダッシュボードで設定する（`render.yaml` 参照）。

開発環境では `letter_opener` がブラウザでメールを開くため、SMTP の設定は不要。

## プロジェクト構造

```
Otter_Bank/
├── compose.yml              # Docker Compose 設定（front:4000, back:3000, db:5433）
├── render.yaml              # Render デプロイ設定
├── back/                    # Ruby on Rails API
│   ├── app/
│   │   ├── controllers/
│   │   │   └── api/v1/      # API コントローラー（全て Api::V1 モジュール配下）
│   │   ├── models/          # ActiveRecord モデル
│   │   └── services/        # ビジネスロジック（AchievementService 等）
│   ├── config/
│   │   └── routes.rb        # 全 API ルート（/api/v1/ 名前空間）
│   ├── db/                  # マイグレーション・シード
│   └── spec/                # RSpec テスト
│       ├── factories/        # FactoryBot ファクトリー
│       ├── models/           # モデルスペック
│       └── requests/api/v1/ # リクエストスペック
└── front/                   # Next.js フロントエンド
    └── src/
        ├── app/             # App Router ページ
        │   ├── dashboard/   # ダッシュボード
        │   ├── board/       # コミュニティ掲示板
        │   ├── collection/  # 実績コレクション
        │   ├── login/       # ログイン
        │   └── register/    # 新規登録
        ├── components/      # 共通コンポーネント
        │   └── ui/          # shadcn/ui コンポーネント
        ├── hooks/           # カスタムフック（useAuth, useAchievements）
        ├── lib/             # ユーティリティ（cn() 等）
        └── types/           # TypeScript 型定義
```

## よく使うコマンド

### バックエンド

```bash
cd back
bundle exec rspec                    # 全テスト実行
bundle exec rspec --format documentation  # 詳細出力
bin/rubocop -f github               # RuboCop（スタイルチェック）
bin/brakeman --no-pager             # Brakeman（セキュリティスキャン）

# 運営（他人の投稿・コメントを削除できる管理者）を付与する。画面・API からは付与できない
bin/rails runner "User.find_by!(email: 'admin@example.com').update!(admin: true)"
```

### フロントエンド

```bash
cd front
npm run lint          # ESLint チェック
npm run type-check    # TypeScript 型チェック
npm run test          # テスト実行
npm run build         # 本番ビルド
```

## CI/CD

`main` へのプッシュおよび `main` 向けプルリクエスト時に GitHub Actions が実行される。`back/` / `front/` の変更があるジョブだけ動く。

| ジョブ | 内容 |
| --- | --- |
| `check_ruby` | Brakeman セキュリティスキャン + RuboCop |
| `test_backend` | RSpec（PostgreSQL 使用） |
| `build_backend` | 本番用 `back/Dockerfile` のビルドと、production 設定（ダミーの環境変数）での起動確認（`db:prepare` → `GET /up`）。`production.rb` や initializers で必須の環境変数を増やしたら、`render.yaml` と `ci.yml` のこのジョブにも足す（足し忘れるとこのジョブが落ちる） |
| `lint_frontend` | ESLint + TypeScript 型チェック + Jest + `next build` |

フロントエンドは Vercel、バックエンドは Render に自動デプロイ。DB は Neon（構成の理由は [ARCHITECTURE.md §7](docs/ARCHITECTURE.md)）。

## ER 図・画面遷移図

- [画面遷移図（Figma）](https://www.figma.com/board/336gqg7QemlRBOyX6Hyjk9/Untitled?node-id=0-1&p=f&t=pWqT6LtmUdhXr6q1-0)
- [ER 図](docs/)
- [構成マップ（全体像・認証フロー・データモデルのスライド PDF、2026-09-28 時点）](docs/otter-bank-structure-map.pdf)

## 開発者

- **jinxin4869** — [GitHub](https://github.com/jinxin4869)

## サポート

質問・バグ報告は [GitHub Issues](https://github.com/jinxin4869/Otter_Bank/issues) へ。
