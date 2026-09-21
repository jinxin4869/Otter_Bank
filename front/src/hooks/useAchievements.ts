import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import {
  mapApiAchievement,
  mapApiAchievementSummary,
} from '@/types/achievement'
import type { Achievement, AchievementCategory, AchievementSummary } from '@/types/achievement'

type UseAchievementsReturn = {
  achievements: Achievement[]
  filteredAchievements: Achievement[]
  achievementSummary: AchievementSummary | null
  activeTab: string
  isLoading: boolean
  error: string | null
  filterAchievements: (category: string) => void
  // silent: true ではローディング表示とタブをリセットせず、実績とサマリーだけ更新する（絞り込みは保たれる）
  refetch: (options?: { silent?: boolean }) => Promise<void>
}

export function useAchievements(): UseAchievementsReturn {
  const { token, isAuthenticated } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [achievementSummary, setAchievementSummary] = useState<AchievementSummary | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // 連続リクエストで古いレスポンスが新しいものを上書きしないよう、最新のリクエストだけ反映する
  const latestRequestId = useRef(0)

  const fetchAchievements = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!isAuthenticated || !token) return

      const silent = options?.silent === true
      const requestId = ++latestRequestId.current
      if (!silent) {
        setIsLoading(true)
        setError(null)
      }
      try {
        const data = await api.achievements.list(token)
        if (requestId !== latestRequestId.current) return
        if (data) {
          const list = (data.achievements ?? []).map(mapApiAchievement)
          setAchievements(list)
          setAchievementSummary(data.summary ? mapApiAchievementSummary(data.summary) : null)
          if (!silent) {
            setActiveTab('all')
          }
        }
      } catch (err) {
        console.error('実績データの取得エラー:', err)
        // silent 時は表示中のデータを保つため、エラー状態にはしない（ステージ表示は次回取得で追いつく）
        if (!silent && requestId === latestRequestId.current) {
          setError(err instanceof Error ? err.message : '実績データの取得に失敗しました')
        }
      } finally {
        if (!silent && requestId === latestRequestId.current) setIsLoading(false)
      }
    },
    [isAuthenticated, token]
  )

  useEffect(() => {
    void fetchAchievements()
  }, [fetchAchievements])

  // 絞り込み結果は実績とタブから導出する（silent 更新後も選択中のタブに最新の内容が反映される）
  const filteredAchievements = useMemo(() => {
    if (activeTab === 'history') return []
    if (activeTab === 'all') return achievements
    return achievements.filter((ach) => ach.category === (activeTab as AchievementCategory))
  }, [achievements, activeTab])

  const filterAchievements = useCallback((category: string) => setActiveTab(category), [])

  return {
    achievements,
    filteredAchievements,
    achievementSummary,
    activeTab,
    isLoading,
    error,
    filterAchievements,
    refetch: fetchAchievements,
  }
}
