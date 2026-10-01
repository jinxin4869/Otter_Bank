"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Wallet, ArrowUpCircle, ArrowDownCircle, Loader2, Trophy } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import OtterAnimation, { type OtterMood } from "@/components/otter-animation"
import { Tutorial } from "@/components/tutorial"
import { AchievementUnlockModal } from "@/components/achievement-unlock-modal"
import { useAuth } from "@/hooks/useAuth"
import { useAchievements } from "@/hooks/useAchievements"
import { useTransactions } from "@/hooks/useTransactions"
import { cn } from "@/lib/utils"
import { getFinancialMood, type FinancialMood } from "@/lib/otter-mood"
import { TIER_CONFIG } from "@/lib/tier"
import { filterByPeriod, summarize, shiftPeriod, type PeriodView } from "@/lib/transaction-period"
import type { TransactionParams } from "@/lib/api"
import type { NewlyUnlockedAchievement } from "@/types/achievement"
import type { Transaction } from "@/types/transaction"
import TransactionForm from "./_components/transaction-form"
import TransactionList from "./_components/transaction-list"

const ExpensePieChart = dynamic(() => import("@/components/expense-pie-chart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

const MonthlyTrend = dynamic(() => import("@/components/monthly-trend"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

const VIEW_TITLE_FORMAT: Record<PeriodView, string> = {
  day: "yyyy年MM月dd日",
  month: "yyyy年MM月",
  year: "yyyy年",
}

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<PeriodView>("month")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [otterMood, setOtterMood] = useState<FinancialMood>("neutral")
  const [celebratingSignal, setCelebratingSignal] = useState(0)
  const [achievementQueue, setAchievementQueue] = useState<NewlyUnlockedAchievement[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const router = useRouter()
  const { user, token, isLoading: authIsLoading, isAuthenticated, hasLoggedOut } = useAuth()
  const { achievements, achievementSummary, refetch: refetchAchievements } = useAchievements()
  const { transactions, isLoading: isDataLoading, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions(token, isAuthenticated)

  const currentAchievement = achievementQueue[0] ?? null

  // 前回サインインから7日以上経過していれば sleeping とみなす
  const isSleeping = useMemo(() => {
    if (!user?.lastSignInAt) return false
    const lastSignIn = new Date(user.lastSignInAt).getTime()
    if (Number.isNaN(lastSignIn)) return false
    const daysSinceSignIn = (Date.now() - lastSignIn) / (1000 * 60 * 60 * 24)
    return daysSinceSignIn >= 7
  }, [user])

  // 表示 mood の優先順位: excited（実績解除直後） > sleeping（長期未ログイン） > 財務状況
  const displayMood: OtterMood =
    celebratingSignal > 0 ? "excited" : isSleeping ? "sleeping" : otterMood

  const handleAchievementClose = useCallback(() => {
    setAchievementQueue((prev) => prev.slice(1))
  }, [])

  const recentAchievements = useMemo(
    () =>
      [...achievements]
        .filter((a) => a.unlocked && a.unlockedAt)
        .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
        .slice(0, 3),
    [achievements]
  )

  useEffect(() => {
    // 自分でログアウトした場合は useAuth がトップへ移動させるので、ここでは /login へ飛ばさない
    if (!authIsLoading && !isAuthenticated && !hasLoggedOut) {
      router.push("/login")
    }
  }, [authIsLoading, isAuthenticated, hasLoggedOut, router])

  // 今月の収支でカワウソの気分を決める（判定は lib/otter-mood.ts）
  useEffect(() => {
    const { income, expense } = summarize(filterByPeriod(transactions, "month", new Date()))
    setOtterMood(getFinancialMood(income, expense))
  }, [transactions])

  // 実績解除の高揚状態は一定時間で解除し、通常の mood に戻す
  // カウンター方式にすることで連続解除時も毎回タイマーが再起動される
  useEffect(() => {
    if (celebratingSignal === 0) return
    const timer = setTimeout(() => setCelebratingSignal(0), 6000)
    return () => clearTimeout(timer)
  }, [celebratingSignal])

  // 登録・更新で新たに解除された実績を知らせる
  const celebrateUnlocked = useCallback(
    (newlyUnlocked: NewlyUnlockedAchievement[]) => {
      if (newlyUnlocked.length === 0) return
      newlyUnlocked.forEach((ach) => {
        toast.success(`実績解除: ${ach.title}`, { description: ach.description })
      })
      setAchievementQueue((prev) => [...prev, ...newlyUnlocked])
      setCelebratingSignal((n) => n + 1)
      // 解除で成長ステージが変わる可能性があるため、表示を変えずに再取得する
      void refetchAchievements({ silent: true })
    },
    [refetchAchievements]
  )

  const handleSubmit = useCallback(
    async (params: TransactionParams) => {
      const newlyUnlocked = await addTransaction(params)
      if (newlyUnlocked === null) return false
      celebrateUnlocked(newlyUnlocked)
      return true
    },
    [addTransaction, celebrateUnlocked]
  )

  const handleUpdate = useCallback(
    async (params: TransactionParams) => {
      if (!editingTransaction) return false
      const newlyUnlocked = await updateTransaction(editingTransaction.id, params)
      if (newlyUnlocked === null) return false
      // 日付を変えて表示中の期間から外れると一覧から消えるので、消えた理由を伝える
      const movedOut = filterByPeriod([{ ...editingTransaction, date: params.date }], currentView, currentDate).length === 0
      toast.success("取引を更新しました", movedOut ? { description: "表示中の期間の外に移動しました" } : undefined)
      setEditingTransaction(null)
      celebrateUnlocked(newlyUnlocked)
      return true
    },
    [editingTransaction, updateTransaction, celebrateUnlocked, currentView, currentDate]
  )

  const filteredTransactions = useMemo(
    () => filterByPeriod(transactions, currentView, currentDate),
    [transactions, currentView, currentDate]
  )
  const { income: totalIncome, expense: totalExpense, balance } = summarize(filteredTransactions)

  if (authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const userName = user?.name || user?.username || "ユーザー"

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <AchievementUnlockModal achievement={currentAchievement} onClose={handleAchievementClose} />

      <Dialog
        open={editingTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>取引を編集</DialogTitle>
            <DialogDescription>金額・種別・カテゴリー・日付を直せます。実績の進捗も再計算されます。</DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            // key で取引ごとにフォームを作り直し、初期値を確実に入れ替える
            <TransactionForm key={editingTransaction.id} initialTransaction={editingTransaction} onSubmit={handleUpdate} />
          )}
        </DialogContent>
      </Dialog>
      <Tutorial />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">
          {userName ? `${userName}の家計簿` : "家計簿"}
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(shiftPeriod(currentDate, currentView, "prev"))}>
            前へ
          </Button>

          <div className="font-medium">{format(currentDate, VIEW_TITLE_FORMAT[currentView], { locale: ja })}</div>

          <Button variant="outline" size="sm" onClick={() => setCurrentDate(shiftPeriod(currentDate, currentView, "next"))}>
            次へ
          </Button>

          <Select value={currentView} onValueChange={(value: string) => setCurrentView(value as PeriodView)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">日別</SelectItem>
              <SelectItem value="month">月別</SelectItem>
              <SelectItem value="year">年別</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* md 以上: カワウソを左に置き、右に収入・支出・収支を横長で縦に積む（高さを揃えて余白を出さない）。
          row-span-3 は右側が常に 3 枚ある前提なので、カードを条件付きで出し分けるときは配置も見直す */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:row-span-3">
          <CardHeader className="pb-2">
            <CardTitle>カワウソの様子</CardTitle>
            <CardDescription>財政状況に応じて変化</CardDescription>
          </CardHeader>
          <CardContent>
            <OtterAnimation mood={displayMood} growthStage={achievementSummary?.growthStage.stage} />
          </CardContent>
        </Card>

        <Card className="md:col-span-3 justify-center bg-income-bg border-income-border">
          <CardHeader className="pb-2">
            <CardDescription>総収入</CardDescription>
            <CardTitle className="text-2xl text-income flex items-center">
              <ArrowUpCircle className="mr-2 h-5 w-5" />
              {totalIncome.toLocaleString()} 円
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="md:col-span-3 justify-center bg-expense-bg border-expense-border">
          <CardHeader className="pb-2">
            <CardDescription>総支出</CardDescription>
            <CardTitle className="text-2xl text-expense flex items-center">
              <ArrowDownCircle className="mr-2 h-5 w-5" />
              {totalExpense.toLocaleString()} 円
            </CardTitle>
          </CardHeader>
        </Card>

        <Card
          className={cn(
            "md:col-span-3 justify-center bg-linear-to-br",
            balance >= 0
              ? "from-income-bg to-income-bg/50 border-income-border"
              : "from-expense-bg to-expense-bg/50 border-expense-border",
          )}
        >
          <CardHeader className="pb-2">
            <CardDescription>収支バランス</CardDescription>
            <CardTitle className={cn("text-2xl flex items-center", balance >= 0 ? "text-income" : "text-expense")}>
              <Wallet className="mr-2 h-5 w-5" />
              {balance.toLocaleString()} 円
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>取引履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList
              transactions={filteredTransactions}
              isLoading={isDataLoading}
              onEdit={setEditingTransaction}
              onDelete={deleteTransaction}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>新規取引</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>

      {/* 最近解除した実績バッジ */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              最近解除した実績
            </CardTitle>
            <CardDescription>直近で達成した実績（最大3件）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {recentAchievements.map((ach) => (
                <div key={ach.id} className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 shadow-sm">
                  <Trophy className="h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium leading-none">{ach.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{ach.description}</p>
                  </div>
                  <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
                    {TIER_CONFIG[ach.tier].label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>支出カテゴリー分析</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ExpensePieChart transactions={filteredTransactions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>月次推移</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <MonthlyTrend transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
