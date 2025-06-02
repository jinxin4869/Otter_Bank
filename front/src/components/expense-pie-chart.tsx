"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
}

interface ExpensePieChartProps {
  transactions: Transaction[];
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

const COLORS = EXPENSE_CATEGORIES.map(cat => cat.color); // カテゴリの色をそのまま使用

const getCategoryLabel = (categoryValue: string) => {
  const category = EXPENSE_CATEGORIES.find(c => c.value === categoryValue);
  return category ? category.label : categoryValue;
};

export default function ExpensePieChart({ transactions }: ExpensePieChartProps) {
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
    .map(item => ({ ...item, name: getCategoryLabel(item.name) }));

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
          label={({ name, percent, value }) => `${name} ${value.toLocaleString()}円 (${(percent * 100).toFixed(0)}%)`} // ラベル表示を調整
        >
          {expenseData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[EXPENSE_CATEGORIES.findIndex(cat => cat.label === entry.name) % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string, entry: any) => [`${value.toLocaleString()} 円`, entry.payload.name]} />
        <Legend formatter={(value) => value} />
      </PieChart>
    </ResponsiveContainer>
  );
}
