"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { toast } from "sonner"
import MonthlyTrend from "@/components/monthly-trend"
import ExpensePieChart from "@/components/expense-pie-chart"

// サンプルデータ
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    amount: 5000,
    type: "expense",
    category: "food",
    description: "スーパーでの買い物",
    date: "2023-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    amount: 3000,
    type: "expense",
    category: "transportation",
    description: "電車定期券",
    date: "2023-01-10T00:00:00.000Z",
  },
  {
    id: "3",
    amount: 150000,
    type: "income",
    category: "salary",
    description: "1月給料",
    date: "2023-01-25T00:00:00.000Z",
  },
  {
    id: "4",
    amount: 8000,
    type: "expense",
    category: "entertainment",
    description: "映画と食事",
    date: "2023-01-20T00:00:00.000Z",
  },
  {
    id: "5",
    amount: 60000,
    type: "expense",
    category: "rent",
    description: "1月家賃",
    date: "2023-01-05T00:00:00.000Z",
  },
  {
    id: "6",
    amount: 4500,
    type: "expense",
    category: "utilities",
    description: "電気代",
    date: "2023-01-08T00:00:00.000Z",
  },
  {
    id: "7",
    amount: 3200,
    type: "expense",
    category: "utilities",
    description: "水道代",
    date: "2023-01-08T00:00:00.000Z",
  },
  {
    id: "8",
    amount: 12000,
    type: "expense",
    category: "groceries",
    description: "日用品",
    date: "2023-01-12T00:00:00.000Z",
  },
  {
    id: "9",
    amount: 30000,
    type: "income",
    category: "bonus",
    description: "臨時ボーナス",
    date: "2023-02-15T00:00:00.000Z",
  },
  {
    id: "10",
    amount: 150000,
    type: "income",
    category: "salary",
    description: "2月給料",
    date: "2023-02-25T00:00:00.000Z",
  },
  {
    id: "11",
    amount: 60000,
    type: "expense",
    category: "rent",
    description: "2月家賃",
    date: "2023-02-05T00:00:00.000Z",
  },
  {
    id: "12",
    amount: 6000,
    type: "expense",
    category: "food",
    description: "スーパーでの買い物",
    date: "2023-02-10T00:00:00.000Z",
  },
  {
    id: "13",
    amount: 4800,
    type: "expense",
    category: "utilities",
    description: "電気代",
    date: "2023-02-08T00:00:00.000Z",
  },
  {
    id: "14",
    amount: 3500,
    type: "expense",
    category: "utilities",
    description: "水道代",
    date: "2023-02-08T00:00:00.000Z",
  },
  {
    id: "15",
    amount: 150000,
    type: "income",
    category: "salary",
    description: "3月給料",
    date: "2023-03-25T00:00:00.000Z",
  },
  {
    id: "16",
    amount: 60000,
    type: "expense",
    category: "rent",
    description: "3月家賃",
    date: "2023-03-05T00:00:00.000Z",
  },
  {
    id: "17",
    amount: 5500,
    type: "expense",
    category: "food",
    description: "スーパーでの買い物",
    date: "2023-03-12T00:00:00.000Z",
  },
  {
    id: "18",
    amount: 4200,
    type: "expense",
    category: "utilities",
    description: "電気代",
    date: "2023-03-08T00:00:00.000Z",
  },
  {
    id: "19",
    amount: 3300,
    type: "expense",
    category: "utilities",
    description: "水道代",
    date: "2023-03-08T00:00:00.000Z",
  },
  {
    id: "20",
    amount: 150000,
    type: "income",
    category: "salary",
    description: "4月給料",
    date: "2023-04-25T00:00:00.000Z",
  },
  {
    id: "21",
    amount: 60000,
    type: "expense",
    category: "rent",
    description: "4月家賃",
    date: "2023-04-05T00:00:00.000Z",
  },
  {
    id: "22",
    amount: 5800,
    type: "expense",
    category: "food",
    description: "スーパーでの買い物",
    date: "2023-04-14T00:00:00.000Z",
  },
  {
    id: "23",
    amount: 4500,
    type: "expense",
    category: "utilities",
    description: "電気代",
    date: "2023-04-08T00:00:00.000Z",
  },
  {
    id: "24",
    amount: 3400,
    type: "expense",
    category: "utilities",
    description: "水道代",
    date: "2023-04-08T00:00:00.000Z",
  },
  {
    id: "25",
    amount: 150000,
    type: "income",
    category: "salary",
    description: "5月給料",
    date: "2023-05-25T00:00:00.000Z",
  },
  {
    id: "26",
    amount: 60000,
    type: "expense",
    category: "rent",
    description: "5月家賃",
    date: "2023-05-05T00:00:00.000Z",
  },
  {
    id: "27",
    amount: 6200,
    type: "expense",
    category: "food",
    description: "スーパーでの買い物",
    date: "2023-05-16T00:00:00.000Z",
  },
  {
    id: "28",
    amount: 4300,
    type: "expense",
    category: "utilities",
    description: "電気代",
    date: "2023-05-08T00:00:00.000Z",
  },
  {
    id: "29",
    amount: 3200,
    type: "expense",
    category: "utilities",
    description: "水道代",
    date: "2023-05-08T00:00:00.000Z",
  },
  {
    id: "30",
    amount: 150000,
    type: "income",
    category: "salary",
    description: "6月給料",
    date: "2023-06-25T00:00:00.000Z",
  },
  {
    id: "31",
    amount: 60000,
    type: "expense",
    category: "rent",
    description: "6月家賃",
    date: "2023-06-05T00:00:00.000Z",
  },
  {
    id: "32",
    amount: 5900,
    type: "expense",
    category: "food",
    description: "スーパーでの買い物",
    date: "2023-06-18T00:00:00.000Z",
  },
  {
    id: "33",
    amount: 4100,
    type: "expense",
    category: "utilities",
    description: "電気代",
    date: "2023-06-08T00:00:00.000Z",
  },
  {
    id: "34",
    amount: 3300,
    type: "expense",
    category: "utilities",
    description: "水道代",
    date: "2023-06-08T00:00:00.000Z",
  },
]

// 取引カテゴリー
const EXPENSE_CATEGORIES = [
  { value: "food", label: "食費" },
  { value: "groceries", label: "日用品" },
  { value: "transportation", label: "交通費" },
  { value: "entertainment", label: "娯楽" },
  { value: "utilities", label: "光熱費" },
  { value: "rent", label: "家賃" },
  { value: "medical", label: "医療費" },
  { value: "education", label: "教育費" },
  { value: "shopping", label: "買い物" },
  { value: "other", label: "その他" },
]

const INCOME_CATEGORIES = [
  { value: "salary", label: "給料" },
  { value: "bonus", label: "ボーナス" },
  { value: "gift", label: "贈与" },
  { value: "investment", label: "投資" },
  { value: "other", label: "その他" },
]

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>(new Date())

  // ログイン状態を確認
  useEffect(() => {
    // ログイン状態をチェック
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (!isLoggedIn) {
      // ログインしていない場合
      router.push("/login")
      return
    }

    // ローカルストレージから取引データを取得
    const savedTransactions = localStorage.getItem("transactions")
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    } else {
      // サンプルデータを使用
      setTransactions(SAMPLE_TRANSACTIONS)
      localStorage.setItem("transactions", JSON.stringify(SAMPLE_TRANSACTIONS))
    }
  }, [router])

  // 新規取引の追加
  const handleAddTransaction = () => {
    // 金額の検証
    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("無効な金額", {
        description: "有効な金額を入力してください。",
      })
      return
    }

    // カテゴリーの検証
    if (!category) {
      toast.error("カテゴリーが選択されていません",{
        description: "カテゴリーを選択してください。",
      })
      return
    }

    // 新しい取引を作成
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: amountValue,
      type,
      category,
      description,
      date: date.toISOString(),
    }

    // 取引リストに追加
    const updatedTransactions = [...transactions, newTransaction]
    setTransactions(updatedTransactions)

    // ローカルストレージに保存
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    // フォームをリセット
    setAmount("")
    setType("expense")
    setCategory("")
    setDescription("")
    setDate(new Date())

    toast.success("取引を追加しました",{
      description: "新しい取引が正常に追加されました。",
    })
  }

  // 収入と支出の合計を計算
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const balance = totalIncome - totalExpense

  // 最近の取引を取得（最新の5件）
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // カテゴリーの表示名を取得
  const getCategoryLabel = (category: string, type: "income" | "expense") => {
    const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    return categories.find((c) => c.value === category)?.label || category
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 収支サマリー */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>収支サマリー</CardTitle>
            <CardDescription>現在の収入と支出の概要</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">収入</p>
              <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()} 円</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">支出</p>
              <p className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()} 円</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">残高</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {balance.toLocaleString()} 円
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 新規取引 */}
        <Card>
          <CardHeader>
            <CardTitle>新規取引</CardTitle>
            <CardDescription>収入や支出を記録</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">金額</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="金額を入力"
                min="0"
                step="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">種類</Label>
              <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="種類を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">収入</SelectItem>
                  <SelectItem value="expense">支出</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリー</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  {type === "income"
                    ? INCOME_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))
                    : EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">詳細</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="詳細を入力（任意）"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">日付</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddTransaction} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              追加
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 分析グラフ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>月次トレンド</CardTitle>
            <CardDescription>過去6ヶ月の収支推移</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <MonthlyTrend transactions={transactions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>支出カテゴリー分析</CardTitle>
            <CardDescription>カテゴリー別の支出割合</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ExpensePieChart transactions={transactions} />
          </CardContent>
        </Card>
      </div>

      {/* 最近の取引 */}
      <Card>
        <CardHeader>
          <CardTitle>最近の取引</CardTitle>
          <CardDescription>直近5件の取引履歴</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                        transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600",
                      )}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{getCategoryLabel(transaction.category, transaction.type)}</p>
                      <p className="text-sm text-muted-foreground">{transaction.description || "詳細なし"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "yyyy年MM月dd日", { locale: ja })}
                      </p>
                    </div>
                  </div>
                  <p className={cn("font-bold", transaction.type === "income" ? "text-green-600" : "text-red-600")}>
                    {transaction.type === "income" ? "+" : "-"}
                    {transaction.amount.toLocaleString()} 円
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">取引がありません</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            すべての取引を表示
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

