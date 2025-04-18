# 獭獭銀行 (OtterBank) 🦦💰

## サービス概要
- 水獭银行(Otter Bank)は、お金の管理をするためアプリです！
- カワウソがあなたの出費に応じてリアクションを反応してくれます！

## このサービスへの思い・作りたい理由

- 衝動買いをたくさんしてしまうことがある私ですが、Youtubeのショート動画からとある散財癖をなくすＣＭというのを見て、自分の財布管理をはじめようとしたのがきっかけです。
- 毎月給料日になったときに、給料が通帳からなくなることが多々ありましたので、そんな自分の状況を振り返って自分を律するためのアプリです。

- ただの家計簿ですと少し物足りないと感じましたので、最近好きなカワウソ(中国語で水獭)をうまく組合せて一緒に乗り越えることを目指して水濑银行という名前にしました。

## なぜカワウソなの？

研究によると、カワウソはとても賢いうえ、コミュニティ内で情報交換も頻繁に行っているようなのでお金の管理もピッタリなのではと思いました。
単純にかわいいのもあります。

[カワウソは賢い。仲間と協力して問題を解決することもできる](https://karapaia.com/archives/52314005.html)

## ユーザー層について

- 世の中同じことを思ってい仲間が多数だと思いますので、特に大学生や、20代の社会人向けになるかと思います。
- 動物はどの年代にも通用するので、ママさんたちの中でももしかしたら人気が出るとも考えています。

## サービスの利用イメージ

基本の家計簿アプリである機能を踏まえつつ、家計簿にお金を使ってもらうような感じ。
実際には口座内におかねがあればあるほどいいので、出費が減る効果につながると思います。

### ゲーム感覚の金融マネジメント

- 🏆 **アチーブメントシステム**: 貯金目標を達成して特別なバッジを獲得
- 🌈 **カスタマイズ要素**: 貯金額に応じてカワウソの生活環境を変えられる！

## ユーザーの獲得について

RUNTEQコミュニティ内容で使用してもらいつつ、SNSを利用して拡散する。

## サービスの差別化ポイント・推しポイント

差別化ポイント: 
- 家計簿アプリとして、カワウソという遊び心のある設計が既存のものと異なる
- カワウソを育てていく(実際は貯金)うちに、感情がでてもっとつかいたくなる点
- 実績機能やバッジなど続けていく動機づけをする
推しポイント:
- かわいいカワウソを眺められる
- 既存の家計簿としての機能もひと通りそろえている

## 機能候補

MVPリリース時:
- ユーザー新規登録
- ログイン・ログアウト
- 利用規約
- プライバシーポリシー
- 問い合わせフォーム
- カワウソのアニメーション(最低限のもの)
- 実績フォームの画面
- 実績フォームの閲覧

本リリースまで:
- 実績画面(アップデート予定あり)
- 実際の銀行口座と連携して金額をリアルタイムで取得
- マルチプラットフォーム(webアプリではなく、ネイティブアプリとして使用する方がより便利性が上がるため)

## 機能の実装方針予定

| カテゴリー | 使用技術 |
| --- | --- |
| フロントエンド | HTML, JavaScript, Next.js|
| バックエンド | Ruby on Rails |
| サーバーサイド | Ruby on Rails |
| CSSフレームワーク | TailwindCSS, shadcn UI |
| DB | PostgreSQL |
| Redis | Redis (キャッシュやセッション管理) |
| 認証 | Devise (Railsの認証ライブラリ) |
| CI / CD | GitHub Actions |
| 開発環境 | Docker (コンテナ化), VSCode (エディタ) |

## 画面遷移図
[Figmaリンク](https://www.figma.com/board/336gqg7QemlRBOyX6Hyjk9/Untitled?node-id=0-1&p=f&t=pWqT6LtmUdhXr6q1-0)

## ER図

[ER図リンク](path/to/ER.drawio)
