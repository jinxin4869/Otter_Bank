import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import type { Achievement, AchievementSummary } from "@/types/achievement"

type UseAchievementsReturn = {
  achievements: Achievement[]
  summary: AchievementSummary | null
  isLoading: boolean
  error: string | null
}

export const useAchievements = (): UseAchievementsReturn => {
  const { token, isAuthenticated } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [summary, setSummary] = useState<AchievementSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const fetchAchievements = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.achievements.list(token)
        if (data) {
          setAchievements(data.achievements || [])
          setSummary(data.summary || null)
        }
      } catch (err) {
        setError("実績データの取得に失敗しました。時間をおいて再度お試しください。")
        console.error("Error fetching achievements:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAchievements()
  }, [isAuthenticated, token])

  return { achievements, summary, isLoading, error }
}
