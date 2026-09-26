# Design System — Otter Bank

> 見た目と振る舞いのルール。新しい画面・コンポーネントを作るときはここに従う。
> トークンの実体は `front/src/app/globals.css`（`:root` / `.dark` / `@theme inline`）。この文書と食い違ったら CSS を正とし、文書を直す。

最終更新: 2026-09-26

---

## 1. デザイン原則

1. **叱らず、励ます** — 支出が多くても赤一色で責めない。カワウソが「心配する」表現にとどめ、次の行動（予算の見直し等）を示す
2. **暖かく、やわらかい** — 暖色オレンジとこげ茶の配色、角丸大きめ。銀行アプリの冷たさを避ける
3. **数字は一目で** — 金額は大きく・太く・桁区切り。収入/支出は色 **と** 記号（+ / −）やアイコンで区別する（色だけに頼らない）
4. **小さな達成を祝う** — 実績解除・目標達成はモーダルやアニメーションで明確に祝う。ただし日常操作の邪魔はしない
5. **モバイルファースト** — 片手で記録できることを優先。`md:` 以上で情報量を増やす

## 2. カラートークン

値はすべて **HSL の成分（`H S% L%`）** で定義し、使う側で `hsl(var(--token))` として包む。

### 2.1 ベース

| トークン | ライト | ダーク（エスプレッソ） | 用途 |
|---|---|---|---|
| `--background` | `25 100% 96%` 柔らかいオレンジ | `24 30% 9%` | ページ背景 |
| `--foreground` | `25 50% 30%` こげ茶 | `30 40% 90%` | 本文 |
| `--card` / `--popover` | `30 100% 98%` | `24 26% 13%` | カード・ポップオーバー |
| `--primary` | `15 80% 55%` 暖かいオレンジ | `20 85% 58%` | CTA・リンク・フォーカスリング |
| `--primary-foreground` | `25 100% 98%` | `24 40% 10%` | primary 上の文字 |
| `--secondary` | `30 40% 94%` | `24 20% 18%` | 副ボタン |
| `--muted` / `--muted-foreground` | `30 30% 94%` / `25 18% 46%` | `24 18% 18%` / `30 20% 68%` | 補足テキスト・無効状態 |
| `--accent` | `28 60% 92%` | `24 22% 20%` | ホバー背景 |
| `--destructive` | `8 72% 55%` | `8 65% 58%` | 削除・エラー |
| `--border` / `--input` | `28 40% 88%` | `24 20% 20%` / `24 20% 22%` | 枠線・入力欄 |
| `--ring` | = primary | = primary | フォーカス |

### 2.2 家計セマンティック

| トークン | 用途 | ルール |
|---|---|---|
| `--income` / `-bg` / `-border` | 収入（緑） | 金額には必ず `+` を付ける |
| `--expense` / `-bg` / `-border` | 支出（テラコッタ） | 金額には必ず `−` を付ける。`--destructive` とは使い分ける（支出はエラーではない） |

### 2.3 実績ティア

`front/src/lib/tier.tsx` の `TIER_CONFIG` を唯一の定義とする（ラベル・背景・文字・枠・リング色）。

| ティア | ラベル | 系統色 |
|---|---|---|
| bronze | ブロンズ | amber |
| silver | シルバー | slate |
| gold | ゴールド | yellow |
| platinum | プラチナ | purple |

### 2.4 使い方のルール

- **Tailwind のパレット色（`text-blue-600` `bg-slate-800` `text-red-500` 等）を直接使わない**。意味に合うトークンを使う。該当するトークンがなければ、トークンを追加してから使う
  - 例外: ティア色（`tier.tsx` 内に閉じ込める）
- `!important` 付きのグローバルクラス（`.transaction-history-icon` 等）は新規に増やさない。コンポーネント側の `className` で解決する
- 新しいトークンは `:root` と `.dark` の **両方** に定義し、`@theme inline` に `--color-*` を追加する

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

- **`@theme inline` の `--color-*` が `var(--primary)` をそのまま参照している**。トークンは `15 80% 55%` のような HSL 成分なので、`bg-primary` / `text-primary` / `text-income` 等は Tailwind が `background-color: var(--primary)` を出力し、無効な色になる（Tailwind 4 でのコンパイル結果で確認済み）。`--color-primary: hsl(var(--primary));` のように `hsl()` で包む必要がある
- `@theme inline` が `--chart-*` / `--sidebar-*` を参照しているが、`:root` / `.dark` に定義がない
- `front/tailwind.config.ts` は Tailwind 4 では読み込まれていない（`@config` なし）。トークンの二重管理になるため削除する
- パレット色の直書き（`text-blue-600` 11 箇所、`text-red-500` 9 箇所など）をトークンへ置き換える
- `layout.tsx` の `metadata.title` が簡体字「水獭银行」になっている（UI は日本語「獺獺銀行」）
