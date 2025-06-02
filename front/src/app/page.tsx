import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { ArrowRight, PiggyBank, TrendingUp, BadgeCheck, Sparkles, HelpCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-12 bg-background transition-colors duration-500">
      {/* ヘッダーセクション */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-background transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 z-0" />
        <div className="absolute -right-20 top-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute left-10 bottom-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />

        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center z-10">
          <div className="space-y-6">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              お金管理が楽しくなる新アプリ
            </span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-4 text-foreground">
              <span className="block text-primary">Otter Bank</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              カワウソと一緒にお金を貯めよう！支出を記録するたびに、可愛いカワウソがリアクションします。
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8 bg-blue-400 hover:bg-blue-600 text-white">
                <Link href="/register" className="flex items-center gap-2">
                  今すぐ始める <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link href="/login">ログイン</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href="/tutorial" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  使い方
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative h-[500px] hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-transparent z-10 rounded-xl opacity-20" />
            <div className="absolute -left-12 bottom-0 w-96 h-80">
              <Image
                src="/otter_bank.svg"
                alt="Happy Otter with Money"
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute right-0 top-20 w-80 h-80 rotate-6">
              <Image
                src="/otter_umbrella.png"
                alt="App Preview"
                fill
                className="object-contain rounded-2xl shadow-2xl"
              />
            </div>
            <div className="absolute right-20 bottom-10 w-64 h-64 -rotate-3">
              <Image
                src="/otter_mathtest.svg"
                alt="Savings Chart"
                fill
                className="object-contain rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* アプリの特徴セクション - 主な機能と特徴の紹介 */}
      {/*<div className="relative">
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
      </div>*/}


      {/* 特徴セクション */}
      <section className="py-20 bg-muted/30 transition-colors duration-500">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              何が特別なの？
            </span>
            <h2 className="text-4xl font-bold mt-4 text-foreground">お金管理が<span className="text-primary">楽しく</span>なる魔法のアプリ</h2>
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
                color: "from-blue-500/20 to-indigo-500/10",
              },
              {
                icon: <BadgeCheck className="h-12 w-12" />,
                title: "実績システム",
                description: "目標を達成して特別なバッジやアイテムを獲得しよう",
                color: "from-green-500/20 to-emerald-500/10",
              },
              {
                icon: <TrendingUp className="h-12 w-12" />,
                title: "わかりやすい分析",
                description: "グラフやチャートで支出パターンを可視化",
                color: "from-orange-500/20 to-amber-500/10",
              },
              {
                icon: <Sparkles className="h-12 w-12" />,
                title: "豊富なカスタマイズ",
                description: "カワウソの環境や見た目を自分好みにアレンジ",
                color: "from-pink-500/20 to-rose-500/10",
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="relative group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300`} />
                <div className="p-4 bg-primary/5 rounded-full inline-block mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-card-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 紹介セクション */}
      <section className="py-20 bg-accent/30 transition-colors duration-500">
        <div className="container mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-card border border-border">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary/10 to-transparent opacity-50" />

            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 relative z-10">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-card-foreground">実際に使ってみよう！</h2>
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
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        <span className="font-bold text-primary group-hover:text-primary-foreground">{step.number}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button asChild className="bg-blue-400 hover:bg-blue-600 text-white">
                  <Link href="/register" className="flex items-center gap-2">
                    今すぐ始める
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Webアプリ画面表示部分 */}
              <div className="relative h-[600px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full max-w-[550px] h-[400px] transform transition-all duration-500 hover:scale-102">
                    <div className="absolute inset-0 rounded-t-lg shadow-2xl overflow-hidden bg-background border border-border">
                      <div className="h-10 bg-muted border-b border-border flex items-center px-3">
                        <div className="flex space-x-1.5 mr-3">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1 mx-2">
                          <div className="bg-background border border-border rounded-full px-4 py-1 text-xs text-muted-foreground flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-2 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                            <span>otterbank.app/dashboard</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-9 bg-muted flex items-center px-3 text-xs text-muted-foreground border-b border-border">
                        <div className="flex items-center bg-background rounded-t-lg px-3 py-1.5 border-t border-l border-r border-border">
                          <span className="mr-2">OtterBank - ホーム</span>
                          <span className="text-muted-foreground">×</span>
                        </div>
                        <div className="flex items-center px-3 py-1.5 text-muted-foreground">
                          <span className="mr-2">+</span>
                        </div>
                      </div>
                      <div className="relative h-[calc(100%-19px-10px)] flex overflow-hidden">
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <div className="w-2 h-2 rounded-full bg-muted"></div>
                          <div className="w-2 h-2 rounded-full bg-muted"></div>
                        </div>
                        <button className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/80 shadow-md flex items-center justify-center border border-border">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/80 shadow-md flex items-center justify-center border border-border">
                          <svg xmlns="http://www.w3.orghttps://httpd.cloudflare.com/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                        <div className="flex-shrink-0 w-full h-full relative">
                          <Image
                            src="/app-top.png"
                            alt="Otter Bank Dashboard"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-12 right-4 bg-card/90 p-3 rounded-lg shadow-md border border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <PiggyBank className="h-5 w-5 text-primary" />
                              </div>
                              <div className="text-sm">
                                <div className="font-medium text-primary">今月の貯金額</div>
                                <div className="text-primary font-bold">¥12,500</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-20 right-20 w-40 h-40 z-10">
                    <Image
                      src="/otter_logo.svg"
                      alt="Happy Otter"
                      fill
                      className="object-contain animate-bounce"
                    />
                  </div>
                  <div className="absolute bottom-48 right-28 bg-card p-3 rounded-xl shadow-lg z-10 max-w-[200px] transform rotate-3 border border-border">
                    <p className="text-sm text-card-foreground">楽しく貯金できるね！今月も頑張ろう！</p>
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-l border-b border-border transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ロードマップセクション */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl transition-colors duration-500">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              開発計画
            </span>
            <h2 className="text-3xl font-bold mt-4 text-foreground">本リリースへのロードマップ</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              計画している主な開発マイルストーンです。開発状況(本人の仕事の都合)により<br />変更の可能性があります。
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
                color: "bg-green-500/10 border-green-500/20",
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
                color: "bg-teal-500/10 border-teal-500/20",
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
                color: "bg-blue-500/10 border-blue-500/20",
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
                color: "bg-indigo-500/10 border-indigo-500/20",
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
                <h3 className="text-xl font-bold mb-2 text-foreground">{phase.title}</h3>
                <div className="text-sm text-muted-foreground mb-4 inline-block px-3 py-1 rounded-full bg-primary/10">
                  {phase.timeframe}
                </div>
                <ul className="space-y-2 relative z-10">
                  {phase.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
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
            <div className="bg-card p-4 rounded-lg shadow-sm border border-border max-w-lg">
              <div className="flex items-center gap-2 text-sm text-primary">
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

      {/* お願いセクション */}
      <section className="py-12 bg-muted/30 transition-colors duration-500">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-foreground">皆さんへのお願い</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-card-foreground">Otter Bankをご利用いただきありがとうございます！</h3>
                  <p className="text-muted-foreground">
                    より良いサービスを提供するために、皆さんからのフィードバックを大切にしています。
                  </p>
                  <p className="text-muted-foreground">
                    バグの報告や機能の提案は、GitHubのissueを通して行っていただくか、
                    問い合わせフォームからご連絡ください。
                  </p>
                  <p className="font-medium text-card-foreground">
                    皆さんがより良く自分のお金を管理できるよう、全力でサポートします。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild className="bg-blue-400 hover:bg-blue-600 text-white">
                      <Link href="/register" className="flex items-center gap-2">
                        今すぐ始める
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <a
                        href={process.env.NEXT_PUBLIC_CONTACT_FORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-black-500 hover:bg-blue-600"
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
                      src="/otter_glasses.svg"
                      alt="Happy Otter"
                      width={300}
                      height={300}
                      className="object-contain"
                    />
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
