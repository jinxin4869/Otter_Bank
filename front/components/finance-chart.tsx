"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

type FinanceData = {
  amount: number
  type: "income" | "expense"
  date: string
  category?: string
}

type FinanceChartProps = {
  finances: FinanceData[]
}

export default function FinanceChart({ finances }: FinanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!chartRef.current || finances.length === 0) return

    // This would normally use Chart.js, but for this demo we'll create a simple canvas chart
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

    // Calculate totals
    const income = finances.filter((f) => f.type === "income").reduce((sum, f) => sum + f.amount, 0)

    const expense = finances.filter((f) => f.type === "expense").reduce((sum, f) => sum + f.amount, 0)

    // Set colors based on theme
    const incomeColor = "#4CAF50"
    const expenseColor = "#FF6347"
    const textColor = theme === "dark" ? "#ffffff" : "#000000"

    // Draw chart
    const maxValue = Math.max(income, expense)
    const barWidth = 80
    const barSpacing = 40
    const barMaxHeight = 200
    const startX = chartRef.current.width / 2 - barWidth - barSpacing / 2

    // Income bar
    const incomeHeight = (income / maxValue) * barMaxHeight
    ctx.fillStyle = incomeColor
    ctx.fillRect(startX, chartRef.current.height - 50 - incomeHeight, barWidth, incomeHeight)

    // Expense bar
    const expenseHeight = (expense / maxValue) * barMaxHeight
    ctx.fillStyle = expenseColor
    ctx.fillRect(startX + barWidth + barSpacing, chartRef.current.height - 50 - expenseHeight, barWidth, expenseHeight)

    // Labels
    ctx.fillStyle = textColor
    ctx.font = "14px Arial"
    ctx.textAlign = "center"

    // Income label
    ctx.fillText("収入", startX + barWidth / 2, chartRef.current.height - 30)
    ctx.fillText(`${income.toLocaleString()} 円`, startX + barWidth / 2, chartRef.current.height - 10)

    // Expense label
    ctx.fillText("支出", startX + barWidth + barSpacing + barWidth / 2, chartRef.current.height - 30)
    ctx.fillText(
      `${expense.toLocaleString()} 円`,
      startX + barWidth + barSpacing + barWidth / 2,
      chartRef.current.height - 10,
    )
  }, [finances, theme])

  return (
    <div className="flex justify-center">
      <canvas ref={chartRef} width={400} height={300} className="max-w-full"></canvas>
    </div>
  )
}

