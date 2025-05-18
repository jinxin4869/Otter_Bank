"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth } from "date-fns"

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
}

type MonthlyTrendProps = {
  transactions: Transaction[]
}

export default function MonthlyTrend({ transactions }: MonthlyTrendProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!chartRef.current || transactions.length === 0) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

    // Get data for the last 6 months
    const today = new Date()
    const months: Date[] = []
    for (let i = 0; i < 6; i++) {
      months.unshift(subMonths(today, i))
    }

    const monthlyData = months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date)
        return isWithinInterval(tDate, { start: monthStart, end: monthEnd })
      })

      const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      return {
        month: format(month, "M月"),
        income,
        expense,
        balance: income - expense,
      }
    })

    // Find max value for scaling
    const allValues = monthlyData.flatMap((d) => [d.income, d.expense])
    const maxValue = Math.max(...allValues, 1)

    // Chart dimensions
    const chartWidth = chartRef.current.width
    const chartHeight = chartRef.current.height
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const graphWidth = chartWidth - padding.left - padding.right
    const graphHeight = chartHeight - padding.top - padding.bottom

    // Colors
    const incomeColor = "#4CAF50"
    const expenseColor = "#FF6347"
    const balanceColor = "#2196F3"
    const gridColor = theme === "dark" ? "#333333" : "#e0e0e0"
    const textColor = theme === "dark" ? "#ffffff" : "#000000"

    // Draw grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5

    // Horizontal grid lines
    const numGridLines = 5
    for (let i = 0; i <= numGridLines; i++) {
      const y = padding.top + (graphHeight * i) / numGridLines
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + graphWidth, y)
      ctx.stroke()

      // Y-axis labels - 単位を円に変更
      const value = maxValue - (maxValue * i) / numGridLines
      ctx.font = "10px Arial"
      ctx.fillStyle = textColor
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText(`${Math.round(value).toLocaleString()}円`, padding.left - 5, y)
    }

    // Draw bars
    const barWidth = graphWidth / monthlyData.length / 3
    const groupWidth = barWidth * 3
    const barSpacing = 2

    monthlyData.forEach((data, i) => {
      const x = padding.left + i * (groupWidth + barSpacing)

      // Income bar
      const incomeHeight = (data.income / maxValue) * graphHeight
      ctx.fillStyle = incomeColor
      ctx.fillRect(x, padding.top + graphHeight - incomeHeight, barWidth - barSpacing, incomeHeight)

      // Expense bar
      const expenseHeight = (data.expense / maxValue) * graphHeight
      ctx.fillStyle = expenseColor
      ctx.fillRect(x + barWidth, padding.top + graphHeight - expenseHeight, barWidth - barSpacing, expenseHeight)

      // Balance bar (can be negative)
      const balanceHeight = (Math.abs(data.balance) / maxValue) * graphHeight
      ctx.fillStyle = balanceColor
      if (data.balance >= 0) {
        ctx.fillRect(x + barWidth * 2, padding.top + graphHeight - balanceHeight, barWidth - barSpacing, balanceHeight)
      } else {
        ctx.fillRect(x + barWidth * 2, padding.top + graphHeight, barWidth - barSpacing, balanceHeight)
      }

      // X-axis labels
      ctx.font = "12px Arial"
      ctx.fillStyle = textColor
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(data.month, x + groupWidth / 2, padding.top + graphHeight + 5)
    })

    // Draw legend
    const legendX = padding.left
    const legendY = chartHeight - 10
    const legendSpacing = 80
    const legendSize = 10

    // Income legend
    ctx.fillStyle = incomeColor
    ctx.fillRect(legendX, legendY, legendSize, legendSize)
    ctx.font = "12px Arial"
    ctx.fillStyle = textColor
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText("収入", legendX + legendSize + 5, legendY + legendSize / 2)

    // Expense legend
    ctx.fillStyle = expenseColor
    ctx.fillRect(legendX + legendSpacing, legendY, legendSize, legendSize)
    ctx.fillStyle = textColor
    ctx.fillText("支出", legendX + legendSpacing + legendSize + 5, legendY + legendSize / 2)

    // Balance legend
    ctx.fillStyle = balanceColor
    ctx.fillRect(legendX + legendSpacing * 2, legendY, legendSize, legendSize)
    ctx.fillStyle = textColor
    ctx.fillText("収支", legendX + legendSpacing * 2 + legendSize + 5, legendY + legendSize / 2)
  }, [transactions, theme])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={chartRef} width={500} height={300} className="max-w-full max-h-full"></canvas>
    </div>
  )
}

