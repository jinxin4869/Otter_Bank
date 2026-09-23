import { Trophy, Star, Gem } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AchievementTier } from "@/types/achievement"

// 実績のティア（難易度）ごとの表示ラベルと配色。実績解除モーダルとカワウソの成長ステージで共有する
export const TIER_CONFIG: Record<AchievementTier, { label: string; bg: string; text: string; border: string; ring: string }> = {
  bronze: {
    label: "ブロンズ",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-400",
    ring: "ring-amber-300",
  },
  silver: {
    label: "シルバー",
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-400",
    ring: "ring-slate-300",
  },
  gold: {
    label: "ゴールド",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-400",
    ring: "ring-yellow-300",
  },
  platinum: {
    label: "プラチナ",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-400",
    ring: "ring-purple-300",
  },
}

export function TierIcon({ tier, className }: { tier: AchievementTier; className?: string }) {
  const iconClassName = cn("h-12 w-12", className)
  if (tier === "platinum") return <Gem className={iconClassName} aria-hidden="true" />
  if (tier === "gold") return <Trophy className={iconClassName} aria-hidden="true" />
  return <Star className={iconClassName} aria-hidden="true" />
}
