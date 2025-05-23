import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { ArrowRight, PiggyBank, TrendingUp, BadgeCheck, Sparkles, HelpCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-12">
      {/* ヘッダーセクション - アプリの紹介と主要なアクションボタン */}

      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
        {/* 柔らかい背景装飾要素 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/10 z-0" />
        <div className="absolute -right-20 top-20 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl" />
        <div className="absolute left-10 bottom-20 w-72 h-72 bg-indigo-100/20 rounded-full blur-3xl" />

        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center z-10">
          <div className="space-y-6">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              お金管理が楽しくなる新アプリ
            </span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-4">
              <span className="block text-primary">Otter Bank</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              カワウソと一緒にお金を貯めよう！支出を記録するたびに、可愛いカワウソがリアクションします。
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8">
                <Link href="/register" className="flex items-center gap-2">
                  無料で始める <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
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

            <div className="pt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
              </div>
            </div>
          </div>

          <div className="relative h-[500px] hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-background to-transparent z-10 rounded-xl opacity-20" />
            <div className="absolute -left-12 bottom-0 w-96 h-80">
              <Image
                src="/画像7.svg"
                alt="Happy Otter with Money"
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute right-0 top-20 w-80 h-80 rotate-6">
              <Image
                src="/画像7.svg"
                alt="App Preview"
                fill
                className="object-contain rounded-2xl shadow-2xl"
              />
            </div>
            <div className="absolute right-20 bottom-10 w-64 h-64 -rotate-3">
              <Image
                src="/画像7.svg"
                alt="Savings Chart"
                fill
                className="object-contain rounded-2xl shadow-xl"
              />
            </div>
          </div>
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



      { /* 特徴セクションの改善 - アニメーションと視覚効果の追加 */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              何が特別なの？
            </span>
            <h2 className="text-4xl font-bold mt-4">お金管理が<span className="text-primary">楽しく</span>なる魔法のアプリ</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              単なる家計簿アプリではありません。カワウソと一緒に貯金の習慣を楽しく身につけましょう。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <PiggyBank className="h-12 w-12" />,
                title: "楽しく貯金",
                description: "貯金するほどカワウソが喜び、環境が豊かになります",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: <BadgeCheck className="h-12 w-12" />,
                title: "実績システム",
                description: "目標を達成して特別なバッジやアイテムを獲得しよう",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <TrendingUp className="h-12 w-12" />,
                title: "わかりやすい分析",
                description: "グラフやチャートで支出パターンを可視化",
                color: "from-orange-500 to-amber-500"
              },
              {
                icon: <Sparkles className="h-12 w-12" />,
                title: "豊富なカスタマイズ",
                description: "カワウソの環境や見た目を自分好みにアレンジ",
                color: "from-pink-500 to-rose-500"
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="relative group bg-background border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
                <div className="p-4 bg-primary/5 rounded-full inline-block mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-background to-muted">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary/10 to-transparent opacity-50" />

            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 relative z-10">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold">実際に使ってみよう！</h2>
                <p className="text-lg text-muted-foreground">
                  3つの簡単なステップで、あなたもカワウソと一緒にお金管理を始められます。
                </p>

                <div className="space-y-6 mt-8">
                  {[
                    {
                      number: "01",
                      title: "無料アカウント作成",
                      description: "メールアドレスだけで簡単登録"
                    },
                    {
                      number: "02",
                      title: "支出を記録",
                      description: "日々の支出を入力してカワウソの反応を楽しむ"
                    },
                    {
                      number: "03",
                      title: "成長を実感",
                      description: "貯金額に応じてカワウソの環境がアップグレード"
                    }
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <span className="font-bold">{step.number}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button asChild className="bg-blue-500 hover:bg-blue-600">
                  <Link href="/register" className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    今すぐ始める
                  </Link>
                </Button>
              </div>

              <div className="relative h-[600px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[300px] h-[600px] rotate-3 transform transition-all duration-500 hover:rotate-0 hover:scale-105">
                    <div className="absolute inset-0 rounded-3xl border-8 border-background shadow-2xl overflow-hidden">
                      <Image
                        src="/app-demo.png"
                        alt="App Demo"
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* この部分にアニメーションするカワウソを配置 */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32">
                      <Image
                        src="/画像5.svg"
                        alt="Happy Otter"
                        fill
                        className="object-contain animate-bounce"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ロードマップセクション - シンプルカードデザイン */}
      <section className="py-16 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 rounded-3xl">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <span className="bg-blue-100/50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              開発計画
            </span>
            <h2 className="text-3xl font-bold mt-4">本リリースへのロードマップ</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              計画している主な開発マイルストーンです。開発状況(本人の仕事の都合)により<br></br>変更の可能性があります。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              {
                emoji: "🌱",
                title: "始まり",
                timeframe: "初期フェーズ",
                features: [
                  "基本的な家計簿機能",
                  "シンプルなカワウソのリアクション",
                  "ベーシックな実績システム",
                  "初期ユーザーテスト"
                ],
                color: "bg-green-50 border-green-100"
              },
              {
                emoji: "🌿",
                title: "成長",
                timeframe: "MVPリリース",
                features: [
                  "UI/UXの大幅改善",
                  "グラフやチャートの拡充",
                  "カスタマイズオプションの追加",
                  "ユーザーフィードバックの反映"
                ],
                color: "bg-teal-50 border-teal-100"
              },
              {
                emoji: "🌳",
                title: "成熟",
                timeframe: "充実フェーズ",
                features: [
                  "複数カワウソキャラクターの実装",
                  "豊富な環境とアイテム",
                  "コミュニティ機能の強化",
                  "季節イベントの導入"
                ],
                color: "bg-blue-50 border-blue-100"
              },
              {
                emoji: "🌟",
                title: "広がり",
                timeframe: "本リリース",
                features: [
                  "完全版リリース",
                  "多言語サポート",
                  "追加コンテンツの定期配信",
                  "ユーザーとの共創の場の提供"
                ],
                color: "bg-indigo-50 border-indigo-100"
              }
            ].map((phase, i) => (
              <div
                key={phase.title}
                className={`relative group rounded-xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 ${phase.color}`}
              >
                <div className="absolute right-4 top-4 opacity-10 text-6xl group-hover:opacity-20 transition-opacity duration-300">
                  {phase.emoji}
                </div>

                <div className="text-3xl mb-4">{phase.emoji}</div>
                <h3 className="text-xl font-bold mb-2">{phase.title}</h3>
                <div className="text-sm text-muted-foreground mb-4 inline-block px-3 py-1 rounded-full bg-blue-100/30">
                  {phase.timeframe}
                </div>

                <ul className="space-y-2 relative z-10">
                  {phase.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 max-w-lg">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
                <span className="font-medium">作者より</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                具体的な日程は明示していませんが、最高品質のアプリを提供するために、十分な時間をかけて開発を進めます。
                ユーザーフィードバックを大切にし、常に改善を続けていきます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* お願いセクション - ユーザーへのメッセージとフィードバック依頼 */}
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-6">皆さんへのお願い</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">Otter Bankをご利用いただきありがとうございます！</h3>
                  <p>
                    より良いサービスを提供するために、皆さんからのフィードバックを大切にしています。
                  </p>
                  <p>
                    バグの報告や機能の提案は、GitHubのissueを通して行っていただくか、
                    問い合わせフォームからご連絡ください。
                  </p>
                  <p className="font-medium">
                    皆さんがより良く自分のお金を管理できるよう、全力でサポートします。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild className="bg-blue-500 hover:bg-blue-600">
                      <Link href="/register" className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        今すぐ始める
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="bg-blue-500 hover:bg-blue-600">
                      <a
                        href={process.env.NEXT_PUBLIC_CONTACT_FORM_URL} // ここに実際のGoogleフォームのURLを入力
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        お問い合わせフォーム
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden h-64 md:h-auto bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/画像7.svg"
                      alt="Happy Otter"
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                    <div className="absolute inset-0 flex items-end justify-end p-6">
                      <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg max-w-xs">
                        <p className="text-sm italic">
                          「皆さんの声を聞かせてください！より良いアプリづくりのために」
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>




    </div>
  )
}

