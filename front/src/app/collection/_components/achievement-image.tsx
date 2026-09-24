"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { TIER_CONFIG, TierIcon } from "@/lib/tier"
import type { AchievementTier } from "@/types/achievement"

type AchievementImageProps = {
  imageUrl: string | null
  title: string
  tier: AchievementTier
  unlocked: boolean
}

// 実績の画像。画像が無い・読み込めない（素材が未整備）ときは、ティア色のパネルとアイコンで表示する
export default function AchievementImage({ imageUrl, title, tier, unlocked }: AchievementImageProps) {
  const [failed, setFailed] = useState(false)
  const lockedClass = !unlocked && "opacity-60 grayscale"

  if (!imageUrl || failed) {
    const config = TIER_CONFIG[tier]
    return (
      <div
        role="img"
        aria-label={title}
        data-tier={tier}
        className={cn("flex h-full w-full items-center justify-center rounded-md", config.bg, config.text, lockedClass)}
      >
        <TierIcon tier={tier} className="h-12 w-12" />
      </div>
    )
  }

  return (
    <Image
      src={imageUrl}
      alt={title}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
      style={{ objectFit: "cover" }}
      className={cn("rounded-md", lockedClass)}
      onError={() => setFailed(true)}
    />
  )
}
