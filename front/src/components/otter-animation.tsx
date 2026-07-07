"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

// カワウソの気分。excited は実績解除直後、sleeping は長期未ログイン時に使用する
export type OtterMood = "happy" | "neutral" | "sad" | "excited" | "sleeping"

type OtterAnimationProps = {
  mood: OtterMood
  customMessage?: string
}

// 各 mood のセリフ候補。表示時にランダムで1つ選ぶことで単調さを避ける
const MOOD_MESSAGES: Record<OtterMood, string[]> = {
  happy: [
    "お金が貯まってきたね！このまま頑張ろう！",
    "いい調子だよ！貯金が増えてきたね🦦",
    "順調そのもの！この調子でいこう！",
    "やったね、黒字だよ！えらいえらい！",
  ],
  neutral: [
    "収支のバランスが取れているよ。もう少し節約できるといいね！",
    "まずまずかな。無理なく続けていこう！",
    "悪くないバランスだね。この調子でいこう。",
    "今のところ安定してるよ。油断は禁物！",
  ],
  sad: [
    "支出が多いみたい...節約を心がけよう。",
    "ちょっと使いすぎかも？一緒に見直そう。",
    "うーん、今月は赤字だね...次は頑張ろう。",
    "お財布がさみしそう...無駄遣いに気をつけて。",
  ],
  excited: [
    "やったー！実績解除だよ！すごいすごい！🎉",
    "おめでとう！新しいバッジをゲットしたね！",
    "うわーい！また一つ達成したね！最高！",
    "きみは本当にすごいよ！どんどんいこう！",
  ],
  sleeping: [
    "すぴー...zzz",
    "ふぁ...おかえり。ちょっとうたた寝してたよ...",
    "んん...久しぶりだね。会いたかったよ。",
    "zzz...あ、起きた！また一緒に頑張ろう！",
  ],
}

export default function OtterAnimation({ mood, customMessage }: OtterAnimationProps) {
  const [message, setMessage] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (customMessage) {
      setMessage(customMessage)
    } else {
      const pool = MOOD_MESSAGES[mood]
      setMessage(pool[Math.floor(Math.random() * pool.length)])
    }

    setIsAnimating(true)
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [mood, customMessage])

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className={cn(
          "relative w-full h-32 mb-2 transition-all duration-500",
          isAnimating && (mood === "happy" || mood === "sad") && "animate-pulse",
          isAnimating && mood === "excited" && "animate-bounce",
          // sleeping はアニメーションなし（静止させて就寝感を演出する）
        )}
      >
        <Image
          src={`/placeholder.svg?height=128&width=128&text=Otter+${mood}`}
          alt={`Otter feeling ${mood}`}
          fill
          className={cn("object-contain transition-all duration-300", isAnimating && "scale-110")}
        />
      </div>
      <div
        className={cn(
          "bg-primary/10 p-2 rounded-lg w-full text-center text-sm",
          mood === "happy" && "bg-green-100 dark:bg-green-900/20",
          mood === "neutral" && "bg-blue-100 dark:bg-blue-900/20",
          mood === "sad" && "bg-amber-100 dark:bg-amber-900/20",
          mood === "excited" && "bg-purple-100 dark:bg-purple-900/20",
          mood === "sleeping" && "bg-slate-100 dark:bg-slate-800/40",
        )}
      >
        <p className="text-center">{message}</p>
      </div>
    </div>
  )
}
