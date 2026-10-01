import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { api, type TransactionParams } from "@/lib/api"
import { type Transaction, type MonthlySummary, mapApiTransaction, mapApiMonthlySummary } from "@/types/transaction"
import { mapApiNewlyUnlockedAchievement, type NewlyUnlockedAchievement } from "@/types/achievement"

export type PeriodRange = { startDate: string; endDate: string }

/** 期間全体の合計（件数上限で一覧が切られても、サーバーが期間全体で計算する） */
export type PeriodSummary = { income: number; expense: number; balance: number }

type CachedPeriod = { transactions: Transaction[]; hasMore: boolean; summary: PeriodSummary | null }

const MONTHLY_SUMMARY_MONTHS = 6

// 取引の取得・登録・更新・削除。全件ではなく表示中の期間（range）だけを取り、取得済みの期間はキャッシュする。
// 月次推移とカワウソの気分は期間をまたぐので、月ごとの集計（monthlySummary）を別に取る。
// 表示のための絞り込みや集計は lib/transaction-period.ts に置く
export function useTransactions(token: string | null, isAuthenticated: boolean, range: PeriodRange) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  // 期間内の取引がサーバーの件数上限を超え、一部しか受け取れていない
  const [hasMore, setHasMore] = useState(false)
  // サーバーが計算した表示中の期間の合計。取得中・変更直後は null（呼び出し元は一覧から計算する）
  const [summary, setSummary] = useState<PeriodSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const cacheRef = useRef(new Map<string, CachedPeriod>())
  // 期間の切り替えや変更の前に出した取得の応答で、新しい状態を上書きしない
  const requestIdRef = useRef(0)
  const summaryRequestIdRef = useRef(0)
  // 登録・更新・削除のあと、表示中の期間を取り直す合図（一覧はその場で直しているので読み込み表示は出さない）
  const [reloadTick, setReloadTick] = useState(0)
  const silentReloadRef = useRef(false)
  const { startDate, endDate } = range
  const rangeKey = `${startDate}_${endDate}`

  useEffect(() => {
    if (!isAuthenticated || !token) return
    const requestId = ++requestIdRef.current
    const silent = silentReloadRef.current
    silentReloadRef.current = false

    const cached = cacheRef.current.get(rangeKey)
    if (cached) {
      setTransactions(cached.transactions)
      setHasMore(cached.hasMore)
      setSummary(cached.summary)
      setIsLoading(false)
      return
    }

    const fetchTransactions = async () => {
      if (!silent) {
        setIsLoading(true)
        setHasMore(false)
        setSummary(null)
      }
      try {
        const data = await api.transactions.list(token, { startDate, endDate })
        if (requestId !== requestIdRef.current || !data) return
        const fetched: CachedPeriod = {
          transactions: data.transactions.map(mapApiTransaction),
          hasMore: data.has_more === true,
          summary: data.summary
            ? {
                income: Number(data.summary.total_income),
                expense: Number(data.summary.total_expense),
                balance: Number(data.summary.balance),
              }
            : null,
        }
        cacheRef.current.set(rangeKey, fetched)
        setTransactions(fetched.transactions)
        setHasMore(fetched.hasMore)
        setSummary(fetched.summary)
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
  }, [isAuthenticated, token, rangeKey, startDate, endDate, reloadTick])

  const fetchMonthlySummary = useCallback(async () => {
    if (!token) return
    const requestId = ++summaryRequestIdRef.current
    try {
      const data = await api.transactions.monthlySummary(token, MONTHLY_SUMMARY_MONTHS)
      if (data && requestId === summaryRequestIdRef.current) setMonthlySummary(data.map(mapApiMonthlySummary))
    } catch (err) {
      // 月次推移と気分が出ないだけなので、トーストは出さない
      console.error("月ごとの収支の取得エラー:", err)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) void fetchMonthlySummary()
  }, [isAuthenticated, token, fetchMonthlySummary])

  // 登録・更新・削除のあと。表示中の一覧はその場で直して、すぐ結果が見えるようにする。
  // そのうえでキャッシュを捨て（日付を移した取引などがどの期間に影響したかを追わずに済む）、
  // 変更前に出していた取得の応答は捨てて、表示中の期間と月ごとの集計を取り直す
  const afterMutation = useCallback((update: (prev: Transaction[]) => Transaction[]) => {
    cacheRef.current.clear()
    requestIdRef.current++
    setIsLoading(false)
    setTransactions(update)
    setSummary(null)
    silentReloadRef.current = true
    setReloadTick((n) => n + 1)
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

  return { transactions, hasMore, summary, isLoading, monthlySummary, addTransaction, updateTransaction, deleteTransaction }
}
