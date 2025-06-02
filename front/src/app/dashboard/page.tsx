"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import {
  CalendarIcon,
  PlusCircle,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Coffee,
  ShoppingBag,
  Bus,
  Film,
  Lightbulb,
  Home,
  Stethoscope,
  GraduationCap,
  ShoppingCart,
  HelpCircle,
  Briefcase,
  Gift,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import OtterAnimation from "@/components/otter-animation"
import ExpensePieChart from "@/components/expense-pie-chart"
import MonthlyTrend from "@/components/monthly-trend"
import { Tutorial } from "@/components/tutorial"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
}

const EXPENSE_CATEGORIES = [
  { value: "food", label: "食費", icon: <Coffee className="h-4 w-4" /> },
  { value: "groceries", label: "日用品", icon: <ShoppingBag className="h-4 w-4" /> },
  { value: "transportation", label: "交通費", icon: <Bus className="h-4 w-4" /> },
  { value: "entertainment", label: "娯楽", icon: <Film className="h-4 w-4" /> },
  { value: "utilities", label: "光熱費", icon: <Lightbulb className="h-4 w-4" /> },
  { value: "rent", label: "家賃", icon: <Home className="h-4 w-4" /> },
  { value: "medical", label: "医療費", icon: <Stethoscope className="h-4 w-4" /> },
  { value: "education", label: "教育費", icon: <GraduationCap className="h-4 w-4" /> },
  { value: "shopping", label: "買い物", icon: <ShoppingCart className="h-4 w-4" /> },
  { value: "other", label: "その他", icon: <HelpCircle className="h-4 w-4" /> },
]

const INCOME_CATEGORIES = [
  { value: "salary", label: "給料", icon: <Briefcase className="h-4 w-4" /> },
  { value: "bonus", label: "ボーナス", icon: <Gift className="h-4 w-4" /> },
  { value: "investment", label: "投資", icon: <TrendingUp className="h-4 w-4" /> },
  { value: "gift", label: "贈与", icon: <Gift className="h-4 w-4" /> },
  { value: "other", label: "その他", icon: <DollarSign className="h-4 w-4" /> },
]

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState("")
  const [amountError, setAmountError] = useState<string | null>(null)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [currentView, setCurrentView] = useState<"day" | "month" | "year">("month")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [otterMood, setOtterMood] = useState<"happy" | "neutral" | "sad">("neutral")
  const [userName, setUserName] = useState<string | null>(null); //ユーザー名取得
  const router = useRouter()

  // ログイン状態を確認する処理を追加
  useEffect(() => {
    // ログイン状態をチェック
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userEmail = localStorage.getItem("currentUserEmail")

    if (!isLoggedIn) {
      // ログインしていない場合
      router.push("/login")
      return
    }

    if (userEmail) {
      setUserName(userEmail.split("@")[0]) // メールアドレスからユーザー名を抽出
    } else {
      setUserName("ゲスト") // ユーザー名が取得できない場合のデフォルト値
    }
  }, [router])

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions")
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    } else {
      // Create sample data for demo
      const sampleData = generateSampleData()
      setTransactions(sampleData)
      localStorage.setItem("transactions", JSON.stringify(sampleData))
    }
  }, [])

  // Update otter mood based on financial health
  useEffect(() => {
    if (transactions.length === 0) return

    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()

    const monthlyTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date)
      return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear
    })

    const income = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expense = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const savingsRate = income > 0 ? (income - expense) / income : 0

    if (savingsRate > 0.2) {
      setOtterMood("happy")
    } else if (savingsRate < 0) {
      setOtterMood("sad")
    } else {
      setOtterMood("neutral")
    }
  }, [transactions])

  const validateAmount = (value: string) => {
    // 空の場合はエラーなし
    if (!value) {
      setAmountError(null)
      return true
    }

    // 数値のみを許可
    const numericValue = value.replace(/,/g, "")
    if (!/^\d+(\.\d{0,2})?$/.test(numericValue)) {
      setAmountError("数字を入力してください。例：1000")
      return false
    }

    setAmountError(null)
    return true
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    validateAmount(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !category || !validateAmount(amount)) return

    const numericAmount = Number.parseFloat(amount.replace(/,/g, ""))

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: numericAmount,
      type,
      category,
      description,
      date: format(date, "yyyy-MM-dd"),
    }

    const updatedTransactions = [...transactions, newTransaction]
    setTransactions(updatedTransactions)

    // Save to localStorage
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    // Reset form
    setAmount("")
    setAmountError(null)
    setDescription("")
    setDate(new Date())
  }

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id)
    setTransactions(updatedTransactions)
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))
  }

  const getFilteredTransactions = () => {
    let filtered = [...transactions]

    if (currentView === "day") {
      filtered = filtered.filter((t) => {
        return t.date === format(currentDate, "yyyy-MM-dd")
      })
    } else if (currentView === "month") {
      const month = currentDate.getMonth()
      const year = currentDate.getFullYear()
      filtered = filtered.filter((t) => {
        const tDate = new Date(t.date)
        return tDate.getMonth() === month && tDate.getFullYear() === year
      })
    } else if (currentView === "year") {
      const year = currentDate.getFullYear()
      filtered = filtered.filter((t) => {
        const tDate = new Date(t.date)
        return tDate.getFullYear() === year
      })
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const calculateBalance = () => {
    const filtered = getFilteredTransactions()
    const income = filtered.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expense = filtered.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    return income - expense
  }

  const calculateTotalIncome = () => {
    const filtered = getFilteredTransactions()
    return filtered.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  }

  const calculateTotalExpense = () => {
    const filtered = getFilteredTransactions()
    return filtered.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  }

  const getCategoryLabel = (categoryValue: string, type: "income" | "expense") => {
    const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    return categories.find((c) => c.value === categoryValue)?.label || categoryValue
  }

  const getCategoryIcon = (categoryValue: string, type: "income" | "expense") => {
    const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    const categoryData = categories.find((c) => c.value === categoryValue)

    if (categoryData) {
      const IconComponent = categoryData.icon.type
      return <IconComponent className="h-4 w-4 transition-history-icon warm-bg-icon" />
    }

    return <HelpCircle className="h-4 w-4 transaction-history-icon warm-bg-icon" />
  }

  const getViewTitle = () => {
    if (currentView === "day") {
      return format(currentDate, "yyyy年MM月dd日", { locale: ja })
    } else if (currentView === "month") {
      return format(currentDate, "yyyy年MM月", { locale: ja })
    } else {
      return format(currentDate, "yyyy年", { locale: ja })
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    if (currentView === "day") {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
      setCurrentDate(newDate)
    } else if (currentView === "month") {
      const newDate = new Date(currentDate)
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
      setCurrentDate(newDate)
    } else {
      const newDate = new Date(currentDate)
      newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 1 : -1))
      setCurrentDate(newDate)
    }
  }

  // Generate sample data for demo
  const generateSampleData = (): Transaction[] => {
    const data: Transaction[] = []
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Generate data for the last 3 months
    for (let m = 0; m < 3; m++) {
      const month = (currentMonth - m + 12) % 12
      const year = month > currentMonth ? currentYear - 1 : currentYear

      // Add salary for each month
      data.push({
        id: `income-${year}-${month}-1`,
        amount: 280000,
        type: "income",
        category: "salary",
        description: "月給",
        date: format(new Date(year, month, 15), "yyyy-MM-dd"),
      })

      // Add some random expenses
      for (let i = 0; i < 15; i++) {
        const day = Math.floor(Math.random() * 28) + 1
        const categoryIndex = Math.floor(Math.random() * EXPENSE_CATEGORIES.length)
        const amount = Math.floor(Math.random() * 10000) + 500

        data.push({
          id: `expense-${year}-${month}-${i}`,
          amount,
          type: "expense",
          category: EXPENSE_CATEGORIES[categoryIndex].value,
          description: `${EXPENSE_CATEGORIES[categoryIndex].label}の支出`,
          date: format(new Date(year, month, day), "yyyy-MM-dd"),
        })
      }
    }

    return data
  }

  const filteredTransactions = getFilteredTransactions()
  const balance = calculateBalance()
  const totalIncome = calculateTotalIncome()
  const totalExpense = calculateTotalExpense()

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8"> {/* ページ全体のパディングと要素間のスペースを調整 */}
      {/* チュートリアルコンポーネントを追加 */}
      <Tutorial />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">
          {userName ? `${userName}の家計簿` : "家計簿"} {/* ユーザー名を表示　*/}
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
            前へ
          </Button>

          <div className="font-medium">{getViewTitle()}</div>

          <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
            次へ
          </Button>

          <Select
            value={currentView}
            onValueChange={(value: string) => setCurrentView(value as "day" | "month" | "year")}>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>カワウソの様子</CardTitle>
            <CardDescription>財政状況に応じて変化</CardDescription>
          </CardHeader>
          <CardContent>
            <OtterAnimation mood={otterMood} />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/10 border-blue-200/70 dark:border-blue-800/30">
          <CardHeader className="pb-2">
            <CardDescription>総収入</CardDescription>
            <CardTitle className="text-2xl text-blue-500 dark:text-blue-300 flex items-center">
              <ArrowUpCircle className="mr-2 h-5 w-5" />
              {totalIncome.toLocaleString()} 円
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50/80 to-rose-100/50 dark:from-rose-900/10 dark:to-rose-800/10 border-rose-200/70 dark:border-rose-800/30">
          <CardHeader className="pb-2">
            <CardDescription>総支出</CardDescription>
            <CardTitle className="text-2xl text-rose-500 dark:text-rose-300 flex items-center">
              <ArrowDownCircle className="mr-2 h-5 w-5" />
              {totalExpense.toLocaleString()} 円
            </CardTitle>
          </CardHeader>
        </Card>

        <Card
          className={cn(
            "bg-gradient-to-br",
            balance >= 0
              ? "from-teal-50/80 to-teal-100/50 dark:from-teal-900/10 dark:to-teal-800/10 border-teal-200/70 dark:border-teal-800/30"
              : "from-amber-50/80 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/10 border-amber-200/70 dark:border-amber-800/30",
          )}
        >
          <CardHeader className="pb-2">
            <CardDescription>収支バランス</CardDescription>
            <CardTitle
              className={cn(
                "text-2xl flex items-center",
                balance >= 0 ? "text-teal-500 dark:text-teal-300" : "text-amber-500 dark:text-amber-300",
              )}
            >
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
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">この期間の取引はありません</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center p-3 border rounded hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            transaction.type === "income"
                              ? "bg-amber-600/70 text-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-purple-600/70 text-rose-200 dark:bg-rose-900/30 dark:text-rose-300",
                          )}
                        >
                          {getCategoryIcon(transaction.category, transaction.type)}
                        </div>
                        <div>
                          <div className="font-medium">{getCategoryLabel(transaction.category, transaction.type)}</div>
                          {transaction.description && (
                            <div className="text-sm text-muted-foreground">{transaction.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div
                            className={cn(
                              "font-medium",
                              transaction.type === "income"
                                ? "text-blue-500 dark:text-blue-300"
                                : "text-rose-500 dark:text-rose-300",
                            )}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {transaction.amount.toLocaleString()} 円
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transaction.date), "yyyy/MM/dd")}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTransaction(transaction.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>新規取引</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">金額</Label>
                <Input
                  id="amount"
                  type="text"
                  placeholder="1000"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                  className={amountError ? "border-red-500" : ""}
                />
                {amountError && <p className="text-sm text-red-500">{amountError}</p>}
              </div>

              <div className="space-y-2">
                <Label>タイプ</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={type === "expense" ? "default" : "outline"}
                    className={cn("flex-1", type === "expense" && "bg-rose-500/90 hover:bg-rose-600/90")}
                    onClick={() => {
                      setType("expense")
                      setCategory("")
                    }}
                  >
                    支出
                  </Button>
                  <Button
                    type="button"
                    variant={type === "income" ? "default" : "outline"}
                    className={cn("flex-1", type === "income" && "bg-blue-500/90 hover:bg-blue-600/90")}
                    onClick={() => {
                      setType("income")
                      setCategory("")
                    }}
                  >
                    収入
                  </Button>
                </div>
              </div>

              {/* カテゴリー選択ドロップダウンメニューのスタイル調整 */}
              {/* ライトモードうまくいってない */}
              <div className="space-y-2">
                <Label htmlFor="category">カテゴリー</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="w-full bg-orange-200">
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent
                    className="category-dropdown-menu"
                    position="item-aligned"
                    align="start"
                    side="bottom"
                    sideOffset={5}
                  >
                    {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <SelectItem
                        key={cat.value}
                        value={cat.value}
                        className={`select-item-custom ${type === "income" ? "income-category-item" : "expense-category-item"}`}
                      >
                        <div className="flex items-center gap-2">
                          {cat.icon}
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">詳細 (任意)</Label>
                <Input
                  id="description"
                  placeholder="取引の詳細"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>日付</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "yyyy年MM月dd日", { locale: ja })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <Button type="submit" className="w-full" disabled={!!amountError}>
                <PlusCircle className="mr-2 h-4 w-4" />
                追加
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

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

