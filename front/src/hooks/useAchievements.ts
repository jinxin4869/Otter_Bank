import { useState, useEffect, useCallback } from 'react'
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
  refetch: () => Promise<void>
}

export function useAchievements(): UseAchievementsReturn {
  const { token, isAuthenticated } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([])
  const [achievementSummary, setAchievementSummary] = useState<AchievementSummary | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = useCallback(async () => {
    if (!isAuthenticated || !token) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await api.achievements.list(token)
      if (data) {
        const list = (data.achievements ?? []).map(mapApiAchievement)
        setAchievements(list)
        setFilteredAchievements(list)
        setAchievementSummary(data.summary ? mapApiAchievementSummary(data.summary) : null)
        setActiveTab('all')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '実績データの取得に失敗しました'
      setError(message)
      console.error('実績データの取得エラー:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const filterAchievements = useCallback(
    (category: string) => {
      setActiveTab(category)
      if (category === 'all') {
        setFilteredAchievements(achievements)
      } else {
        setFilteredAchievements(
          achievements.filter((ach) => ach.category === (category as AchievementCategory))
        )
      }
    },
    [achievements]
  )

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
