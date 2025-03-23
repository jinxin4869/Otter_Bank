"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Wallet, Trophy, MessageCircle, Sparkles } from "lucide-react"
import Image from "next/image"

export default function TutorialPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // ログイン状態を確認 - ローカルストレージのみをチェックして厳密に判定
  useEffect(() => {
    // ログイン状態をチェック - セッションストレージは使わず、ローカルストレージのみで判定
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loggedIn)
  }, [])

  // ダッシュボードに戻るボタンのハンドラー
  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ヘッダーセクション - アプリの紹介と戻るボタン */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">獭獭銀行へようこそ！</h1>
        <p className="text-xl text-muted-foreground">
          このアプリでは、楽しく簡単にお金の管理ができます。カワウソと一緒に貯金の習慣を身につけましょう！
        </p>
        {/* ログイン済みの場合のみダッシュボードに戻るボタンを表示 */}
        {isLoggedIn && (
          <Button onClick={handleBackToDashboard} className="mt-4">
            ダッシュボードに戻る
          </Button>
        )}
      </div>

      {/* タブナビゲーション - 各機能の使い方を分類して表示 */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">マイページ</TabsTrigger>
          <TabsTrigger value="collection">図鑑</TabsTrigger>
          <TabsTrigger value="board">掲示板</TabsTrigger>
          <TabsTrigger value="features">機能紹介</TabsTrigger>
        </TabsList>

        {/* マイページの使い方タブ */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                マイページの使い方
              </CardTitle>
              <CardDescription>家計簿の記録と分析を行うメインページです</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">基本機能</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>収入と支出を記録できます</li>
                    <li>カテゴリー別に支出を分類できます</li>
                    <li>日別・月別・年別で表示を切り替えられます</li>
                    <li>収支バランスに応じてカワウソの様子が変わります</li>
                    <li>グラフで支出パターンを可視化できます</li>
                  </ul>
                </div>
                <div className="relative h-60 rounded-lg overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=240&width=320&text=Dashboard+Preview"
                    alt="Dashboard Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">取引の追加方法</h3>
                <ol className="space-y-2 list-decimal pl-5">
                  <li>「新規取引」カードで金額を入力</li>
                  <li>「収入」または「支出」を選択</li>
                  <li>適切なカテゴリーを選択</li>
                  <li>必要に応じて詳細を入力</li>
                  <li>日付を選択（デフォルトは今日）</li>
                  <li>「追加」ボタンをクリック</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 図鑑の使い方タブ */}
        <TabsContent value="collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                図鑑の使い方
              </CardTitle>
              <CardDescription>貯金や継続利用などの目標を達成すると、特別な実績が解放されます</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">実績カテゴリー</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>
                      <span className="font-medium">貯金</span>: 貯金額に応じた実績
                    </li>
                    <li>
                      <span className="font-medium">節約</span>: 支出削減に関する実績
                    </li>
                    <li>
                      <span className="font-medium">継続</span>: アプリの継続利用に関する実績
                    </li>
                    <li>
                      <span className="font-medium">特別</span>: その他の特別な実績
                    </li>
                  </ul>
                </div>
                <div className="relative h-60 rounded-lg overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=240&width=320&text=Collection+Preview"
                    alt="Collection Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">実績の解放方法</h3>
                <p className="mb-2">実績は以下の方法で解放されます：</p>
                <ul className="space-y-2 list-disc pl-5">
                  <li>一定額の貯金を達成する</li>
                  <li>支出を前月より一定割合削減する</li>
                  <li>アプリを連続で使用する</li>
                  <li>特定の条件を満たす（詳細は実績ページで確認）</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 掲示板の使い方タブ */}
        <TabsContent value="board" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                掲示板の使い方
              </CardTitle>
              <CardDescription>お金の管理や貯金のコツ、投資の経験などを共有できるコミュニティ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">基本機能</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>経験や質問を投稿できます</li>
                    <li>カテゴリーでトピックを整理できます</li>
                    <li>他のユーザーの投稿にコメントできます</li>
                    <li>役立つ投稿に「いいね」を付けられます</li>
                    <li>投稿を検索したり、並べ替えたりできます</li>
                  </ul>
                </div>
                <div className="relative h-60 rounded-lg overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=240&width=320&text=Board+Preview"
                    alt="Board Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">投稿のポイント</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>具体的な金額や期間を含めると参考になります</li>
                  <li>適切なカテゴリーを選択しましょう</li>
                  <li>質問は明確に、回答は丁寧に書きましょう</li>
                  <li>成功体験だけでなく、失敗から学んだことも共有しましょう</li>
                  <li>個人情報は投稿しないよう注意してください</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 機能紹介タブ */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                機能紹介
              </CardTitle>
              <CardDescription>獭獭銀行の主な機能と特徴</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">ゲーム感覚の金融マネジメント</h3>
                    <p>
                      貯金するほどカワウソが喜び、様々な実績を解放できます。楽しみながら貯金習慣を身につけましょう。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">わかりやすい収支分析</h3>
                    <p>グラフやチャートで支出パターンを可視化。お金の流れを直感的に把握できます。</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">カスタマイズ要素</h3>
                    <p>貯金額に応じてカワウソの生活環境を変えられます。テーマカラーも自由に選べます。</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">コミュニティ機能</h3>
                    <p>掲示板で他のユーザーと情報交換。貯金のコツや投資の経験を共有できます。</p>
                  </div>
                </div>
              </div>
            </CardContent>
            {/* ログイン状態に応じたフッターボタンの表示 */}
            {isLoggedIn ? (
              <CardFooter>
                <Button onClick={handleBackToDashboard} className="w-full">
                  ダッシュボードに戻る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            ) : (
              <CardFooter>
                <Button onClick={() => router.push("/register")} className="w-full">
                  アプリを始める
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

