import { format } from "date-fns"
import type { Transaction } from "@/types/transaction"

export type PeriodView = "day" | "month" | "year"

/** 表示期間（日・月・年）に含まれる取引を日付の新しい順で返す */
export function filterByPeriod(transactions: Transaction[], view: PeriodView, current: Date): Transaction[] {
  const filtered = transactions.filter((t) => {
    if (view === "day") return t.date === format(current, "yyyy-MM-dd")
    const tDate = new Date(t.date)
    if (view === "month") {
      return tDate.getMonth() === current.getMonth() && tDate.getFullYear() === current.getFullYear()
    }
    return tDate.getFullYear() === current.getFullYear()
  })
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/** 収入・支出の合計と収支 */
export function summarize(transactions: Transaction[]): { income: number; expense: number; balance: number } {
  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  return { income, expense, balance: income - expense }
}

/** 表示期間を前後に 1 つ動かす */
export function shiftPeriod(current: Date, view: PeriodView, direction: "prev" | "next"): Date {
  const next = new Date(current)
  const delta = direction === "next" ? 1 : -1
  if (view === "day") next.setDate(next.getDate() + delta)
  else if (view === "month") next.setMonth(next.getMonth() + delta)
  else next.setFullYear(next.getFullYear() + delta)
  return next
}
