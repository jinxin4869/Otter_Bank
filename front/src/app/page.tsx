import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { ArrowRight, PiggyBank, TrendingUp, BadgeCheck, Sparkles, HelpCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-12">
      {/* ヘッダーセクション - アプリの紹介と主要なアクションボタン */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">獭獭银行 (Otter Bank)</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          お金の管理をするためのアプリ - カワウソがあなたの出費に応じてリアクションを反応してくれます！
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/register">
              新規登録
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">ログイン</Link>
          </Button>
          {/* 使い方ボタン - 枠を追加して視認性を向上 */}
          <Button asChild variant="outline" size="lg" className="gap-2 border-2">
            <Link href="/tutorial">
              <HelpCircle className="h-4 w-4" />
              使い方
            </Link>
          </Button>
        </div>
      </section>

      {/* アプリの特徴セクション - 主な機能と特徴の紹介 */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg -z-10" />
        <div className="grid md:grid-cols-2 gap-8 items-center p-6 rounded-lg">
          <div>
            <h2 className="text-3xl font-bold mb-4">楽しく貯金、賢く管理</h2>
            <p className="text-lg mb-6">
              水獭银行は単なる家計簿アプリではありません。かわいいカワウソと一緒にお金の管理を楽しく続けられるアプリです。
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <PiggyBank className="h-6 w-6 text-primary mt-1" />
                <div>
                  <span className="font-semibold block">ゲーム感覚の金融マネジメント</span>
                  <span className="text-muted-foreground">貯金するほどカワウソが喜ぶ！</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <BadgeCheck className="h-6 w-6 text-primary mt-1" />
                <div>
                  <span className="font-semibold block">アチーブメントシステム</span>
                  <span className="text-muted-foreground">貯金目標を達成して特別なバッジを獲得</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-primary mt-1" />
                <div>
                  <span className="font-semibold block">カスタマイズ要素</span>
                  <span className="text-muted-foreground">貯金額に応じてカワウソの生活環境を変えられる！</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-primary mt-1" />
                <div>
                  <span className="font-semibold block">わかりやすい収支分析</span>
                  <span className="text-muted-foreground">グラフやチャートで支出パターンを可視化</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden ">
            <Image
              src="/画像7.svg"
              alt="Otter Bank App Preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* 使用方法セクション - アプリの基本的な使い方を5ステップで紹介 */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center">使用方法</h2>
        <div className="grid md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <CardTitle>アカウント作成</CardTitle>
              <CardDescription>
                アプリを起動後、アカウントを作成し、利用している銀行を選択して開始します。
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <CardTitle>収支を記録</CardTitle>
              <CardDescription>日々の収入と支出を記録して、カワウソの反応を楽しみましょう。</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <CardTitle>実績を獲得</CardTitle>
              <CardDescription>
                貯金目標を達成すると、特別なバッジや新しいカワウソの環境が解放されます。
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <CardTitle>テーマを設定</CardTitle>
              <CardDescription>お好みのカラーテーマを選択して、アプリの見た目をカスタマイズできます。</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">5</span>
              </div>
              <CardTitle>みんなとシェア</CardTitle>
              <CardDescription>掲示板で貯金のコツや経験を共有し、他のユーザーと交流できます。</CardDescription>
            </CardHeader>
          </Card>
        </div>
        {/* 「詳しい使い方を見る」ボタンを削除 */}
      </section>

      {/* ロードマップセクション - 今後の開発予定を時系列で表示 */}
      <section className="bg-muted/50 p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-6">今後のロードマップ</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded font-medium min-w-[100px] text-center">
              2025年4月
            </div>
            <div className="flex-1 bg-background p-3 rounded">ベータ版リリース</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded font-medium min-w-[100px] text-center">
              2025年6月
            </div>
            <div className="flex-1 bg-background p-3 rounded">UI/UXの改善</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded font-medium min-w-[100px] text-center">
              2025年8月
            </div>
            <div className="flex-1 bg-background p-3 rounded">追加カワウソの実装（最大6種類）</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded font-medium min-w-[100px] text-center">
              2025年10月
            </div>
            <div className="flex-1 bg-background p-3 rounded">本リリース</div>
          </div>
        </div>
      </section>

      {/* お願いセクション - ユーザーへのメッセージとフィードバック依頼 */}
      <section>
        <h2 className="text-3xl font-bold mb-6">皆さんへのお願い</h2>
        <Card>
          <CardContent className="p-6">
            <p className="mb-4">アプリを使っていただきありがとうございます！</p>
            <p className="mb-4">
              バグの報告や機能の提案は、githubのissueを通して行ってください。もしくはフォームから下記メールアドレスまでご連絡ください。
            </p>
            <p>新しいお金ライフを過ごせるように私たちは全力でサポートします。</p>
            <Button asChild className="mt-6">
              <Link href="/register">今すぐ始める</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

