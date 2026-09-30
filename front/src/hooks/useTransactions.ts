import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { api, type TransactionParams } from "@/lib/api"
import { type Transaction, mapApiTransaction } from "@/types/transaction"
import { mapApiNewlyUnlockedAchievement, type NewlyUnlockedAchievement } from "@/types/achievement"

// 取引の取得・登録・更新・削除。表示のための絞り込みや集計は lib/transaction-period.ts に置く
export function useTransactions(token: string | null, isAuthenticated: boolean) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        const data = await api.transactions.list(token)
        if (data) {
          setTransactions(data.transactions.map(mapApiTransaction))
        }
      } catch (err) {
        console.error("取引データ取得エラー:", err)
        toast.error("取引データを読み込めませんでした", {
          description: err instanceof Error ? err.message : "時間をおいて再度お試しください",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [isAuthenticated, token])

  /** 登録に成功したら新たに解除された実績を返す。失敗はトーストで知らせて null */
  const addTransaction = useCallback(
    async (params: TransactionParams): Promise<NewlyUnlockedAchievement[] | null> => {
      if (!token) return null
      try {
        const result = await api.transactions.create(token, params)
        if (!result) return []
        setTransactions((prev) => [...prev, mapApiTransaction(result.transaction)])
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
    [token]
  )

  /** 更新に成功したら新たに解除された実績を返す。失敗はトーストで知らせて null */
  const updateTransaction = useCallback(
    async (id: string, params: TransactionParams): Promise<NewlyUnlockedAchievement[] | null> => {
      if (!token) return null
      try {
        const result = await api.transactions.update(token, id, params)
        if (!result) return []
        const updated = mapApiTransaction(result.transaction)
        setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)))
        return result.newly_unlocked_achievements.map(mapApiNewlyUnlockedAchievement)
      } catch (err) {
        console.error("取引更新エラー:", err)
        toast.error("取引を更新できませんでした", {
          description: err instanceof Error ? err.message : "時間をおいて再度お試しください",
        })
        return null
      }
    },
    [token]
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!token) return
      try {
        await api.transactions.delete(token, id)
        setTransactions((prev) => prev.filter((t) => t.id !== id))
      } catch (err) {
        console.error("取引削除エラー:", err)
        toast.error("取引を削除できませんでした", {
          description: err instanceof Error ? err.message : "時間をおいて再度お試しください",
        })
      }
    },
    [token]
  )

  return { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction }
}
