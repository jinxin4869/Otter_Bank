# セキュリティポリシー

Otter Bank（獺獺銀行）の脆弱性を見つけた場合は、公開の Issue や Pull Request には書かず、次の方法で非公開で報告してください。

*English: Please do not open a public issue. Report vulnerabilities privately via GitHub's "Report a vulnerability" button (Security tab → Advisories).*

## 報告の方法

1. このリポジトリの **Security** タブを開く
2. **Advisories** → **Report a vulnerability** から報告する

報告には、次の内容を書いてください。

- 脆弱性の種類と、影響を受ける画面・API（例: `POST /api/v1/...`）
- 再現の手順
- 想定される影響（読める・書き換えられる情報など）

## 対象

| 対象 | 対応 |
|---|---|
| `main` ブランチと、そこからデプロイされている本番環境 | 対象 |
| それ以外のブランチ・過去のバージョン | 対象外 |

## 対応の流れ

個人で開発しているため、対応の時間は目安です。

- 受け付けの返信: 7 日以内
- 影響の確認と方針の連絡: 14 日以内
- 修正後、報告者の同意を得てから GitHub Security Advisory で公開する

## お願い

- 確認は、自分で作ったアカウントとデータの範囲で行ってください。他の利用者のデータを読む・書き換える・消すことはしないでください
- サービスを止めるような大量のリクエスト（DoS）は送らないでください
- 修正が公開されるまで、内容を第三者に伝えないでください
