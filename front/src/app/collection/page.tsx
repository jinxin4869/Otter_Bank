"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Wallet, LockIcon, UnlockIcon, Sparkles, Calendar, TrendingDown, ListChecks, AlertTriangle, Trophy } from 'lucide-react'; // ListChecks, AlertTriangle, Trophy を追加または確認

interface Achievement {
  id: number | string;
  title: string;
  description: string;
  category: "savings" | "expense" | "streak" | "special"
  isUnlocked: boolean;
  progress: number; // 0-100
  imageUrl: string;
  reward?: string;
  tier?: number; // 1, 2, 3, etc. for tiered achievements
  prerequisiteId?: number | string | null; // ID of achievement that must be unlocked first
}

// 新しくユーザー行動履歴の型を定義
interface UserAction {
  id: string;
  action_type: 'deposit' | 'withdrawal' | 'budget_set' | 'goal_achieved' | string; // バックエンドの実際の行動タイプに合わせてください
  amount?: number;
  description: string;
  created_at: string; // ISO 8601 形式の日時文字列を想定
}

export default function CollectionPage() {
  const router = useRouter();
  // 実績関連
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [errorAchievements, setErrorAchievements] = useState<string | null>(null);

  // ユーザー行動履歴用のstate
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [loadingUserActions, setLoadingUserActions] = useState(true);
  const [errorUserActions, setErrorUserActions] = useState<string | null>(null);


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

  /*
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
        id: 50,
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
        id: 51,
        title: "一週間の習慣",
        description: "7日連続でアプリを使用しました",
        category: "streak",
        isUnlocked: true,
        progress: 100,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Week+1",
        reward: "カワウソのカレンダー",
        tier: 2,
        prerequisiteId: 50,
      },
      {
        id: 52,
        title: "10日間の継続",
        description: "10日連続でアプリを使用しました",
        category: "streak",
        isUnlocked: false,
        progress: 80,
        imageUrl: "/placeholder.svg?height=120&width=120&text=10+Days",
        reward: "継続バッジ（中級）",
        tier: 3,
        prerequisiteId: 51,
      },
      {
        id: 53,
        title: "半月の努力",
        description: "15日連続でアプリを使用しました",
        category: "streak",
        isUnlocked: false,
        progress: 50,
        imageUrl: "/placeholder.svg?height=120&width=120&text=15+Days",
        reward: "カワウソの特別衣装",
        tier: 4,
        prerequisiteId: 52,
      },
      {
        id: 54,
        title: "継続の達人",
        description: "30日連続でアプリを使用しました",
        category: "streak",
        isUnlocked: false,
        progress: 25,
        imageUrl: "/placeholder.svg?height=120&width=120&text=30+Days",
        reward: "継続バッジ（金）とカワウソの王冠",
        tier: 5,
        prerequisiteId: 53,
      },

      // 節約の達人シリーズ
      {
        id: 100,
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
        id: 101,
        title: "節約の実践者",
        description: "1ヶ月の支出を前月より20%削減しました",
        category: "expense",
        isUnlocked: false,
        progress: 75,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Save+20%",
        reward: "節約バッジ（銀）",
        tier: 2,
        prerequisiteId: 100,
      },
      {
        id: 102,
        title: "節約の達人",
        description: "1ヶ月の支出を前月より30%削減しました",
        category: "expense",
        isUnlocked: false,
        progress: 33,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Save+30%",
        reward: "節約バッジ（金）",
        tier: 3,
        prerequisiteId: 101,
      },

      // 特別な実績
      {
        id: 150,
        title: "予算マスター",
        description: "3ヶ月連続で予算内に収まりました",
        category: "special",
        isUnlocked: false,
        progress: 33,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Budget+Master",
        reward: "予算管理バッジ",
      },
      {
        id: 151,
        title: "投資家デビュー",
        description: "初めての投資を行いました",
        category: "special",
        isUnlocked: false,
        progress: 0,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Investor",
        reward: "投資家バッジ",
      },
      {
        id: 152,
        title: "完璧な記録",
        description: "1ヶ月間毎日支出を記録しました",
        category: "special",
        isUnlocked: false,
        progress: 40,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Perfect+Record",
        reward: "記録キーパーバッジ",
      },
      {
        id: 153,
        title: "目標達成者",
        description: "設定した貯金目標を達成しました",
        category: "special",
        isUnlocked: false,
        progress: 20,
        imageUrl: "/placeholder.svg?height=120&width=120&text=Goal+Achiever",
        reward: "目標達成バッジ",
      },
      {
        id: 154,
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
        id: i + 200,
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
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 space-y-6">
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
*/

  useEffect(() => {
    // 実績データを取得
    const fetchAchievements = async () => {
      setLoadingAchievements(true);
      setErrorAchievements(null);
      try {
        // TODO: 実際のAPIエンドポイントから実績データを取得してください
        // 以下はダミーデータです。実際のAPIレスポンスに合わせてください。
        const dummyAchievements: Achievement[] = [
          { id: 1, title: "初めての貯金", description: "最初の貯金を記録しました。", category: "savings", isUnlocked: true, progress: 100, imageUrl: "/placeholder.svg?height=120&width=120&text=First+Save", reward: "カワウソステッカー", tier: 1, prerequisiteId: null },
          { id: 10, title: "節約家", description: "月の支出を予算内に収めました。", category: "expense", isUnlocked: false, progress: 75, imageUrl: "/placeholder.svg?height=120&width=120&text=Budget+Hero", reward: "節約バッジ", tier: 2, prerequisiteId: 1 },
          { id: 100, title: "貯金習慣マスター", description: "30日連続で貯金を記録しました", category: "streak", isUnlocked: true, progress: 100, imageUrl: "/placeholder.svg?height=120&width=120&text=Streak+Master", reward: "連続記録トロフィー", tier: 3, prerequisiteId: 101, },
          { id: 150, title: "予算マスター", description: "3ヶ月連続で予算内に収まりました", category: "special", isUnlocked: false, progress: 33, imageUrl: "/placeholder.svg?height=120&width=120&text=Budget+Master", reward: "予算管理バッジ", },
          { id: 151, title: "投資家デビュー", description: "初めての投資を行いました", category: "special", isUnlocked: false, progress: 0, imageUrl: "/placeholder.svg?height=120&width=120&text=Investor", reward: "投資家バッジ", },
        ];
        // 実際のAPI呼び出し例:
        // const response = await fetch('/api/v1/achievements'); // Rails側の実績APIエンドポイント
        // if (!response.ok) throw new Error('実績データの取得に失敗しました。');
        // const data = await response.json();
        // setAchievements(data.achievements || []); // APIのレスポンス構造に合わせる
        // setFilteredAchievements(data.achievements || []); // APIのレスポンス構造に合わせる
        await new Promise(resolve => setTimeout(resolve, 1000)); // API呼び出しを模倣
        setAchievements(dummyAchievements); // ダミーデータを使用
        setFilteredAchievements(dummyAchievements); // 初期表示は全件
      } catch (err: any) {
        setErrorAchievements(err.message || '実績データの読み込み中にエラーが発生しました。');
        console.error("Error fetching achievements:", err);
      } finally {
        setLoadingAchievements(false);
      }
    };
    fetchAchievements();
  }, []);

  // ユーザー行動履歴を取得するuseEffect
  useEffect(() => {
    const fetchUserActions = async () => {
      setLoadingUserActions(true);
      setErrorUserActions(null);
      try {
        // TODO: 実際のバックエンドAPIエンドポイントに置き換えてください
        // 例: const response = await fetch('/api/v1/user_actions'); // Rails側の行動履歴APIエンドポイント
        // if (!response.ok) {
        //   const errorData = await response.json().catch(() => ({ message: `ユーザー行動履歴の取得に失敗しました。ステータス: ${response.status}` }));
        //   throw new Error(errorData.message || `ユーザー行動履歴の取得に失敗しました。ステータス: ${response.status}`);
        // }
        // const data: UserAction[] = await response.json();
        // setUserActions(data); // APIのレスポンス構造に合わせる (例: data.actions)

        // 以下はダミーデータです。実際のAPIレスポンスに合わせてください。
        const dummyActions: UserAction[] = [
          { id: 'action1', action_type: 'deposit', amount: 5000, description: '給料からの自動積立', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
          { id: 'action2', action_type: 'withdrawal', amount: 1500, description: 'カフェ代', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 'action3', action_type: 'budget_set', description: '今月の食費予算を設定 (¥30,000)', created_at: new Date().toISOString() },
          { id: 'action4', action_type: 'goal_achieved', description: '目標「新しいPC購入資金」達成！', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
        ];
        await new Promise(resolve => setTimeout(resolve, 1200)); // API呼び出しを模倣
        setUserActions(dummyActions);

      } catch (err: any) {
        setErrorUserActions(err.message || 'ユーザー行動履歴の読み込み中にエラーが発生しました。');
        console.error("Error fetching user actions:", err);
      } finally {
        setLoadingUserActions(false);
      }
    };

    fetchUserActions();
  }, []);

  const filterAchievements = (category: string) => {
    setActiveTab(category);
    if (category === "all") {
      setFilteredAchievements(achievements);
    } else {
      setFilteredAchievements(
        achievements.filter((ach) => ach.category === category)
      );
    }
  };

  const achievementCategories = ["all", "savings", "expense", "streak", "special"];

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">コレクション</h1>

      {/* 実績セクション */}
      <section className="mb-12">
        <div className="flex items-center mb-4">
          <Trophy className="mr-2 h-7 w-7 text-yellow-500" />
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">実績一覧</h2>
        </div>
        <Tabs value={activeTab} onValueChange={filterAchievements} className="mb-6">
          <TabsList>
            {achievementCategories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize px-4 py-2">
                {cat === "all" ? "すべて" :
                  cat === "savings" ? "貯金" :
                    cat === "expense" ? "支出" :
                      cat === "streak" ? "連続記録" :
                        cat === "special" ? "特別" : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loadingAchievements && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="flex flex-col animate-pulse">
                <CardHeader className="p-4">
                  <div className="w-full aspect-[16/9] bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0">
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {errorAchievements && (
          <div className="text-red-600 bg-red-100 dark:bg-red-700/30 dark:text-red-400 p-4 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold">実績データの読み込みエラー</p>
              <p className="text-sm">{errorAchievements}</p>
            </div>
          </div>
        )}

        {!loadingAchievements && !errorAchievements && filteredAchievements.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 py-4">このカテゴリの実績はまだありません。</p>
        )}

        {!loadingAchievements && !errorAchievements && filteredAchievements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAchievements.map((ach) => (
              <Card
                key={ach.id}
                className={cn(
                  "flex flex-col transition-all hover:shadow-lg dark:bg-slate-800",
                  ach.isUnlocked ? "border-green-500 dark:border-green-600" : "border-gray-300 dark:border-slate-700"
                )}
              >
                <CardHeader className="p-4">
                  <div className="relative w-full aspect-[16/9] mb-3">
                    <Image
                      src={ach.imageUrl || "/placeholder.svg?text=No+Image"}
                      alt={ach.title}
                      layout="fill"
                      objectFit="cover"
                      className={cn("rounded-md", !ach.isUnlocked && "opacity-60 grayscale")}
                    />
                    {ach.isUnlocked && (
                      <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1">
                        <UnlockIcon className="h-3 w-3 mr-1" />達成済
                      </Badge>
                    )}
                    {!ach.isUnlocked && (
                      <Badge variant="outline" className="absolute top-2 right-2 bg-white dark:bg-slate-700 text-xs px-2 py-1">
                        <LockIcon className="h-3 w-3 mr-1" />未達成
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-md font-semibold leading-tight">{ach.title}</CardTitle>
                  <CardDescription className="text-xs h-10 overflow-hidden text-ellipsis text-gray-600 dark:text-gray-400">{ach.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0">
                  {ach.tier && <Badge variant="secondary" className="mb-2 text-xs">Tier {ach.tier}</Badge>}
                  <Progress value={ach.progress} className="w-full h-2 my-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ach.progress}% 完了</p>
                </CardContent>
                {ach.reward && (
                  <CardFooter className="p-4 pt-0">
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 font-medium">報酬: {ach.reward}</p>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ユーザー行動履歴セクション */}
      <section>
        <div className="flex items-center mb-4">
          <ListChecks className="mr-2 h-7 w-7 text-blue-500" />
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">あなたの行動履歴</h2>
        </div>

        {loadingUserActions && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border dark:border-slate-700 rounded-lg animate-pulse bg-gray-50 dark:bg-slate-800">
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-1.5"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        )}

        {errorUserActions && (
          <div className="text-red-600 bg-red-100 dark:bg-red-700/30 dark:text-red-400 p-4 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold">行動履歴の読み込みエラー</p>
              <p className="text-sm">{errorUserActions}</p>
            </div>
          </div>
        )}

        {!loadingUserActions && !errorUserActions && userActions.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 py-4">記録された行動履歴はまだありません。</p>
        )}

        {!loadingUserActions && !errorUserActions && userActions.length > 0 && (
          <div className="space-y-3">
            {userActions.map((action) => (
              <Card key={action.id} className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {action.action_type === 'deposit' ? '入金' :
                          action.action_type === 'withdrawal' ? '出金' :
                            action.action_type === 'budget_set' ? '予算設定' :
                              action.action_type === 'goal_achieved' ? '目標達成' :
                                action.action_type} {/* 不明なタイプはそのまま表示 */}
                        {action.amount !== undefined && action.amount !== null && ` (${action.amount.toLocaleString()}円)`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{action.description}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap pt-0.5 sm:pt-0">
                      {new Date(action.created_at).toLocaleString('ja-JP', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
