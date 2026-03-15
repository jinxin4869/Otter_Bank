/** Rails API レスポンス型（スネークケース） */
export type ApiTransaction = {
  id: number
  amount: string | number
  transaction_type: string
  category: string
  description: string | null
  date: string
}

/** フロント内部型（キャメルケース） */
export type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
}

/** ApiTransaction -> Transaction に変換する */
export const mapApiTransaction = (t: ApiTransaction): Transaction => ({
  id: String(t.id),
  amount: Number(t.amount),
  type: t.transaction_type as "income" | "expense",
  category: t.category,
  description: t.description || "",
  date: t.date ? t.date.split("T")[0] : "",
})
