"use client"

import type React from "react"
import { useState } from "react"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon, PlusCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { categoriesFor } from "@/lib/transaction-categories"
import type { TransactionParams } from "@/lib/api"
import type { Transaction } from "@/types/transaction"

type TransactionFormProps = {
  // 登録・更新に成功したら true を返す。新規登録では成功時だけフォームを初期化する
  onSubmit: (params: TransactionParams) => Promise<boolean>
  // 渡すと編集モード（初期値を入れ、送信後も入力を残す）
  initialTransaction?: Transaction
}

export default function TransactionForm({ onSubmit, initialTransaction }: TransactionFormProps) {
  const isEditing = initialTransaction !== undefined
  const [amount, setAmount] = useState(initialTransaction ? String(initialTransaction.amount) : "")
  const [amountError, setAmountError] = useState<string | null>(null)
  const [type, setType] = useState<"income" | "expense">(initialTransaction?.type ?? "expense")
  const [category, setCategory] = useState(initialTransaction?.category ?? "")
  const [description, setDescription] = useState(initialTransaction?.description ?? "")
  // "yyyy-MM-dd" を new Date() に渡すと UTC として解釈され日付がずれうるため、parseISO でローカル日付にする
  const [date, setDate] = useState<Date>(() =>
    initialTransaction?.date ? parseISO(initialTransaction.date) : new Date()
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  // 編集ダイアログは新規フォームと同じ画面に出るので、label と input を結ぶ id が重複しないようにする
  const fieldId = (name: string) => (isEditing ? `edit-${name}` : name)

  const validateAmount = (value: string) => {
    if (!value) {
      setAmountError(null)
      return true
    }

    const numericValue = value.replace(/,/g, "")
    if (!/^\d+(\.\d{0,2})?$/.test(numericValue)) {
      setAmountError("数字を入力してください。例：1000")
      return false
    }

    setAmountError(null)
    return true
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    validateAmount(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category || !validateAmount(amount)) return

    setIsSubmitting(true)
    let ok = false
    try {
      ok = await onSubmit({
        amount: Number.parseFloat(amount.replace(/,/g, "")),
        transaction_type: type,
        category,
        description,
        date: format(date, "yyyy-MM-dd"),
      })
    } finally {
      setIsSubmitting(false)
    }
    if (!ok || isEditing) return

    setAmount("")
    setAmountError(null)
    setDescription("")
    setDate(new Date())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={fieldId("amount")}>金額</Label>
        <Input
          id={fieldId("amount")}
          type="text"
          placeholder="1000"
          value={amount}
          onChange={handleAmountChange}
          required
          className={amountError ? "border-destructive" : ""}
        />
        {amountError && <p className="text-sm text-destructive">{amountError}</p>}
      </div>

      <div className="space-y-2">
        <Label>タイプ</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            aria-pressed={type === "expense"}
            className={cn("flex-1", type === "expense" && "bg-expense hover:bg-expense/90 text-white")}
            onClick={() => {
              setType("expense")
              setCategory("")
            }}
          >
            支出
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            aria-pressed={type === "income"}
            className={cn("flex-1", type === "income" && "bg-income hover:bg-income/90 text-white")}
            onClick={() => {
              setType("income")
              setCategory("")
            }}
          >
            収入
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldId("category")}>カテゴリー</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger id={fieldId("category")} className="w-full">
            <SelectValue placeholder="カテゴリーを選択" />
          </SelectTrigger>
          <SelectContent position="item-aligned" align="start" side="bottom" sideOffset={5}>
            {categoriesFor(type).map((cat) => (
              <SelectItem
                key={cat.value}
                value={cat.value}
                className={cn("cursor-pointer", type === "income" ? "text-income" : "text-expense")}
              >
                <div className="flex items-center gap-2">
                  <cat.icon className="h-4 w-4" />
                  <span>{cat.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldId("description")}>詳細 (任意)</Label>
        <Input
          id={fieldId("description")}
          placeholder="取引の詳細"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>日付</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "yyyy年MM月dd日", { locale: ja })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" className="w-full" disabled={!!amountError || isSubmitting}>
        {isEditing ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
        {isEditing ? "保存" : "追加"}
      </Button>
    </form>
  )
}
