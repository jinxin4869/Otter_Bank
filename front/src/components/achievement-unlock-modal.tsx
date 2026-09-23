"use client"

import { useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NewlyUnlockedAchievement } from "@/types/achievement"
import { TIER_CONFIG, TierIcon } from "@/lib/tier"
import { Trophy } from "lucide-react"

interface AchievementUnlockModalProps {
  achievement: NewlyUnlockedAchievement | null
  onClose: () => void
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
