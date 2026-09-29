"use client"

import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import type { Transaction } from "@/types/transaction"
import { EXPENSE_CATEGORIES, getCategoryLabel } from "@/lib/transaction-categories"

interface ExpensePieChartProps {
  transactions: Transaction[];
}

const colorFor = (label: string) =>
  EXPENSE_CATEGORIES.find((c) => c.label === label)?.color ?? "#8B8B8B"

function ExpensePieChart({ transactions }: ExpensePieChartProps) {
  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const existingCategory = acc.find(item => item.name === transaction.category);
      if (existingCategory) {
        existingCategory.value += transaction.amount;
      } else {
        acc.push({ name: transaction.category, value: transaction.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .map(item => ({ ...item, name: getCategoryLabel(item.name, "expense") }));

  if (expenseData.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">支出データがありません</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={expenseData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80} // サイズは適宜調整
          fill="#8884d8" // デフォルトの塗りつぶし色 (Cellで上書きされる)
          dataKey="value"
          label={({ name, percent, value }) => `${name} ${value.toLocaleString()}円 (${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%)`} // ラベル表示を調整
        >
          {expenseData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colorFor(entry.name)} />
          ))}
        </Pie>
        <Tooltip formatter={(value, _name, entry) => [`${typeof value === 'number' ? value.toLocaleString() : String(value ?? '')} 円`, entry.payload.name]} />
        <Legend formatter={(value) => value} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default React.memo(ExpensePieChart)
