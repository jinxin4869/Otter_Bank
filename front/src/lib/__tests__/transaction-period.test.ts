import { filterByPeriod, summarize, shiftPeriod } from "@/lib/transaction-period"
import type { Transaction } from "@/types/transaction"

const tx = (id: string, date: string, type: "income" | "expense", amount: number): Transaction => ({
  id, date, type, amount, category: "other", description: "",
})

const list = [
  tx("1", "2026-09-21", "income", 10000),
  tx("2", "2026-09-03", "expense", 3000),
  tx("3", "2026-08-30", "expense", 500),
  tx("4", "2025-12-31", "income", 100),
]

describe("filterByPeriod", () => {
  it("月表示は同じ年月の取引を新しい順に返す", () => {
    expect(filterByPeriod(list, "month", new Date(2026, 8, 15)).map((t) => t.id)).toEqual(["1", "2"])
  })
  it("日表示は同じ日付の取引だけ返す", () => {
    expect(filterByPeriod(list, "day", new Date(2026, 8, 3)).map((t) => t.id)).toEqual(["2"])
  })
  it("年表示は同じ年の取引を返す", () => {
    expect(filterByPeriod(list, "year", new Date(2026, 0, 1)).map((t) => t.id)).toEqual(["1", "2", "3"])
  })
})

describe("summarize", () => {
  it("収入・支出・収支を合計する", () => {
    expect(summarize(list.slice(0, 3))).toEqual({ income: 10000, expense: 3500, balance: 6500 })
  })
})

describe("shiftPeriod", () => {
  it("表示単位に応じて日・月・年を進める", () => {
    const base = new Date(2026, 8, 30)
    expect(shiftPeriod(base, "day", "next")).toEqual(new Date(2026, 9, 1))
    expect(shiftPeriod(base, "month", "prev")).toEqual(new Date(2026, 7, 30))
    expect(shiftPeriod(base, "year", "next")).toEqual(new Date(2027, 8, 30))
  })
})
