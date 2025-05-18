"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
}

type ExpensePieChartProps = {
  transactions: Transaction[]
}

const EXPENSE_CATEGORIES = [
  { value: "food", label: "食費", color: "#FF6384" },
  { value: "groceries", label: "日用品", color: "#36A2EB" },
  { value: "transportation", label: "交通費", color: "#FFCE56" },
  { value: "entertainment", label: "娯楽", color: "#4BC0C0" },
  { value: "utilities", label: "光熱費", color: "#9966FF" },
  { value: "rent", label: "家賃", color: "#FF9F40" },
  { value: "medical", label: "医療費", color: "#C9CBCF" },
  { value: "education", label: "教育費", color: "#7FD8BE" },
  { value: "shopping", label: "買い物", color: "#A78BFA" },
  { value: "other", label: "その他", color: "#8B8B8B" },
]

export default function ExpensePieChart({ transactions }: ExpensePieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Filter only expense transactions
    const expenses = transactions.filter((t) => t.type === "expense")
    if (expenses.length === 0) {
      // Draw "No data" message
      ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)
      ctx.font = "16px Arial"
      ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("データがありません", chartRef.current.width / 2, chartRef.current.height / 2)
      return
    }

    // Calculate totals by category
    const categoryTotals: Record<string, number> = {}
    expenses.forEach((expense) => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0
      }
      categoryTotals[expense.category] += expense.amount
    })

    // Prepare data for pie chart
    const categories = Object.keys(categoryTotals)
    const data = categories.map((category) => categoryTotals[category])
    const totalExpense = data.reduce((sum, amount) => sum + amount, 0)

    // Clear canvas
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

    // Draw pie chart
    const centerX = chartRef.current.width / 2
    const centerY = chartRef.current.height / 2
    const radius = Math.min(centerX, centerY) - 60

    let startAngle = 0
    categories.forEach((category, index) => {
      const categoryInfo = EXPENSE_CATEGORIES.find((c) => c.value === category) || {
        value: category,
        label: category,
        color: `hsl(${index * 30}, 70%, 50%)`,
      }

      const sliceAngle = (categoryTotals[category] / totalExpense) * 2 * Math.PI
      const endAngle = startAngle + sliceAngle

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = categoryInfo.color
      ctx.fill()

      // Draw label line and text if slice is big enough
      if (sliceAngle > 0.2) {
        const midAngle = startAngle + sliceAngle / 2
        const labelRadius = radius * 1.3 // ラベルの位置を円グラフからさらに離す
        const labelX = centerX + Math.cos(midAngle) * labelRadius
        const labelY = centerY + Math.sin(midAngle) * labelRadius

        ctx.beginPath()
        ctx.moveTo(centerX + Math.cos(midAngle) * radius, centerY + Math.sin(midAngle) * radius)
        ctx.lineTo(labelX, labelY)
        ctx.strokeStyle = theme === "dark" ? "#ffffff" : "#000000"
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.font = "12px Arial"
        ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
        ctx.textAlign = labelX > centerX ? "left" : "right"
        ctx.textBaseline = "middle"
        ctx.fillText(
          `${categoryInfo.label} (${Math.round((categoryTotals[category] / totalExpense) * 100)}%)`,
          labelX + (labelX > centerX ? 10 : -10), // テキストの位置も調整
          labelY,
        )
      }

      startAngle = endAngle
    })

    // Draw center circle (donut hole)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI)
    ctx.fillStyle = theme === "dark" ? "#1e1e1e" : "#ffffff"
    ctx.fill()

    // Draw total in center
    ctx.font = "bold 16px Arial"
    ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${totalExpense.toLocaleString()} 円`, centerX, centerY)

    // Draw legend
    const legendX = 10
    let legendY = chartRef.current.height - 10
    const legendSpacing = 20
    const legendSize = 15

    // Draw from bottom to top to avoid overlap with pie chart
    ;[...categories].reverse().forEach((category, index) => {
      const categoryInfo = EXPENSE_CATEGORIES.find((c) => c.value === category) || {
        value: category,
        label: category,
        color: `hsl(${index * 30}, 70%, 50%)`,
      }

      ctx.fillStyle = categoryInfo.color
      ctx.fillRect(legendX, legendY - legendSize, legendSize, legendSize)

      ctx.font = "12px Arial"
      ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(
        `${categoryInfo.label} (${Math.round((categoryTotals[category] / totalExpense) * 100)}%)`,
        legendX + legendSize + 5,
        legendY - legendSize / 2,
      )

      legendY -= legendSpacing
    })
  }, [transactions, theme])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={chartRef} width={500} height={300} className="max-w-full max-h-full"></canvas>
    </div>
  )
}

