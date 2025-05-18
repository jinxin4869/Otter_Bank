"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { LockIcon, UnlockIcon, Sparkles, Calendar, TrendingDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Wallet } from 'lucide-react'

type Achievement = {
  id: number
  title: string
  description: string
  category: "savings" | "expense" | "streak" | "special"
  isUnlocked: boolean
  progress: number // 0-100
  imageUrl: string
  reward?: string
  tier?: number // 1, 2, 3, etc. for tiered achievements
  prerequisiteId?: number // ID of achievement that must be unlocked first
}

export default function CollectionPage() {
  const router = useRouter()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // ログイン状態を確認
  useEffect(() => {
    // ログイン状態をチェック
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (!isLoggedIn) {
      // ログインしていない場合
      router.push("/login")
      return
    }
  }, [router])

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For demo purposes, we'll create sample achievements
    const sampleAchievements: Achievement[] = [
      // 貯金の初期段階
      {
        id: 1,
        title: "初めての一歩",
        description: "初めて貯金をしました",
        category: "savings",
        isUnlocked: true,
        progress: 100,
        imageUrl: "/placeholder.svg?height=120&width=120&text=First+Step",
        reward: "カワウソの基本表情",
        tier: 1,
      },
      {
        id: 2,
        title: "千円貯金",
        description: "累計1,000円を貯金しました",
        category: "savings",
        isUnlocked: true,
        progress: 100,
        imageUrl: "/placeholder.svg?height=120&width=120&text=1000+Yen",
        reward: "カワウソの笑顔",
        tier: 2,
        prerequisiteId: 1,
      },
      {
        id: 3,
        title: "一万円クラブ",
        description: "累計10,000円を貯金しました",
        category: "savings",
        isUnlocked: true,
        progress: 100,
        imageUrl: "/placeholder.svg?height=120&width=120&text=10000+Yen",
        reward: "カワウソの新しい帽子",
        tier: 3,
        prerequisiteId: 2,
      },
      {
        id: 4,
        title: "貯金の達人",
        description: "累計30,000円を貯金しました",
        category: "savings",
        isUnlocked: false,
        progress: 65,
        imageUrl: "/placeholder.svg?height=120&width=120&text=30000+Yen",
        reward: "カワウソの新しい環境",
        tier: 4,
        prerequisiteId: 3,
      },
      {
        id: 5,
        title: "十万円達成",
        description: "累計100,000円を貯金しました",
        category: "savings",
        isUnlocked: false,
        progress: 5,
        imageUrl: "/placeholder.svg?height=120&width=120&text=100K+Yen",
        reward: "カワウソの特別な環境",
        tier: 5,
        prerequisiteId: 4,
      },
      {
        id: 6,
        title: "半分ミリオネア",
        description: "累計500,000円を貯金しました",
        category: "savings",
        isUnlocked: false,
        progress: 2,
        imageUrl: "/placeholder.svg?height=120&width=120&text=500K+Yen",
        reward: "銀のカワウソ像",
        tier: 6,
        prerequisiteId: 5,
      },
      {
        id: 7,
        title: "ミリオネア",
        description: "累計1,000,000円を貯金しました",
        category: "savings",
        isUnlocked: false,
        progress: 1,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Millionaire",
        reward: "金のカワウソ像",
        tier: 7,
        prerequisiteId: 6,
      },

      // 継続は力なりシリーズ
      {
        id: 9,
        title: "初日の決意",
        description: "1日連続でアプリを使用しました",
        category: "streak",
        isUnlocked: true,
        progress: 100,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Day+1",
        reward: "継続バッジ（初級）",
        tier: 1,
      },
      {
        id: 10,
        title: "一週間の習慣",
        description: "7日連続でアプリを使用しました",
        category: "streak",
        isUnlocked: true,
        progress: 100,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Week+1",
        reward: "カワウソのカレンダー",
        tier: 2,
        prerequisiteId: 9,
      },
      {
        id: 11,
        title: "10日間の継続",
        description: "10日連続でアプリを使用しました",
        category: "streak",
        isUnlocked: false,
        progress: 80,
        imageUrl: "/placeholder.svg?height=120&width=120&text=10+Days",
        reward: "継続バッジ（中級）",
        tier: 3,
        prerequisiteId: 10,
      },
      {
        id: 12,
        title: "半月の努力",
        description: "15日連続でアプリを使用しました",
        category: "streak",
        isUnlocked: false,
        progress: 50,
        imageUrl: "/placeholder.svg?height=120&width=120&text=15+Days",
        reward: "カワウソの特別衣装",
        tier: 4,
        prerequisiteId: 11,
      },
      {
        id: 13,
        title: "継続の達人",
        description: "30日連続でアプリを使用しました",
        category: "streak",
        isUnlocked: false,
        progress: 25,
        imageUrl: "/placeholder.svg?height=120&width=120&text=30+Days",
        reward: "継続バッジ（金）とカワウソの王冠",
        tier: 5,
        prerequisiteId: 12,
      },

      // 節約の達人シリーズ
      {
        id: 6,
        title: "節約の始まり",
        description: "1ヶ月の支出を前月より10%削減しました",
        category: "expense",
        isUnlocked: true,
        progress: 100,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Save+10%",
        reward: "節約バッジ（銅）",
        tier: 1,
      },
      {
        id: 7,
        title: "節約の実践者",
        description: "1ヶ月の支出を前月より20%削減しました",
        category: "expense",
        isUnlocked: false,
        progress: 75,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Save+20%",
        reward: "節約バッジ（銀）",
        tier: 2,
        prerequisiteId: 6,
      },
      {
        id: 8,
        title: "節約の達人",
        description: "1ヶ月の支出を前月より30%削減しました",
        category: "expense",
        isUnlocked: false,
        progress: 33,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Save+30%",
        reward: "節約バッジ（金）",
        tier: 3,
        prerequisiteId: 7,
      },

      // 特別な実績
      {
        id: 14,
        title: "予算マスター",
        description: "3ヶ月連続で予算内に収まりました",
        category: "special",
        isUnlocked: false,
        progress: 33,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Budget+Master",
        reward: "予算管理バッジ",
      },
      {
        id: 15,
        title: "投資家デビュー",
        description: "初めての投資を行いました",
        category: "special",
        isUnlocked: false,
        progress: 0,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Investor",
        reward: "投資家バッジ",
      },
      {
        id: 16,
        title: "完璧な記録",
        description: "1ヶ月間毎日支出を記録しました",
        category: "special",
        isUnlocked: false,
        progress: 40,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Perfect+Record",
        reward: "記録キーパーバッジ",
      },
      {
        id: 17,
        title: "目標達成者",
        description: "設定した貯金目標を達成しました",
        category: "special",
        isUnlocked: false,
        progress: 20,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Goal+Achiever",
        reward: "目標達成バッジ",
      },
      {
        id: 18,
        title: "分析の達人",
        description: "すべての分析レポートを確認しました",
        category: "special",
        isUnlocked: false,
        progress: 10,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Analyst",
        reward: "分析バッジ",
      },

      // 隠し実績
      ...Array.from({ length: 7 }, (_, i) => ({
        id: i + 19,
        title: `未知の実績 ${i + 1}`,
        description: "この実績の詳細はまだ明かされていません",
        category: ["savings", "expense", "streak", "special"][Math.floor(Math.random() * 4)] as
          | "savings"
          | "expense"
          | "streak"
          | "special",
        isUnlocked: false,
        progress: 0,
        imageUrl: "/placeholder.svg?height=120&width=120&text=???",
      })),
    ]

    setAchievements(sampleAchievements)
  }, [])

  const filteredAchievements =
    selectedCategory === "all" ? achievements : achievements.filter((a) => a.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "savings":
        return <Wallet className="h-4 w-4" />
      case "expense":
        return <TrendingDown className="h-4 w-4" />
      case "streak":
        return <Calendar className="h-4 w-4" />
      case "special":
        return <Sparkles className="h-4 w-4" />
      default:
        return null
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "savings":
        return "貯金"
      case "expense":
        return "節約"
      case "streak":
        return "継続"
      case "special":
        return "特別"
      default:
        return category
    }
  }

  // カテゴリーの優先順位を設定（貯金、継続、節約、特別）
  const getCategoryPriority = (category: string) => {
    switch (category) {
      case "savings": return 1;
      case "streak": return 2;
      case "expense": return 3;
      case "special": return 4;
      default: return 5;
    }
  }

  // 実績をソート - カテゴリー優先順位でソートし、同じカテゴリー内ではティア順
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    // まずカテゴリーで並べ替え
    const catPriorityA = getCategoryPriority(a.category);
    const catPriorityB = getCategoryPriority(b.category);
    
    if (catPriorityA !== catPriorityB) {
      return catPriorityA - catPriorityB;
    }
    
    // 特別カテゴリーは最後に表示
    if (a.category === "special" && b.category === "special") {
      return a.id - b.id;
    }

    // 同じカテゴリー内ではティア順
    if (a.tier !== undefined && b.tier !== undefined) {
      return a.tier - b.tier;
    }

    // ティアがない場合はID順
    return a.id - b.id;
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">図鑑</h1>
          <p className="text-muted-foreground">実績を達成してカワウソの新しい姿や特別なバッジを解放しよう！</p>
        </div>

        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="savings">貯金</TabsTrigger>
            <TabsTrigger value="streak">継続</TabsTrigger>
            <TabsTrigger value="expense">節約</TabsTrigger>
            <TabsTrigger value="special">特別</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedAchievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={cn(
              "overflow-hidden transition-all duration-300 hover:shadow-md",
              achievement.isUnlocked ? "bg-card" : "bg-muted/50",
              achievement.tier && `border-l-4 ${getTierBorderColor(achievement.tier, achievement.isUnlocked)}`,
            )}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <Badge variant={achievement.isUnlocked ? "default" : "outline"} className="mb-2">
                  {getCategoryIcon(achievement.category)}
                  <span className="ml-1">{getCategoryLabel(achievement.category)}</span>
                  {achievement.tier && <span className="ml-1 text-xs">Lv.{achievement.tier}</span>}
                </Badge>
                {achievement.isUnlocked ? (
                  <UnlockIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <LockIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <CardTitle
                className={cn(
                  "text-base",
                  !achievement.isUnlocked && achievement.progress === 0 && "text-muted-foreground",
                )}
              >
                {achievement.isUnlocked || achievement.progress > 0 ? achievement.title : "???"}
              </CardTitle>
              <CardDescription
                className={cn(!achievement.isUnlocked && achievement.progress === 0 && "text-muted-foreground/70")}
              >
                {achievement.isUnlocked || achievement.progress > 0
                  ? achievement.description
                  : "この実績はまだ解放されていません"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col items-center">
              <div className="relative w-[120px] h-[120px] my-2">
                <Image
                  src={
                    achievement.isUnlocked || achievement.progress > 0
                      ? achievement.imageUrl
                      : "/placeholder.svg?height=120&width=120&text=???"
                  }
                  alt={achievement.title}
                  fill
                  className={cn("object-contain transition-opacity", !achievement.isUnlocked && "opacity-40")}
                />
              </div>

              {achievement.progress > 0 && achievement.progress < 100 && (
                <div className="w-full mt-2">
                  <Progress value={achievement.progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground mt-1">{achievement.progress}% 完了</p>
                </div>
              )}
            </CardContent>
            {achievement.isUnlocked && achievement.reward && (
              <CardFooter className="p-4 pt-0 text-sm">
                <p className="text-green-600 dark:text-green-400 font-medium">報酬: {achievement.reward}</p>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

// Helper function to get border color based on tier
function getTierBorderColor(tier: number, isUnlocked: boolean): string {
  if (!isUnlocked) return "border-gray-300 dark:border-gray-700"

  switch (tier) {
    case 1:
      return "border-blue-400 dark:border-blue-600"
    case 2:
      return "border-green-400 dark:border-green-600"
    case 3:
      return "border-yellow-400 dark:border-yellow-600"
    case 4:
      return "border-purple-400 dark:border-purple-600"
    case 5:
      return "border-red-400 dark:border-red-600"
    default:
      return "border-gray-400 dark:border-gray-600"
  }
}

