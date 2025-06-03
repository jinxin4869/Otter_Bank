"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Check, PlusCircle, Wallet, PieChart, Calendar, Trophy } from "lucide-react"
import Image from "next/image"

export function Tutorial() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)

  useEffect(() => {
    // Check if the user has seen the tutorial before
    const tutorialSeen = localStorage.getItem("tutorialSeen")

    if (!tutorialSeen) {
      // Show tutorial after a short delay
      const timer = setTimeout(() => {
        setOpen(true)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      setHasSeenTutorial(true)
    }
  }, [])

  const completeTutorial = () => {
    localStorage.setItem("tutorialSeen", "true")
    setHasSeenTutorial(true)
    setOpen(false)
  }

  const steps = [
    {
      title: "獭獭銀行へようこそ！",
      description: "このアプリでは、楽しく簡単にお金の管理ができます。カワウソと一緒に貯金の習慣を身につけましょう！",
      image: "/placeholder.svg?height=200&width=300&text=Welcome",
      icon: <Wallet className="h-6 w-6 text-primary" />,
    },
    {
      title: "収支を記録しよう",
      description: "日々の収入と支出を記録することで、お金の流れを把握できます。右側のフォームから簡単に追加できます。",
      image: "/placeholder.svg?height=200&width=300&text=Record+Transactions",
      icon: <PlusCircle className="h-6 w-6 text-primary" />,
    },
    {
      title: "分析を活用しよう",
      description: "支出のカテゴリー分析や月次推移のグラフで、あなたの家計の傾向を視覚的に確認できます。",
      image: "/placeholder.svg?height=200&width=300&text=Analysis",
      icon: <PieChart className="h-6 w-6 text-primary" />,
    },
    {
      title: "実績を獲得しよう",
      description: "貯金や継続利用などの目標を達成すると、特別な実績が解放されます。図鑑ページで確認してみましょう！",
      image: "/placeholder.svg?height=200&width=300&text=Achievements",
      icon: <Trophy className="h-6 w-6 text-primary" />,
    },
    {
      title: "継続が大切です",
      description: "毎日の記録が習慣になると、お金の管理が上手になります。カワウソも喜びますよ！",
      image: "/placeholder.svg?height=200&width=300&text=Daily+Use",
      icon: <Calendar className="h-6 w-6 text-primary" />,
    },
  ]

  const currentStepData = steps[currentStep]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTutorial()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Skip rendering if user has seen tutorial
  if (hasSeenTutorial) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {currentStepData.icon}
            <DialogTitle>{currentStepData.title}</DialogTitle>
          </div>
          <DialogDescription>{currentStepData.description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="relative w-full h-[200px] mb-4 rounded-lg overflow-hidden">
            <Image
              src={steps[currentStep].image}
              alt={steps[currentStep].title}
              width={400}
              height={192}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          </div>

          <div className="flex justify-center mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${index === currentStep ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => completeTutorial()} size="sm">
              スキップ
            </Button>
            {currentStep > 0 && (
              <Button variant="outline" onClick={prevStep} size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />
                前へ
              </Button>
            )}
          </div>
          <Button onClick={nextStep}>
            {currentStep < steps.length - 1 ? (
              <>
                次へ
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                始める
                <Check className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

