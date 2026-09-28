"use client"

import React from "react"
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

import type { Transaction } from "@/types/transaction"

type MonthlyTrendProps = {
  transactions: Transaction[]
}

function MonthlyTrend({ transactions }: MonthlyTrendProps) {
  const today = new Date()
  const lastSixMonthsData = Array.from({ length: 6 })
    .map((_, i) => {
      const targetMonthDate = subMonths(today, 5 - i) // 5ヶ月前から現在までの6ヶ月分
      const monthStart = startOfMonth(targetMonthDate)
      const monthEnd = endOfMonth(targetMonthDate)

      const monthTransactions = transactions.filter((t) => {
        const tDate = parseISO(t.date)
        return tDate >= monthStart && tDate <= monthEnd
      })

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        month: format(monthStart, "M月", { locale: ja }), // x軸ラベル
        monthkey: format(monthStart, "yyyy-MM"), // 月のキー
        income,
        expense,
        balance: income - expense,
      }
    })
    .sort((a, b) => a.monthkey.localeCompare(b.monthkey)) // 月の順にソート

  if (transactions.length === 0 || lastSixMonthsData.every(d => d.income === 0 && d.expense === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        表示できる取引データがありません
      </div>
    )
  }

  const yAxisTickFormatter = (value: number): string => {
    if (value === 0) {
      return `${value}` // 単位
    }
    return `${(value).toLocaleString()}` // 単位
  }

  const tooltipFormatter = (value: unknown, name: unknown) => {
    return [`${typeof value === 'number' ? value.toLocaleString() : String(value ?? '')} 円`, String(name ?? '')];
  }

  const legendFormatter = (value: string) => {
    if (value === "income") return "収入"
    if (value === "expense") return "支出"
    if (value === "balance") return "収支"
    return value
  }

  // デザイントークンの色（CSS 変数なのでライト/ダークの切替に自動で追従する）
  const incomeColor = "hsl(var(--income))"
  const expenseColor = "hsl(var(--expense))"
  const balanceColor = "hsl(var(--primary))"
  const gridColor = "hsl(var(--border))"
  const textColor = "hsl(var(--muted-foreground))"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={lastSixMonthsData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20
        }}
      >
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          stroke={textColor}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          stroke={textColor}
          tickFormatter={yAxisTickFormatter}
          tick={{ fontSize: 12 }}
          label={{
            value: "金額 (円)",
            angle: -90,
            position: "insideLeft",
            fill: textColor,
            fontSize: 12,
            dy: 40
          }}
        />
        <Tooltip
          formatter={tooltipFormatter}
          labelStyle={{ color: textColor, fontWeight: "bold" }}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            borderColor: "hsl(var(--border))",
            borderRadius: "0.5rem",
          }}
          cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
        />
        <Legend formatter={legendFormatter} wrapperStyle={{ paddingTop: "20px", color: textColor }} />
        <Bar dataKey="income" name="収入" fill={incomeColor} barSize={20} />
        <Bar dataKey="expense" name="支出" fill={expenseColor} barSize={20} />
        <Line type="monotone" dataKey="balance" name="収支" stroke={balanceColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
export default React.memo(MonthlyTrend)
