"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { LockIcon, UnlockIcon, AlertTriangle, Trophy, Clock, History } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth"
import { useAchievements } from "@/hooks/useAchievements"
import OtterAnimation from "@/components/otter-animation"

// カテゴリ表示用の日本語マッピング
const categoryLabels: Record<string, string> = {
  all: 'すべて',
  savings: '貯金',
  streak: '連続記録',
  expense: '支出管理',
  special: '特別',
  history: '解除履歴',
};

const ACHIEVEMENT_CATEGORIES = ["all", "savings", "streak", "expense", "special", "history"] as const;

const formatUnlockedAt = (dateStr: string): string => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

// ティア表示用の日本語マッピング
const tierLabels: Record<string, string> = {
  bronze: 'ブロンズ',
  silver: 'シルバー',
  gold: 'ゴールド',
  platinum: 'プラチナ'
};

export default function CollectionPage() {
  const router = useRouter();
  const { isLoading: authIsLoading, isAuthenticated } = useAuth();
  const {
    achievements,
    filteredAchievements,
    achievementSummary,
    activeTab,
    isLoading,
    error,
    filterAchievements,
  } = useAchievements();

  // 認証チェック
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authIsLoading, isAuthenticated, router])

  // 実績達成率に応じたカワウソのムードとメッセージを計算
  const otterMood = useMemo((): "happy" | "neutral" | "sad" => {
    if (!achievementSummary || achievementSummary.totalAchievements === 0) return "neutral"
    const rate = achievementSummary.unlockedAchievements / achievementSummary.totalAchievements
    if (rate >= 0.7) return "happy"
    if (rate >= 0.3) return "neutral"
    return "sad"
  }, [achievementSummary])

  const otterMessage = useMemo((): string => {
    if (!achievementSummary || achievementSummary.totalAchievements === 0) return "実績を解除してカワウソを喜ばせよう！"
    const rate = achievementSummary.unlockedAchievements / achievementSummary.totalAchievements
    if (rate >= 0.7) return `すごい！実績の${Math.round(rate * 100)}%を達成したよ！このまま全制覇を目指そう！`
    if (rate >= 0.3) return `実績の${Math.round(rate * 100)}%を達成中！もっと頑張ろう！`
    return "まだ実績が少ないね...取引を記録して実績を解除しよう！"
  }, [achievementSummary])

  // 解除済み実績を unlocked_at 降順で並べた履歴リスト
  const historyAchievements = useMemo(
    () =>
      [...achievements]
        .filter((ach) => ach.unlocked && ach.unlockedAt)
        .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()),
    [achievements]
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-8 text-foreground">コレクション</h1>

      {/* カワウソ + 実績サマリー */}
      {!isLoading && !error && (
        <section className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">カワウソの様子</CardTitle>
              <CardDescription>実績達成率に応じて変化</CardDescription>
            </CardHeader>
            <CardContent>
              <OtterAnimation mood={otterMood} customMessage={otterMessage} />
            </CardContent>
          </Card>

          {achievementSummary && (
            <div className="md:col-span-3 p-4 bg-card text-card-foreground rounded-lg border flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">実績サマリー</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{achievementSummary.totalAchievements}</p>
                  <p className="text-sm text-muted-foreground">総実績数</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{achievementSummary.unlockedAchievements}</p>
                  <p className="text-sm text-muted-foreground">達成済み</p>
                </div>
                {Object.entries(achievementSummary.progressByCategory).map(([category, summary]) => (
                  summary && summary.total > 0 && (
                    <div key={category}>
                      <p className="text-2xl font-bold text-accent-foreground">{summary.progressPercentage}%</p>
                      <p className="text-sm text-muted-foreground capitalize">{categoryLabels[category] ?? category} 達成率</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
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
            {ACHIEVEMENT_CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
                {categoryLabels[cat] || cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="flex flex-col animate-pulse bg-card border">
                <CardHeader className="p-4">
                  <div className="w-full aspect-video bg-muted rounded mb-3"></div>
                  <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                </CardHeader>
                <CardContent className="grow p-4 pt-0">
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

        {error && (
          <div className="text-destructive-foreground bg-destructive/10 border border-destructive/20 p-4 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
            <div>
              <p className="font-semibold">実績データの読み込みエラー</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 解除履歴タブ */}
        {!isLoading && !error && activeTab === "history" && (
          historyAchievements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <History className="h-12 w-12 opacity-30" />
              <p className="text-sm">まだ解除した実績がありません。</p>
            </div>
          ) : (
            <div className="bg-card border rounded-lg divide-y divide-border">
              {historyAchievements.map((ach) => (
                <div key={ach.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{ach.title}</p>
                    <p className="text-xs text-muted-foreground">{formatUnlockedAt(ach.unlockedAt!)}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0 bg-secondary text-secondary-foreground">
                    {tierLabels[ach.tier] ?? ach.tier}
                  </Badge>
                </div>
              ))}
            </div>
          )
        )}

        {/* カテゴリフィルタータブ（履歴タブ以外） */}
        {!isLoading && !error && activeTab !== "history" && filteredAchievements.length === 0 && (
          <p className="text-muted-foreground py-4">
            {activeTab === "all" ? "実績はまだありません。" : `このカテゴリ (${categoryLabels[activeTab] ?? activeTab}) の実績はまだありません。`}
          </p>
        )}

        {!isLoading && !error && activeTab !== "history" && filteredAchievements.length > 0 && (
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
                  <div className="relative w-full aspect-video mb-3">
                    <Image
                      src={ach.imageUrl || "/placeholder.svg?text=No+Image"}
                      alt={ach.title}
                      fill
                      style={{ objectFit: "cover" }}
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
                <CardContent className="grow p-4 pt-0">
                  {ach.tier && <Badge variant="secondary" className="mb-2 text-xs bg-secondary text-secondary-foreground">{tierLabels[ach.tier] ?? ach.tier}</Badge>}
                  <Progress value={ach.progressPercentage} className="w-full h-2 my-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {ach.progressPercentage}% 完了 ({ach.progress} / {ach.progressTarget})
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
