import type { CSSProperties, ReactNode } from "react"
import type { AchievementTier } from "@/types/achievement"
import styles from "./badge-effect.module.css"

type EffectTier = Extract<AchievementTier, "gold" | "platinum">

// 星の位置（バッジに対する %）: [left, top, 幅, 開始の遅れ(秒)]
const SPARKS: Record<EffectTier, [number, number, number, number][]> = {
  gold: [
    [14, 10, 13, 0],
    [82, 18, 10, 0.9],
    [78, 66, 12, 1.7],
  ],
  platinum: [
    [10, 8, 13, 0],
    [86, 12, 11, 0.6],
    [92, 52, 9, 1.3],
    [6, 58, 10, 1.9],
    [74, 74, 12, 2.4],
  ],
}

type BadgeEffectProps = {
  tier: AchievementTier
  unlocked: boolean
  children: ReactNode
}

// gold / platinum の獲得済みバッジにだけ、光の帯・星・（platinum は後光）を重ねる
export default function BadgeEffect({ tier, unlocked, children }: BadgeEffectProps) {
  if (!unlocked || (tier !== "gold" && tier !== "platinum")) return <>{children}</>

  return (
    <div className={styles.root} data-tier={tier}>
      {children}
      <span className={styles.shine} aria-hidden="true" />
      {SPARKS[tier].map(([left, top, width, delay]) => {
        const style: CSSProperties = {
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          animationDelay: `${delay}s`,
        }
        return <span key={`${left}-${top}`} className={styles.spark} style={style} aria-hidden="true" />
      })}
    </div>
  )
}
