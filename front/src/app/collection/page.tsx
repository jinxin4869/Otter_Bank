"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect} from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { LockIcon, UnlockIcon, AlertTriangle, Trophy } from 'lucide-react';

// 実績の型定義 (Rails APIのレスポンスに合わせて調整)
interface Achievement {
  id: number | string;
  original_achievement_id: string; // Rails APIから
  title: string;
  description: string;
  category: string; // 文字列として受け取る
  tier: string; // 文字列として受け取る
  unlocked: boolean; // Rails APIでは `unlocked`
  progress: number;
  progress_percentage: number; // Rails APIから
  progress_target: number; // Rails APIから
  image_url?: string; // Rails APIでは `image_url`
  reward: string;
  created_at: string; // Rails APIから
  updated_at: string; // Rails APIから
  unlocked_at?: string | null; // Rails APIから
}

// カテゴリ表示用の日本語マッピング
const categoryLabels: Record<string, string> = {
  all: 'すべて',
  savings: '貯金',
  streak: '連続記録',
  expense: '支出管理',
  special: '特別'
};

// ティア表示用の日本語マッピング
const tierLabels: Record<string, string> = {
  bronze: 'ブロンズ',
  silver: 'シルバー',
  gold: 'ゴールド',
  platinum: 'プラチナ'
};

// APIレスポンス全体の型 (必要であれば)
interface AchievementsApiResponse {
  achievements: Achievement[];
  summary: {
    total_achievements: number;
    unlocked_achievements: number;
    progress_by_category: Record<string, { total: number; unlocked: number; progress_percentage: number }>;
  };
}

export default function CollectionPage() {
  const router = useRouter();
  // 実績関連
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [errorAchievements, setErrorAchievements] = useState<string | null>(null);
  const [achievementSummary, setAchievementSummary] = useState<AchievementsApiResponse['summary'] | null>(null);


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
*/

  useEffect(() => {
    // 実績データを取得
    const fetchAchievements = async () => {
      setLoadingAchievements(true);
      setErrorAchievements(null);
      try {
        // JWTトークンを取得
        const token = localStorage.getItem("token");
        
        const getApiUrl = () => {
          if (process.env.NODE_ENV === 'development') {
            return process.env.NEXT_PUBLIC_DEV_URL;
          }
          return process.env.NEXT_PUBLIC_API_URL;
        };
        
        // Rails APIから取得
        const response = await fetch(`${getApiUrl()}/api/v1/achievements`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          credentials: 'include', // CSRFトークンを含めるために必要
        }); // Rails側の実績APIエンドポイント

        console.log("Fetching achievements from API...", response.status);

        if (!response.ok) {
          throw new Error(`実績データの取得に失敗しました。ステータス: ${response.status}`);
        }

        const data = await response.json();
        console.log("Achievements data received:", data);

        //APIのデータ構造に合わせて実績データを設定
        setAchievements(data.achievements || []);
        setFilteredAchievements(data.achievements || []);
        setAchievementSummary(data.summary || null);

      } catch (err: any) {
        setErrorAchievements(err.message);
        console.error("Error fetching achievements:", err);
      } finally {
        setLoadingAchievements(false);
      }
    };
    fetchAchievements();
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

  // 表示するカテゴリを動的に生成 (APIから取得したカテゴリを使用することも検討可能)
  const achievementCategories = ["all", ...new Set(achievements.map(ach => ach.category))];

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-8 text-foreground">コレクション</h1>

      {/* 実績サマリー表示 (任意) */}
      {achievementSummary && !loadingAchievements && !errorAchievements && (
        <section className="mb-8 p-4 bg-card text-card-foreground rounded-lg border">
          <h3 className="text-xl font-semibold mb-3 text-card-foreground">実績サマリー</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{achievementSummary.total_achievements}</p>
              <p className="text-sm text-muted-foreground">総実績数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{achievementSummary.unlocked_achievements}</p>
              <p className="text-sm text-muted-foreground">達成済み</p>
            </div>
            {Object.entries(achievementSummary.progress_by_category).map(([category, summary]) => (
              summary.total > 0 && ( // カテゴリに実績がある場合のみ表示
                <div key={category}>
                  <p className="text-2xl font-bold text-accent-foreground">{summary.progress_percentage}%</p>
                  <p className="text-sm text-muted-foreground capitalize">{category} 達成率</p>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {/* 実績セクション */}
      <section className="mb-12">
        <div className="flex items-center mb-4">
          <Trophy className="mr-2 h-7 w-7 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">実績一覧</h2>
        </div>
        <Tabs value={activeTab} onValueChange={filterAchievements} className="mb-6">
          <TabsList className="bg-muted">
            {/* カテゴリータブ */}
            {achievementCategories.map((cat) => (
              cat && (
                <TabsTrigger key={cat} value={cat} className="capitalize px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
                  {categoryLabels[cat] || cat}
                </TabsTrigger>
              )
            ))}
          </TabsList>
        </Tabs>

        {loadingAchievements && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="flex flex-col animate-pulse bg-card border">
                <CardHeader className="p-4">
                  <div className="w-full aspect-[16/9] bg-muted rounded mb-3"></div>
                  <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0">
                  <div className="h-4 w-1/2 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="h-8 w-full bg-muted rounded"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {errorAchievements && (
          <div className="text-destructive-foreground bg-destructive/10 border border-destructive/20 p-4 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold">実績データの読み込みエラー</p>
              <p className="text-sm">{errorAchievements}</p>
            </div>
          </div>
        )}

        {!loadingAchievements && !errorAchievements && filteredAchievements.length === 0 && (
          <p className="text-muted-foreground py-4">
            {activeTab === "all" ? "実績はまだありません。" : `このカテゴリ (${activeTab}) の実績はまだありません。`}
          </p>
        )}

        {!loadingAchievements && !errorAchievements && filteredAchievements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAchievements.map((ach) => (
              <Card
                key={ach.id}
                className={cn(
                  "flex flex-col transition-all hover:shadow-lg bg-card border",
                  ach.unlocked ? "border-green-500 dark:border-green-600" : "border-border"
                )}
              >
                <CardHeader className="p-4">
                  <div className="relative w-full aspect-[16/9] mb-3">
                    <Image
                      src={ach.image_url || "/placeholder.svg?text=No+Image"}
                      alt={ach.title}
                      layout="fill"
                      objectFit="cover"
                      className={cn("rounded-md", !ach.unlocked && "opacity-60 grayscale")}
                    />
                    {ach.unlocked && (
                      <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1">
                        <UnlockIcon className="h-3 w-3 mr-1" />達成済
                      </Badge>
                    )}
                    {!ach.unlocked && (
                      <Badge variant="outline" className="absolute top-2 right-2 bg-background border-border text-xs px-2 py-1">
                        <LockIcon className="h-3 w-3 mr-1" />未達成
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-md font-semibold leading-tight text-card-foreground">{ach.title}</CardTitle>
                  <CardDescription className="text-xs h-10 overflow-hidden text-ellipsis text-muted-foreground">{ach.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0">
                  {ach.tier && <Badge variant="secondary" className="mb-2 text-xs bg-secondary text-secondary-foreground">Tier {ach.tier}</Badge>}
                  <Progress value={ach.progress_percentage} className="w-full h-2 my-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {ach.progress_percentage}% 完了 ({ach.progress} / {ach.progress_target})
                  </p>
                </CardContent>
                {ach.reward && (
                  <CardFooter className="p-4 pt-0">
                    <p className="text-xs text-primary font-medium">報酬: {ach.reward}</p>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}