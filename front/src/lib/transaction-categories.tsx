import type { LucideIcon } from "lucide-react"
import {
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

// 取引カテゴリの定義。値（API に送る文字列）・表示名・アイコン・グラフ色をここだけで持つ
export type TransactionCategory = {
  value: string
  label: string
  icon: LucideIcon
  color?: string // 円グラフの色（支出のみ）
}

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  { value: "food", label: "食費", icon: Coffee, color: "#FF6384" },
  { value: "groceries", label: "日用品", icon: ShoppingBag, color: "#36A2EB" },
  { value: "transportation", label: "交通費", icon: Bus, color: "#FFCE56" },
  { value: "entertainment", label: "娯楽", icon: Film, color: "#4BC0C0" },
  { value: "utilities", label: "光熱費", icon: Lightbulb, color: "#9966FF" },
  { value: "rent", label: "家賃", icon: Home, color: "#FF9F40" },
  { value: "medical", label: "医療費", icon: Stethoscope, color: "#C9CBCF" },
  { value: "education", label: "教育費", icon: GraduationCap, color: "#7FD8BE" },
  { value: "shopping", label: "買い物", icon: ShoppingCart, color: "#A78BFA" },
  { value: "other", label: "その他", icon: HelpCircle, color: "#8B8B8B" },
]

export const INCOME_CATEGORIES: TransactionCategory[] = [
  { value: "salary", label: "給料", icon: Briefcase },
  { value: "bonus", label: "ボーナス", icon: Gift },
  { value: "investment", label: "投資", icon: TrendingUp },
  { value: "gift", label: "贈与", icon: Gift },
  { value: "other", label: "その他", icon: DollarSign },
]

export const categoriesFor = (type: "income" | "expense"): TransactionCategory[] =>
  type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

/** 未知の値は値そのものを返す（古いデータや API 側だけにあるカテゴリ） */
export const findCategory = (value: string, type: "income" | "expense"): TransactionCategory | undefined =>
  categoriesFor(type).find((c) => c.value === value)

export const getCategoryLabel = (value: string, type: "income" | "expense"): string =>
  findCategory(value, type)?.label ?? value
