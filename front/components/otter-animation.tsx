"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type OtterAnimationProps = {
  mood: "happy" | "neutral" | "sad"
}

export default function OtterAnimation({ mood }: OtterAnimationProps) {
  const [message, setMessage] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Set message based on mood
    switch (mood) {
      case "happy":
        setMessage("お金が貯まってきたね！このまま頑張ろう！")
        break
      case "neutral":
        setMessage("収支のバランスが取れているよ。もう少し節約できるといいね！")
        break
      case "sad":
        setMessage("支出が多いみたい...節約を心がけよう。")
        break
    }

    // Trigger animation when mood changes
    setIsAnimating(true)
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [mood])

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className={cn(
          "relative w-full h-32 mb-2 transition-all duration-500",
          isAnimating && mood === "happy" && "animate-pulse",
          isAnimating && mood === "sad" && "animate-pulse",
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
        )}
      >
        <p className="text-center">{message}</p>
      </div>
    </div>
  )
}

