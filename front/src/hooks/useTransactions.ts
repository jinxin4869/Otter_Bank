import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { api, type TransactionParams } from "@/lib/api"
import { type Transaction, type MonthlySummary, mapApiTransaction, mapApiMonthlySummary } from "@/types/transaction"
import { mapApiNewlyUnlockedAchievement, type NewlyUnlockedAchievement } from "@/types/achievement"

export type PeriodRange = { startDate: string; endDate: string }

type CachedPeriod = { transactions: Transaction[]; hasMore: boolean }

const MONTHLY_SUMMARY_MONTHS = 6

// 取引の取得・登録・更新・削除。全件ではなく表示中の期間（range）だけを取り、取得済みの期間はキャッシュする。
// 月次推移とカワウソの気分は期間をまたぐので、月ごとの集計（monthlySummary）を別に取る。
// 表示のための絞り込みや集計は lib/transaction-period.ts に置く
export function useTransactions(token: string | null, isAuthenticated: boolean, range: PeriodRange) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  // 期間内の取引がサーバーの件数上限を超え、一部しか受け取れていない
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const cacheRef = useRef(new Map<string, CachedPeriod>())
  // 期間を素早く切り替えたとき、古い期間の応答で上書きしない
  const requestIdRef = useRef(0)
  const { startDate, endDate } = range
  const rangeKey = `${startDate}_${endDate}`

  useEffect(() => {
    if (!isAuthenticated || !token) return
    const requestId = ++requestIdRef.current

    const cached = cacheRef.current.get(rangeKey)
    if (cached) {
      setTransactions(cached.transactions)
      setHasMore(cached.hasMore)
      setIsLoading(false)
      return
    }

    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        const data = await api.transactions.list(token, { startDate, endDate })
        if (requestId !== requestIdRef.current || !data) return
        const fetched = { transactions: data.transactions.map(mapApiTransaction), hasMore: data.has_more === true }
        cacheRef.current.set(rangeKey, fetched)
        setTransactions(fetched.transactions)
        setHasMore(fetched.hasMore)
      } catch (err) {
        if (requestId !== requestIdRef.current) return
        console.error("取引データ取得エラー:", err)
        toast.error("取引データを読み込めませんでした", {
          description: err instanceof Error ? err.message : "時間をおいて再度お試しください",
        })
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false)
      }
    }

    void fetchTransactions()
  }, [isAuthenticated, token, rangeKey, startDate, endDate])

  const fetchMonthlySummary = useCallback(async () => {
    if (!token) return
    try {
      const data = await api.transactions.monthlySummary(token, MONTHLY_SUMMARY_MONTHS)
      if (data) setMonthlySummary(data.map(mapApiMonthlySummary))
    } catch (err) {
      // 月次推移と気分が出ないだけなので、トーストは出さない
      console.error("月ごとの収支の取得エラー:", err)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) void fetchMonthlySummary()
  }, [isAuthenticated, token, fetchMonthlySummary])

  // 登録・更新・削除のあと。表示中の一覧はその場で直し、キャッシュは捨てて次に開いたときに取り直させる
  // （日付を変えて別の期間へ移った取引など、どの期間に影響したかを追わずに済ませる）。月ごとの集計も取り直す
  const afterMutation = useCallback((update: (prev: Transaction[]) => Transaction[]) => {
    cacheRef.current.clear()
    setTransactions(update)
    void fetchMonthlySummary()
  }, [fetchMonthlySummary])

  /** 登録に成功したら新たに解除された実績を返す。失敗はトーストで知らせて null */
  const addTransaction = useCallback(
    async (params: TransactionParams): Promise<NewlyUnlockedAchievement[] | null> => {
      if (!token) return null
      try {
        const result = await api.transactions.create(token, params)
        if (!result) return []
        const created = mapApiTransaction(result.transaction)
        afterMutation((prev) => [...prev, created])
        return result.newly_unlocked_achievements.map(mapApiNewlyUnlockedAchievement)
      } catch (err) {
        console.error("取引登録エラー:", err)
        // 失敗を画面に出さないと、ユーザーには何も起きていないように見える（issue #392）
        toast.error("取引を登録できませんでした", {
          description: err instanceof Error ? err.message : "時間をおいて再度お試しください",
        })
        return null
      }
    },
    [token, afterMutation]
  )

  /** 更新に成功したら新たに解除された実績を返す。失敗はトーストで知らせて null */
  const updateTransaction = useCallback(
    async (id: string, params: TransactionParams): Promise<NewlyUnlockedAchievement[] | null> => {
      if (!token) return null
      try {
        const result = await api.transactions.update(token, id, params)
        // PATCH は常に本文を返す。空なら画面に反映できないので失敗として扱う
        if (!result) throw new Error("更新後の取引を受け取れませんでした")
        const updated = mapApiTransaction(result.transaction)
        afterMutation((prev) => prev.map((t) => (t.id === id ? updated : t)))
        return result.newly_unlocked_achievements.map(mapApiNewlyUnlockedAchievement)
      } catch (err) {
        console.error("取引更新エラー:", err)
        toast.error("取引を更新できませんでした", {
          description: err instanceof Error ? err.message : "時間をおいて再度お試しください",
        })
        return null
      }
    },
    [token, afterMutation]
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!token) return
      try {
        await api.transactions.delete(token, id)
        afterMutation((prev) => prev.filter((t) => t.id !== id))
      } catch (err) {
        console.error("取引削除エラー:", err)
        toast.error("取引を削除できませんでした", {
          description: err instanceof Error ? err.message : "時間をおいて再度お試しください",
        })
      }
    },
    [token, afterMutation]
  )

  return { transactions, hasMore, isLoading, monthlySummary, addTransaction, updateTransaction, deleteTransaction }
}
