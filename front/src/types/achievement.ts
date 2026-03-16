export type AchievementCategory = 'savings' | 'streak' | 'expense' | 'special'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

// ========== API 型（スネークケース） ==========

export interface ApiAchievement {
  id: number
  original_achievement_id: string
  title: string
  description: string
  category: AchievementCategory
  unlocked: boolean
  progress: number
  progress_percentage: number
  progress_target: number
  image_url: string | null
  reward: string
  tier: AchievementTier
  created_at: string
  updated_at: string
  unlocked_at: string | null
}

export interface ApiAchievementSummary {
  total_achievements: number
  unlocked_achievements: number
  progress_by_category: {
    [key in AchievementCategory]?: {
      total: number
      unlocked: number
      progress_percentage: number
    }
  }
}

export interface AchievementResponse {
  achievements: ApiAchievement[]
  summary: ApiAchievementSummary
}

// ========== 内部型（キャメルケース） ==========

export interface Achievement {
  id: number
  originalAchievementId: string
  title: string
  description: string
  category: AchievementCategory
  unlocked: boolean
  progress: number
  progressPercentage: number
  progressTarget: number
  imageUrl: string | null
  reward: string
  tier: AchievementTier
  createdAt: string
  updatedAt: string
  unlockedAt: string | null
}

export interface AchievementSummary {
  totalAchievements: number
  unlockedAchievements: number
  progressByCategory: {
    [key in AchievementCategory]?: {
      total: number
      unlocked: number
      progressPercentage: number
    }
  }
}

// ========== マッピング関数 ==========

export function mapApiAchievement(a: ApiAchievement): Achievement {
  return {
    id: a.id,
    originalAchievementId: a.original_achievement_id,
    title: a.title,
    description: a.description,
    category: a.category,
    unlocked: a.unlocked,
    progress: a.progress,
    progressPercentage: a.progress_percentage,
    progressTarget: a.progress_target,
    imageUrl: a.image_url,
    reward: a.reward,
    tier: a.tier,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    unlockedAt: a.unlocked_at,
  }
}

export function mapApiAchievementSummary(s: ApiAchievementSummary): AchievementSummary {
  const progressByCategory = Object.fromEntries(
    Object.entries(s.progress_by_category).map(([key, val]) => [
      key,
      val
        ? { total: val.total, unlocked: val.unlocked, progressPercentage: val.progress_percentage }
        : undefined,
    ])
  ) as AchievementSummary['progressByCategory']

  return {
    totalAchievements: s.total_achievements,
    unlockedAchievements: s.unlocked_achievements,
    progressByCategory,
  }
}
