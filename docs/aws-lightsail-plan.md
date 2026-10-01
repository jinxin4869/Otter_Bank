# AWS 構成案: API だけ Lightsail に移す（検討中・未実施）

> ステータス: **案**（2026-09-30）。実施する判断はしていない。ARCHITECTURE §7（ADR-002: Render 無料 + Neon）を続ける前提で、「AWS で組んだ経験を見せたい」場合の最小構成をあらかじめ決めておくためのメモ。

## 1. 何を移して、何を残すか

| 対象 | 現状 | この案 | 理由 |
|---|---|---|---|
| API（Rails） | Render 無料（スリープあり） | **Lightsail のインスタンスで Docker 実行** | 移す価値があるのはここだけ。スリープが無くなりコールドスタートも消える |
| DB | Neon（オレゴン） | **Neon のまま** | RDS は最小でも月 15 ドル前後で、この規模で一番高くつく。Neon を捨てる理由がない |
| フロント | Vercel | **Vercel のまま** | プレビュー・CDN・ビルドが無料で揃っている。Amplify に移しても得るものがない |
| メール | SMTP（#414） | そのまま | 環境変数だけ |
| 死活監視 | UptimeRobot | そのまま | 起こす目的ではなく「落ちた」通知に用途が変わる |

コードの変更は不要。`DATABASE_URL` と環境変数で切り替わり、`back/Dockerfile` をそのまま使う。

## 2. リージョン

Neon に東京リージョンは無い（対応: バージニア・オハイオ・オレゴン・フランクフルト・ロンドン・シンガポール・シドニー・サンパウロ）。応答速度に効くのは **Rails と DB の距離** なので、次のどちらか。

| 案 | Lightsail | Neon | 特徴 |
|---|---|---|---|
| **A（推奨）** | オレゴン（us-west-2） | 今のまま（オレゴン） | DB の移行なし。日本からの往復は今の Render と同じ |
| B | シンガポール（ap-southeast-1） | シンガポールに新規プロジェクトを作って `pg_dump` / `pg_restore` | 日本からの往復が約 100ms 縮む。DB の移し替えとダウンタイムが要る |

まず A で始め、遅さが気になったら B。東京の Lightsail + オレゴンの Neon は、クエリごとに太平洋を往復するので選ばない。

## 3. インスタンスと費用

Lightsail の Linux バンドル（2026-09 時点、公開 IPv4 込み）:

| 月額 | RAM | vCPU | SSD | 転送量 |
|---|---|---|---|---|
| 5 ドル | 0.5 GB | 2 | 20 GB | 1 TB |
| **7 ドル** | **1 GB** | 2 | 40 GB | 2 TB |
| 12 ドル | 2 GB | 2 | 60 GB | 3 TB |

- **7 ドル（1 GB）を選ぶ**。Rails + Puma（1 プロセス・5 スレッド）は起動後 250〜400 MB、Docker と Caddy を足して 600 MB 前後。0.5 GB は bootsnap やマイグレーション時に足りなくなる
- 静的 IP は無料（インスタンスに付けている間）
- 自動スナップショット: 0.05 ドル/GB・月。40 GB のうち実使用 5〜10 GB なら月 0.5 ドル程度
- ドメイン: `api.<自分のドメイン>` が必要（Caddy の自動 HTTPS に使う）。年 1,500〜2,000 円

**合計: 月 1,200〜1,500 円（約 8〜9 ドル）**。AWS の無料枠は 2025 年 7 月以降のアカウントでは 6 か月有効のクレジット方式なので、その期間だけ実質無料になる可能性はあるが、恒久的な無料枠として当てにしない。

## 4. サーバー上の構成

```
Lightsail インスタンス（Ubuntu 24.04, us-west-2）
├── Caddy（80/443, Let's Encrypt 自動更新, api.example.com → localhost:3000）
└── Docker
    └── otter-bank-api（back/Dockerfile のイメージ, ポート 3000, --restart unless-stopped）
        env: DATABASE_URL, JWT_SECRET, SECRET_KEY_BASE, SMTP_*, MAILER_FROM,
             FRONTEND_URL, CONTACT_NOTIFY_TO, RAILS_ENV=production
```

- Caddy を使うのは、Lightsail のロードバランサー（月 18 ドル）を使わずに HTTPS を取るため。`Caddyfile` は 3 行で済む
- Rails の `force_ssl` は Caddy が付ける `X-Forwarded-Proto` を見て動く。`config.hosts` に `api.example.com` を入れる
- 環境変数は `/etc/otter-bank/.env`（`chmod 600`、root のみ）に置き、`docker run --env-file` で渡す。Render の `sync: false` に相当
- Lightsail のファイアウォールで開けるのは 22（自分の IP のみ）・80・443
- OS 更新は `unattended-upgrades`。再起動が必要な更新は月 1 回手動

## 5. デプロイの流れ（GitHub Actions）

```
main に push
  → CI（既存: RuboCop / Brakeman / RSpec / #437 の Docker ビルド）
  → docker build → GHCR に push（タグ: コミット SHA）
  → SSH で Lightsail に入り
       docker pull ghcr.io/jinxin4869/otter-bank-api:<sha>
       docker stop/rm 旧コンテナ → docker run 新コンテナ
       （起動時の bin/docker-entrypoint が db:prepare を実行する）
  → curl https://api.example.com/up が 200 になるまで待つ。失敗したら前の SHA で docker run し直す
```

- 数秒のダウンタイムが出る。気になるなら新コンテナを別ポートで起動 → Caddy の向き先を切り替え → 旧を停止、にする
- Render の `buildFilter` と同じく、`back/**` の変更があるときだけ動かす
- Secrets: `LIGHTSAIL_HOST`、`LIGHTSAIL_SSH_KEY`（デプロイ専用ユーザー）、`GHCR_TOKEN`

## 6. 切り替えと戻し方

1. Lightsail を立てて、本番と同じ環境変数で起動。`FRONTEND_URL` は今の Vercel の URL のまま
2. Vercel の **プレビュー環境**の `NEXT_PUBLIC_API_URL` だけ Lightsail に向けて動作確認（ログイン・Google ログイン・取引登録・メール）。Google Cloud Console の承認済みリダイレクト URI に `https://api.example.com/api/v1/auth/google/callback` を追加
3. 問題なければ Vercel の本番の `NEXT_PUBLIC_API_URL` を切り替える。DB は共有なのでデータ移行はない
4. Render のサービスは **1〜2 週間残す**。戻すときは Vercel の環境変数を戻すだけ
5. 落ち着いたら Render のサービスと `render.yaml` を消す（`render.yaml` は履歴に残るので復元できる）

## 7. Render と比べて増える運用

| 項目 | Render | Lightsail |
|---|---|---|
| OS・Docker の更新 | 不要 | 自分でやる（月 1 回） |
| HTTPS 証明書 | 自動 | Caddy が自動。Caddy 自体の更新は自分 |
| デプロイ失敗時 | 前のバージョンが残る | 手順 5 のとおり自分で戻す |
| ログ | ダッシュボード | `docker logs`。残したいなら CloudWatch エージェント（無料枠内）か `journald` |
| バックアップ | なし（DB は Neon） | スナップショット（設定は 1 回） |
| 障害時 | Render のステータス待ち | 自分で SSH |

「AWS で組んだ」と言えるのはこの運用まで含めてで、ここが経験として得るものになる。

## 8. やらないこと

- RDS、ALB、ECS/Fargate、Amplify: この規模では費用が 5〜10 倍になり、得られる違いは「マネージド」だけ
- Lightsail の Containers サービス（月 7 ドル〜）: インスタンスより高く、ログや SSH の自由度が下がる
- Kubernetes、Terraform: 1 台構成に対して重い。IaC を試したいなら Lightsail は CloudFormation 非対応なので、代わりに `aws lightsail` CLI のスクリプトを `scripts/` に残す程度にする

## 9. 判断の条件

- **やる**: 就職活動や実務で「AWS 上で本番運用した経験」を説明したい。月 1,500 円と月 1 回の更新作業を受け入れられる
- **やらない**: 使うのが自分だけ、または Render のコールドスタートが UptimeRobot で気にならない。その場合は ADR-002 のまま
