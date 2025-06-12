export type AchievementCategory = 'savings' | 'streak' | 'milestone' | 'special';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: number;
  original_achievement_id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  unlocked: boolean;
  progress: number;
  progress_percentage: number;
  progress_target: number;
  image_url: string;
  reward: string;
  tier: AchievementTier;
  created_at: string;
  updated_at: string;
  unlocked_at: string | null;
}

export interface AchievementSummary {
  total_achievements: number;
  unlocked_achievements: number;
  progress_by_category: {
    [key in AchievementCategory]?: {
      total: number;
      unlocked: number;
      progress_percentage: number;
    };
  };
}

export interface AchievementResponse {
  achievements: Achievement[];
  summary: AchievementSummary;
}

export interface AchievementDetailResponse {
  achievement: Achievement;
  related_achievements: {
    id: number;
    title: string;
    progress_percentage: number;
    unlocked: boolean;
  }[];
} 