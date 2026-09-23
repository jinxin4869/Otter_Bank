export type AchievementCategory = 'savings' | 'streak' | 'expense' | 'special'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

// カワウソの成長ステージ（none は装備なし）。閾値はバックエンド（Achievement::GROWTH_STAGES）が持つ
export const OTTER_GROWTH_STAGES = ['none', 'bronze', 'silver', 'gold', 'platinum'] as const

export type OtterGrowthStage = (typeof OTTER_GROWTH_STAGES)[number]

// 取引登録・更新レスポンスに含まれる新規解除実績
export interface ApiNewlyUnlockedAchievement {
  id: number
  title: string
  description: string
  tier: AchievementTier
  category: AchievementCategory
  reward: string
  image_url: string | null
}

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

export interface ApiGrowthStage {
  stage: OtterGrowthStage
  next_stage: OtterGrowthStage | null
  achievements_to_next: number | null
  progress_percentage: number
}

export interface ApiAchievementSummary {
  total_achievements: number
  unlocked_achievements: number
  // 旧バックエンドのレスポンスには存在しないため optional
  growth_stage?: ApiGrowthStage
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

// 取引登録・更新で新たに解除された実績
export interface NewlyUnlockedAchievement {
  id: number
  title: string
  description: string
  tier: AchievementTier
  category: AchievementCategory
  reward: string
  imageUrl: string | null
}

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

export interface GrowthStage {
  stage: OtterGrowthStage
  nextStage: OtterGrowthStage | null
  achievementsToNext: number | null
  progressPercentage: number
}

export interface AchievementSummary {
  totalAchievements: number
  unlockedAchievements: number
  growthStage: GrowthStage
  progressByCategory: {
    [key in AchievementCategory]?: {
      total: number
      unlocked: number
      progressPercentage: number
    }
  }
}

// ========== マッピング関数 ==========

export function mapApiNewlyUnlockedAchievement(a: ApiNewlyUnlockedAchievement): NewlyUnlockedAchievement {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    tier: a.tier,
    category: a.category,
    reward: a.reward,
    imageUrl: a.image_url,
  }
}

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

const DEFAULT_GROWTH_STAGE: GrowthStage = {
  stage: 'none',
  nextStage: null,
  achievementsToNext: null,
  progressPercentage: 0,
}

function isOtterGrowthStage(v: unknown): v is OtterGrowthStage {
  return typeof v === 'string' && (OTTER_GROWTH_STAGES as readonly string[]).includes(v)
}

// 外部データ（API レスポンス）を検証して成長ステージへ変換する。不正・欠落時は none にフォールバックする
export function parseGrowthStage(v: unknown): GrowthStage {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return DEFAULT_GROWTH_STAGE
  const raw = v as Record<string, unknown>
  if (!isOtterGrowthStage(raw.stage)) return DEFAULT_GROWTH_STAGE

  return {
    stage: raw.stage,
    nextStage: isOtterGrowthStage(raw.next_stage) ? raw.next_stage : null,
    achievementsToNext: typeof raw.achievements_to_next === 'number' ? raw.achievements_to_next : null,
    progressPercentage: typeof raw.progress_percentage === 'number' ? raw.progress_percentage : 0,
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
    growthStage: parseGrowthStage(s.growth_stage),
    progressByCategory,
  }
}
