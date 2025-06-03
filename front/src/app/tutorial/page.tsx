"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, ArrowLeft, Wallet, Trophy, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react'
import Image from "next/image"

const tutorialSteps = [
  {
    id: "dashboard",
    icon: <Wallet className="h-6 w-6 text-primary" />,
    title: "マイページの使い方",
    description: "家計簿の記録と分析を行うメインページです。",
    imageSrc: "/placeholder.svg?height=240&width=420&text=Dashboard+Preview",
    altText: "マイページプレビュー",
    features: [
      "収入と支出を記録できます。",
      "カテゴリー別に支出を分類できます。",
      "日別・月別・年別で表示を切り替えられます。",
      "収支バランスに応じてカワウソの様子が変わります。",
      "グラフで支出パターンを可視化できます。",
    ],
    howTo: {
      title: "取引の追加方法",
      steps: [
        "「新規取引」カードで金額を入力します。",
        "「収入」または「支出」を選択します。",
        "適切なカテゴリーを選択します。",
        "必要に応じて詳細を入力します。",
        "日付を選択（デフォルトは今日）。",
        "「追加」ボタンをクリックします。",
      ],
    }
  },
  {
    id: "collection",
    icon: <Trophy className="h-6 w-6 text-primary" />,
    title: "図鑑の使い方",
    description: "貯金や継続利用などの目標を達成すると、特別な実績が解放されます。",
    imageSrc: "/placeholder.svg?height=240&width=420&text=Collection+Preview",
    altText: "図鑑プレビュー",
    features: [
      "実績カテゴリー: 貯金、節約、継続、特別。",
      "貯金額に応じた実績や、支出削減に関する実績などがあります。",
    ],
    howTo: {
      title: "実績の解放方法",
      steps: [
        "一定額の貯金を達成する。",
        "支出を前月より一定割合削減する。",
        "アプリを連続で使用する。",
        "特定の条件を満たす（詳細は実績ページで確認）。",
      ],
    }
  },
  {
    id: "board",
    icon: <MessageCircle className="h-6 w-6 text-primary" />,
    title: "掲示板の使い方",
    description: "お金の管理や貯金のコツ、投資の経験などを共有できるコミュニティです。",
    imageSrc: "/placeholder.svg?height=240&width=420&text=Board+Preview",
    altText: "掲示板プレビュー",
    features: [
      "経験や質問を投稿できます。",
      "カテゴリーでトピックを整理できます。",
      "他のユーザーの投稿にコメントできます。",
      "役立つ投稿に「いいね」を付けられます。",
      "投稿を検索したり、並べ替えたりできます。",
    ],
    howTo: {
      title: "投稿のポイント",
      steps: [
        "具体的な金額や期間を含めると参考になります。",
        "適切なカテゴリーを選択しましょう。",
        "質問は明確に、回答は丁寧に書きましょう。",
        "成功体験だけでなく、失敗から学んだことも共有しましょう。",
        "個人情報は投稿しないよう注意してください。",
      ],
    }
  },
  {
    id: "features",
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    title: "獭獭銀行の主な特徴",
    description: "楽しく続けられる、新しいお金管理体験を提供します。",
    imageSrc: "/placeholder.svg?height=240&width=420&text=App+Features+Overview",
    altText: "アプリ特徴概要",
    features: [
      "ゲーム感覚の金融マネジメント: 貯金するほどカワウソが喜び、様々な実績を解放できます。",
      "わかりやすい収支分析: グラフやチャートで支出パターンを可視化し、お金の流れを直感的に把握できます。",
      "カスタマイズ要素: 貯金額に応じてカワウソの生活環境を変えたり、テーマカラーも自由に選べます。",
      "コミュニティ機能: 掲示板で他のユーザーと情報交換。貯金のコツや投資の経験を共有できます。",
    ],
  }
];

export default function TutorialPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 最後のステップなら登録ページへ
      router.push("/register");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepData = tutorialSteps[currentStep];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-3xl">
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex items-center space-x-3 mb-2">
            {stepData.icon}
            <CardTitle className="text-2xl font-bold">{stepData.title}</CardTitle>
          </div>
          <CardDescription className="text-md">{stepData.description}</CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {stepData.id === "features" ? (
            <div className="space-y-4">
              {stepData.features?.map((featureText, index) => {
                const parts = featureText.split(': ');
                const featureTitle = parts[0];
                const featureDescription = parts.length > 1 ? parts.slice(1).join(': ') : '';
                return (
                  <div key={index} className="p-4 border rounded-lg bg-background shadow-sm">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-md text-primary">{featureTitle}</h4>
                        {featureDescription && <p className="text-sm text-muted-foreground mt-1">{featureDescription}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            stepData.imageSrc && (
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border">
                <Image
                  src={stepData.imageSrc}
                  alt={stepData.altText || 'チュートリアル画像'}
                  fill
                  className="object-cover"
                  priority={currentStep === 0}
                />
              </div>
            )
          )}

          {stepData.id !== "features" && stepData.features && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">主なポイント</h3>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                {stepData.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {stepData.howTo && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">{stepData.howTo.title}</h3>
              <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
                {stepData.howTo.steps.map((s, index) => (
                  <li key={index}>{s}</li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/30 p-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${currentStep === index ? "bg-primary scale-125" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                aria-label={`ステップ ${index + 1} へ移動`}
              />
            ))}
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                前へ
              </Button>
            )}
            <Button onClick={handleNext} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {currentStep < tutorialSteps.length - 1 ? (
                <>
                  次へ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  アプリを始める
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {!isLoggedIn && currentStep === tutorialSteps.length - 1 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            すでにアカウントをお持ちですか？ <a href="/login" className="text-primary hover:underline font-medium">ログイン</a>
          </p>
        </div>
      )}
    </div>
  );
}