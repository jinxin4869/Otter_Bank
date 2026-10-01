"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { TIER_CONFIG, TierIcon } from "@/lib/tier"
import type { AchievementTier } from "@/types/achievement"
import BadgeEffect from "./badge-effect"

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

  // バッジは円形メダルの正方形画像。エフェクトの位置もバッジ基準の % なので、正方形の枠に収めて中央に置く
  return (
    <div className="relative mx-auto aspect-square h-full">
      <BadgeEffect tier={tier} unlocked={unlocked}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 60vw, (max-width: 1280px) 30vw, 15vw"
          style={{ objectFit: "contain" }}
          className={lockedClass || undefined}
          onError={() => setFailed(true)}
        />
      </BadgeEffect>
    </div>
  )
}
