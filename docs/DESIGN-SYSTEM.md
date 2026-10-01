# Design System — Otter Bank

> 見た目と振る舞いのルール。新しい画面・コンポーネントを作るときはここに従う。
> トークンの実体は `front/src/app/globals.css`（`:root` / `.dark` / `@theme inline`）。この文書と食い違ったら CSS を正とし、文書を直す。

最終更新: 2026-09-26

---

## 1. デザイン原則

1. **叱らず、励ます** — 支出が多くても赤一色で責めない。カワウソが「心配する」表現にとどめ、次の行動（予算の見直し等）を示す
2. **暖かく、やわらかい** — 暖色オレンジとこげ茶の配色、角丸大きめ。銀行アプリの冷たさを避ける（色のルールは §2.1）
3. **数字は一目で** — 金額は大きく・太く・桁区切り。収入/支出は色 **と** 記号（+ / −）やアイコンで区別する（色だけに頼らない）
4. **小さな達成を祝う** — 実績解除・目標達成はモーダルやアニメーションで明確に祝う。ただし日常操作の邪魔はしない
5. **モバイルファースト** — 片手で記録できることを優先。`md:` 以上で情報量を増やす

## 2. カラー

### 2.1 色の原則

1. **暖色で統一する** — ライトもダークも「カワウソの茶色 + オレンジ」の世界観を保つ。寒色（slate / blue / indigo）はブランド色として使わない
2. **色は必ずトークン経由で使う** — `bg-blue-600` や `#92400e` などの直書きは禁止。`bg-primary` `text-income` などのトークンクラスを使う
3. **役割ごとに色を 1 つに決める**
   - 主役ボタン（CTA）= `primary`（オレンジ）
   - 収入 = `income`（緑）／ 支出 = `expense`（テラコッタ）
   - 削除・ログアウトなどの破壊的操作 = `destructive`
4. **ダークモードは「1b エスプレッソ」**（こげ茶ベース）。テーマは next-themes の `class` 戦略で切り替える

### 2.2 カラートークン

値は `H S% L%`（`hsl()` なし）で定義し、使うときに `hsl(var(--x))` で包む。

#### ベース

| トークン | ライト | ダーク（1b） | 用途 |
|---|---|---|---|
| `--background` | `25 100% 96%` | `24 30% 9%` | ページ背景 |
| `--foreground` | `25 50% 30%` | `30 40% 90%` | 本文テキスト |
| `--card` | `30 100% 98%` | `24 26% 13%` | カード背景 |
| `--card-foreground` | `25 50% 25%` | `30 40% 90%` | カード内テキスト |
| `--popover` | `30 100% 98%` | `24 26% 13%` | ドロップダウン・ダイアログ |
| `--popover-foreground` | `25 50% 25%` | `30 40% 90%` | 同上テキスト |

#### アクション

| トークン | ライト | ダーク（1b） | 用途 |
|---|---|---|---|
| `--primary` | `15 80% 55%` | `20 85% 58%` | CTA・リンク・強調 |
| `--primary-foreground` | `25 100% 98%` | `24 40% 10%` | primary 上の文字 |
| `--secondary` | `30 40% 94%` | `24 20% 18%` | 補助ボタン・選択中ナビ |
| `--secondary-foreground` | `25 45% 25%` | `30 40% 90%` | 同上文字 |
| `--accent` | `28 60% 92%` | `24 22% 20%` | ホバー・自分のコメント |
| `--accent-foreground` | `25 45% 25%` | `30 40% 90%` | 同上文字 |
| `--destructive` | `8 72% 55%` | `8 65% 58%` | 削除・ログアウト |
| `--destructive-foreground` | `30 100% 98%` | `30 40% 92%` | 同上文字 |

#### ニュートラル

| トークン | ライト | ダーク（1b） | 用途 |
|---|---|---|---|
| `--muted` | `30 30% 94%` | `24 18% 18%` | 控えめな背景・他人のコメント |
| `--muted-foreground` | `25 18% 46%` | `30 20% 68%` | 補足テキスト・日時 |
| `--border` | `28 40% 88%` | `24 20% 20%` | 枠線 |
| `--input` | `28 40% 88%` | `24 20% 22%` | 入力欄の枠 |
| `--ring` | `15 80% 55%` | `20 85% 58%` | フォーカスリング（= primary） |

#### 家計セマンティック

| トークン | ライト | ダーク（1b） | 用途 |
|---|---|---|---|
| `--income` | `150 55% 40%` | `150 45% 60%` | 収入の金額・アイコン |
| `--income-bg` | `150 45% 94%` | `150 30% 15%` | 収入カード背景 |
| `--income-border` | `150 40% 86%` | `150 25% 24%` | 収入カード枠 |
| `--expense` | `8 68% 52%` | `10 70% 66%` | 支出の金額・アイコン |
| `--expense-bg` | `8 70% 95%` | `10 40% 17%` | 支出カード背景 |
| `--expense-border` | `8 60% 88%` | `10 35% 28%` | 支出カード枠 |

- 収入の金額には必ず `+`、支出には `−` を付ける（色だけで区別しない）
- 支出は `--destructive` と使い分ける。支出はエラーではない

#### カテゴリの色分け

種類を色で見分けるための暖色 6 色。**収入/支出や成功/失敗などの意味は持たせない**。
文字色として使い、背景は `/10`〜`/20` の透過で敷く（例: `bg-category-1/10 text-category-1 border-category-1/30`）。透過背景の上で文字のコントラスト比 4.5:1 以上になる明度にしている。

| トークン | 色 | ライト | ダーク（1b） |
|---|---|---|---|
| `--category-1` | オレンジ | `30 80% 31%` | `32 80% 65%` |
| `--category-2` | マスタード | `45 80% 25%` | `45 70% 60%` |
| `--category-3` | ローズ | `345 55% 42%` | `345 65% 72%` |
| `--category-4` | オリーブ | `75 45% 28%` | `75 40% 62%` |
| `--category-5` | ココア | `20 40% 35%` | `25 40% 70%` |
| `--category-6` | プラム | `320 35% 40%` | `320 40% 74%` |

現在の割り当て:

| 用途 | 割り当て |
|---|---|
| 掲示板カテゴリ（`board-constants.ts`） | 貯金のコツ=1 / 投資=4 / 予算管理=2 / 借金返済=3 / 副収入=5 / 体験談=6 / 質問=`secondary` / その他=`muted` |
| トップの機能カード | 1 / 2 / 4 / 3 |
| トップのロードマップ | 4 → 2 → 1 → 3（段階が進むほど色が変わる） |
| カワウソの吹き出し | §6 を参照 |

色が 6 色で足りない場合は、無理に増やさず `secondary` / `muted` で中立に表す。

#### レイアウト

| トークン | ライト | ダーク（1b） |
|---|---|---|
| `--header-bg` | `var(--primary)` | `24 26% 13%` |
| `--header-fg` | `var(--primary-foreground)` | `30 40% 90%` |
| `--footer-bg` | `25 50% 20%` | `24 30% 7%` |
| `--footer-fg` | `25 100% 96%` | `30 40% 90%` |
| `--radius` | `0.75rem` | 同左 |

ヘッダー・フッターの背景は `globals.css` の `header` / `footer` 要素セレクターが適用する。コンポーネント側で背景クラスを付けない。

### 2.3 使い方（Tailwind クラス）

| やりたいこと | クラス |
|---|---|
| CTA ボタン | `<Button>`（default）。直接書くなら `bg-primary hover:bg-primary/90 text-primary-foreground` |
| 補助ボタン | `variant="outline"` または `variant="secondary"` |
| 削除ボタン | `variant="destructive"`（`bg-destructive text-destructive-foreground`） |
| 収入カード | `bg-income-bg border-income-border text-income` |
| 支出カード | `bg-expense-bg border-expense-border text-expense` |
| 補足テキスト | `text-muted-foreground` |
| カード | `bg-card text-card-foreground border-border` |
| 種類の色分け（バッジ等） | `bg-category-N/10 text-category-N border-category-N/30` |
| ローディング | `text-primary`（`Loader2 animate-spin`） |
| 入力エラー | `text-destructive` / `border-destructive` |
| リンク | `text-primary hover:text-primary/80` |
| 成功メッセージ | `bg-accent text-accent-foreground border-primary/30`（成功専用のトークンは持たない） |
| グラフ（recharts） | `fill` / `stroke` に `"hsl(var(--income))"` のように CSS 変数を渡す（テーマ切替に自動で追従する） |
| フッター内の補足テキスト | `text-current/70`（`--footer-fg` を薄くする） |

### 2.4 禁止

- `bg-blue-*` `bg-slate-*` `bg-indigo-*` `text-blue-*` などの寒色直書き
- `dark:bg-slate-900` のようなダーク用の直書き（トークンが自動で切り替わるので不要）
- `#fef7ed` などの HEX 直書き、`!important` での色上書き
- 収入・支出以外の意味で緑・テラコッタを使うこと
- 該当するトークンがないときは、直書きせずトークンを追加する。追加するときは `:root` と `.dark` の**両方**に定義し、`@theme inline` に `--color-x: hsl(var(--x));` を足す

### 2.5 実績ティア

| ティア | ラベル | 基準色（HEX） | UI での実装 |
|---|---|---|---|
| bronze | ブロンズ | `#C68A4E` | amber 系 |
| silver | シルバー | `#B8BCC2` | slate 系 |
| gold | ゴールド | `#E8C24A` | yellow 系 |
| platinum | プラチナ | `#B39DDB` | purple 系 |

- UI では `front/src/lib/tier.tsx` の `TIER_CONFIG` を唯一の定義とし、ティア色はこのファイルの外に書かない。ここだけは §2.4 の「パレット色の直書き禁止」の例外とする
- 基準色（HEX）はバッジ画像（§5.4）などイラスト制作時に使う

### 2.6 マスコット・イラスト用カラー

UI トークンとは別に管理し、イラスト制作時のみ使う。コードでは使わない。

| 役割 | HEX |
|---|---|
| 輪郭・鼻・目 | `#4A3418` |
| 毛（メイン） | `#C08F50` |
| 毛（影） | `#9E6E30` |
| お腹・顔 | `#F3E3C3` |
| 小物（傘など） | `#E8703A` |
| コイン | `#E8C24A` |

ルール: 背景透過／影を焼き込まない／頬の赤みなし。

## 3. タイポグラフィ

- フォント: `Inter`（`--font-inter`、ラテン文字）。日本語は OS の標準ゴシックにフォールバック
- スケール（Tailwind 標準を使用）

| 用途 | クラス |
|---|---|
| ページタイトル | `text-2xl md:text-3xl font-bold` |
| セクション見出し / カードタイトル | `text-xl font-semibold` |
| 金額（強調） | `text-2xl font-bold tabular-nums` |
| 本文・フォーム | `text-sm`（shadcn 標準） |
| 補足・日時 | `text-xs text-muted-foreground` |

- 金額は `tabular-nums` で桁を揃え、`toLocaleString("ja-JP")` で桁区切り、`¥` を前置する

## 4. 形・余白・重なり

| 項目 | 値 |
|---|---|
| 角丸 | `--radius: 0.75rem`。`rounded-sm/md/lg/xl` = radius −4px / −2px / ±0 / +4px |
| 余白 | 4px グリッド（Tailwind の spacing）。カード内 `p-4 md:p-6`、セクション間 `gap-6` |
| 影 | `shadow-xs`〜`shadow-md` まで。強い影は使わない |
| z-index | `--z-dropdown 100` / `--z-sticky 200` / `--z-fixed 300` / `--z-modal-backdrop 400` / `--z-modal 500` / `--z-popover 600` / `--z-tooltip 700` / `--z-toast 800`。数値の直書き（`z-50` 等）はしない |

## 5. コンポーネント

### 5.1 基本方針

- UI 部品は shadcn/ui（`@/components/ui/`、style: new-york、アイコン: lucide）を使う。追加は `npx shadcn@latest add <name>`
- `components/ui/` のファイルは極力改変しない。見た目の変更はトークンか `variant` 追加で行う
- 条件付きクラスは必ず `cn()` で結合する

### 5.2 ボタン

| variant | 用途 |
|---|---|
| `default` | 画面で一番重要な操作（1 画面に 1 つが目安）: 「記録する」「投稿する」 |
| `secondary` / `outline` | 副次操作: 「キャンセル」「編集」 |
| `ghost` | ツールバー・アイコン操作 |
| `destructive` | 削除。必ず `AlertDialog` で確認を挟む |
| `link` | 文中リンク |

サイズは `sm`(h-8) / `default`(h-9) / `lg`(h-10) / `icon`。モバイルの主要操作はタップ領域 44px 以上を確保する（`lg` + 余白）。

### 5.3 アプリ固有コンポーネント

| コンポーネント | 場所 | 役割 |
|---|---|---|
| `OtterAnimation` | `components/otter-animation.tsx` | 気分に応じたカワウソ表示 |
| `AchievementUnlockModal` | `components/achievement-unlock-modal.tsx` | 実績解除の演出 |
| `ExpensePieChart` / `MonthlyTrend` | `components/` | recharts。ページ側で `next/dynamic({ ssr: false })` |
| `Tutorial` | `components/tutorial.tsx` | 初回ガイド |
| `AchievementImage` / `BadgeEffect` | `app/collection/_components/` | 実績バッジの表示と gold・platinum のエフェクト（§5.4） |

### 5.4 実績バッジ

全 20 種。デザインの一覧は [design/badges/otter_bank_badges_preview.html](design/badges/otter_bank_badges_preview.html)（ブラウザで開くだけで見られる。オフライン可）。

| ファイル | 場所 | 用途 |
|---|---|---|
| バッジ画像（PNG 512×512） | `front/public/achievements/<key>.png` | アプリで表示する。`AchievementService` の `image_url` と同じパス |
| バッジの原本（SVG） | `docs/design/badges/svg/` | 修正・書き出し用の原本。アプリでは読み込まない |
| ティアの空の枠（SVG・PNG） | `docs/design/badges/svg/frame_<tier>.svg` / `png/` | 新しいバッジを作るときの土台 |

- 形はティアで決まる（bronze・silver は丸いメダル、gold は星とリボン付き、platinum はギザギザの縁・宝石・リボン付き）。全バッジ共通のカワウソ要素として外周の下に肉球のシールを置く
- 線と色は §2.5 のティア基準色と §2.6 のイラスト用カラーに合わせる
- 正方形の画像なので `objectFit: "contain"` で表示し、正方形の枠に収めて中央に置く（`cover` だと円の端が切れる）
- 未達成は `opacity-60 grayscale`。画像が無い・読み込めないときはティア色のパネル + `TierIcon` に切り替える
- 新しい実績を足すときは、SVG 原本 → PNG 書き出しを `public/achievements/` に置き、`image_url` を同じパスにする

**エフェクト（`BadgeEffect`）** — PNG には焼き込まず、獲得済みの gold・platinum にだけアプリ側で重ねる。

| ティア | 演出 |
|---|---|
| gold | 光の帯がメダルを横切る（3.2s）+ 星 3 個がまたたく |
| platinum | gold の演出（星は 5 個）+ 背後で後光がゆっくり回る（14s） |

- bronze・silver と未達成には付けない
- `prefers-reduced-motion` では動きを止め、星は出したままにする
- platinum の後光は画像の外に少しはみ出す。親要素に `overflow: hidden` を付けない
- CSS は `badge-effect.module.css`（CSS Modules）。位置の % はバッジ画像に対する値
- エフェクトの色（星・後光・光の帯）はイラストの一部として §2.6 のイラスト用カラーとティア基準色を直接書く。§2.4 の直書き禁止の例外で、トークンにはしない

## 6. カワウソ（マスコット）

| mood | 画像 | 表示する状況 | 吹き出しの背景 |
|---|---|---|---|
| `happy` | `otter_happy.png` | 収支がプラス・予算内 | `bg-category-4/15`（オリーブ） |
| `neutral` | `otter_neutral.png` | 通常 | `bg-muted` |
| `sad` | `otter_sad.png` | 予算超過・支出過多（責めない表情） | `bg-category-6/15`（プラム。警告色にしない） |
| `excited` | `otter_excited.png` | 実績解除・目標達成 | `bg-category-2/20`（マスタード） |
| `sleeping` | `otter_sleeping.png` | 長期間ログインがなかった | `bg-secondary` |

- 画像は `front/public/otter_<mood>.png` に置き、`next/image` で表示する
- セリフは mood ごとの候補からランダムに 1 つ選ぶ（`MOOD_MESSAGES`）。口調はやさしいタメ口・語尾に「〜だよ」「〜しよう」、否定や命令はしない
- 気分の導出は `useMemo` で行う（state + effect にしない）
- 画像には必ず状況がわかる日本語の `alt` を付ける（`MOOD_ALT` で mood ごとに定義）

## 7. モーション

| 用途 | 実装 |
|---|---|
| 汎用の出現/消失 | `tw-animate-css`（`animate-in fade-in` 等） |
| カワウソの反応 | `animate-bounce`（excited）/ `animate-pulse`（happy・sad） |
| 入力エラー | `.animate-shake`（0.5s） |
| ローディング | `Loader2` + `animate-spin` |

- 1 回の演出は 1 秒以内。ループするのはローディングと、獲得済みの gold・platinum バッジのエフェクト（§5.4）のみ
- `prefers-reduced-motion` のユーザーには `motion-safe:` / `motion-reduce:` で演出を抑える

## 8. 状態の表現

| 状態 | 表現 |
|---|---|
| ページ読み込み | `min-h-screen` 中央に `Loader2 h-12 w-12 animate-spin text-primary` |
| 部分読み込み | 該当カード内にスピナー or スケルトン |
| 空状態 | カワウソ画像 + 一言 + 次の行動ボタン（例:「まだ記録がありません」→「最初の取引を記録する」） |
| エラー | `toast.error(タイトル, { description })`。ページ全体は `error.tsx` |
| 成功 | `toast.success(...)`。実績解除は専用モーダル |

## 9. アクセシビリティ

- テキストのコントラスト比 4.5:1 以上（大きい文字 3:1）。トークン追加時に確認する
- フォーカスリングを消さない（`focus-visible:ring-*` は shadcn 標準のまま）
- アイコンのみのボタンには `aria-label`
- フォームは `Label` と入力を関連付け、エラーは入力欄の近くに日本語で表示

## 10. 既知の不整合（要修正）

`main` で確認した、コードが本書どおりになっていない点。

### 対応済み（2026-09-26）

- `@theme inline` の `--color-*` を `hsl(var(--x))` で包んだ（`bg-primary` / `text-income` 等が無効な色になっていた）
- `dark:` を `@custom-variant dark (&:where(.dark, .dark *));` で `.dark` クラス基準にした（OS がダークだと、ライトを選んでいてもダーク用スタイルが当たっていた）
- 未定義の `--chart-*` / `--sidebar-*` の参照を削除した
- `header.tsx` の slate / indigo / orange / red の直書きをトークンと variant に置き換え、背景は `header` セレクター（`--header-bg`）に任せた
- `button.tsx` の destructive を `text-destructive-foreground` にした（`@theme` に `--color-destructive-foreground` を追加）

### 対応済み（2026-09-27）

- 枠線の既定色を `--border` にした（Tailwind 4 の既定は `currentColor` で、カードの枠がライトで濃い茶色になっていた）
- パレット色の直書きをトークンに置き換えた（`tier.tsx` を除き 0 件）。種類の色分け用に `--category-1〜6` を追加した
- `globals.css` の `!important` 付きカスタムクラス（33 箇所）を、使用箇所のトークンクラスに置き換えて削除した。`[data-radix-dialog-*]` 向けのルールは Radix がその属性を付けないため、もともと効いていなかった
- `container` の設定を `@utility container`（中央寄せ + 左右 2rem）に移し、読み込まれていなかった `tailwind.config.ts` と `tailwindcss-animate` を削除した。最大幅は Tailwind 4 の標準値（〜96rem）に従う
- アプリ名を「獺獺銀行」に統一し、画像の `alt` を日本語にした
- フッターを `--footer-bg` / `--footer-fg` に任せた（ダークで紺色になっていた）

### 未対応

1. **支出の円グラフ（`expense-pie-chart.tsx`）の色が HEX 直書き** — 10 カテゴリを見分ける必要があり、暖色だけでは区別しにくい。グラフ用の `--chart-*` トークンを定義し、グラフに限り寒色も許すかを別途決める
2. **トップページの紹介画像（`public/app-top.png`）が旧デザインのスクリーンショット** — 青系の旧 UI が写っているので撮り直す
