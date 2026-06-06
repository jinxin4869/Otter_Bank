"use client"

import { useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AchievementTier, ApiNewlyUnlockedAchievement } from "@/types/achievement"
import { Trophy, Star, Gem } from "lucide-react"

interface AchievementUnlockModalProps {
  achievement: ApiNewlyUnlockedAchievement | null
  onClose: () => void
}

const TIER_CONFIG: Record<AchievementTier, { label: string; bg: string; text: string; border: string; ring: string }> = {
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

function TierIcon({ tier }: { tier: AchievementTier }) {
  if (tier === "platinum") return <Gem className="h-12 w-12" />
  if (tier === "gold") return <Trophy className="h-12 w-12" />
  return <Star className="h-12 w-12" />
}

export function AchievementUnlockModal({ achievement, onClose }: AchievementUnlockModalProps) {
  const tier = achievement?.tier ?? "bronze"
  const config = TIER_CONFIG[tier]

  useEffect(() => {
    if (!achievement) return
    const timer = setTimeout(onClose, 6000)
    return () => clearTimeout(timer)
  }, [achievement, onClose])

  return (
    <Dialog open={!!achievement} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-sm text-center p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div
          className={cn(
            "rounded-2xl border-2 p-8 space-y-4",
            "animate-in fade-in zoom-in-95 duration-300",
            config.bg,
            config.border,
          )}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            実績解除！
          </p>

          <div
            className={cn(
              "mx-auto w-24 h-24 rounded-full flex items-center justify-center",
              "ring-4",
              config.ring,
              config.bg,
              config.text,
            )}
          >
            <TierIcon tier={tier} />
          </div>

          <div className="space-y-1">
            <h2 className={cn("text-2xl font-bold", config.text)}>{achievement?.title}</h2>
            <p className="text-sm text-muted-foreground">{achievement?.description}</p>
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              config.text,
              "border",
              config.border,
            )}
          >
            <Trophy className="h-3 w-3" />
            {config.label}
          </div>

          {achievement?.reward && (
            <p className="text-sm text-muted-foreground">
              獲得報酬: <span className="font-medium">{achievement.reward}</span>
            </p>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={cn("w-full mt-2", config.text)}
          >
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
