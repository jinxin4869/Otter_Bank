"use client"

import React from "react"
import { format, parseISO } from "date-fns"
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

import type { MonthlySummary } from "@/types/transaction"

type MonthlyTrendProps = {
  // 直近の月ごとの収支（古い月から。サーバーの monthly_summary が取引の無い月も 0 で返す）
  data: MonthlySummary[]
}

function MonthlyTrend({ data }: MonthlyTrendProps) {
  const chartData = data.map((m) => ({
    month: format(parseISO(`${m.month}-01`), "M月", { locale: ja }), // x軸ラベル
    income: m.income,
    expense: m.expense,
    balance: m.income - m.expense,
  }))

  if (chartData.every((d) => d.income === 0 && d.expense === 0)) {
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
        data={chartData}
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
