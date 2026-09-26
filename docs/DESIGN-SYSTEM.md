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
- 基準色（HEX）はバッジ画像などイラスト制作時に使う

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

## 6. カワウソ（マスコット）

| mood | 画像 | 表示する状況 |
|---|---|---|
| `happy` | `otter_happy.png` | 収支がプラス・予算内 |
| `neutral` | `otter_neutral.png` | 通常 |
| `sad` | `otter_sad.png` | 予算超過・支出過多（責めない表情） |
| `excited` | `otter_excited.png` | 実績解除・目標達成 |
| `sleeping` | `otter_sleeping.png` | 長期間ログインがなかった |

- 画像は `front/public/otter_<mood>.png` に置き、`next/image` で表示する
- セリフは mood ごとの候補からランダムに 1 つ選ぶ（`MOOD_MESSAGES`）。口調はやさしいタメ口・語尾に「〜だよ」「〜しよう」、否定や命令はしない
- 気分の導出は `useMemo` で行う（state + effect にしない）
- 画像には必ず状況がわかる日本語の `alt`（例:「喜んでいるカワウソ」）を付ける（現状は英語の `Otter feeling ${mood}`）

## 7. モーション

| 用途 | 実装 |
|---|---|
| 汎用の出現/消失 | `tw-animate-css`（`animate-in fade-in` 等） |
| カワウソの反応 | `animate-bounce`（excited）/ `animate-pulse`（happy・sad） |
| 入力エラー | `.animate-shake`（0.5s） |
| ローディング | `Loader2` + `animate-spin` |

- 1 回の演出は 1 秒以内。ループするのはローディングのみ
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

### 未対応

1. **枠線の既定色が文字色になっている** — Tailwind 4 の `border` の既定色は `currentColor`。shadcn が前提とする `* { border-color: hsl(var(--border)) }` がないため、`Card` などの枠がライトで濃い茶色になる。`@layer base` に既定の枠線色を追加する
2. **パレット色の直書きがアプリ全体に残っている** — 約 160 箇所・22 ファイル（ティア定義の `tier.tsx` を含む）（`dashboard` `board` `login` `register` `tutorial` `footer` 等）。画面単位でトークンに置き換える
3. **`!important` の色上書き** — `globals.css` に 33 箇所（`.transaction-history-icon` `.warm-bg-icon` など）。トークンで表現できるものから外す
4. **`front/tailwind.config.ts` は読み込まれていない** — Tailwind 4 では `@config` がないため無効。トークンの二重管理になるので、`tailwindcss-animate` と合わせて削除する
5. **`layout.tsx` の `metadata.title` が簡体字「水獭银行」**（UI は日本語「獺獺銀行」）
6. **カワウソ画像の `alt` が英語**（`Otter feeling ${mood}`）

修正の順番: 1 → 2・3 → 4（1 を直すと画面全体の枠線の見え方が変わるため先に行う）
