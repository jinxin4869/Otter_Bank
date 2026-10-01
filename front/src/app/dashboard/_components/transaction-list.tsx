"use client"

import { format, parseISO } from "date-fns"
import { HelpCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { findCategory, getCategoryLabel } from "@/lib/transaction-categories"
import type { Transaction } from "@/types/transaction"

type TransactionListProps = {
  transactions: Transaction[]
  isLoading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

const CategoryIcon = ({ transaction }: { transaction: Transaction }) => {
  const Icon = findCategory(transaction.category, transaction.type)?.icon ?? HelpCircle
  return <Icon className="h-4 w-4 text-foreground" />
}

export default function TransactionList({ transactions, isLoading, onEdit, onDelete }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return <p className="text-center text-muted-foreground py-4">この期間の取引はありません</p>
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
      {transactions.map((transaction) => {
        // 行ごとに同じ「編集」「削除」が並ぶので、読み上げで区別できるよう対象を名前に含める
        const rowLabel = `${format(parseISO(transaction.date), "M月d日")}の${getCategoryLabel(transaction.category, transaction.type)}`
        return (
        <div
          key={transaction.id}
          className="flex justify-between items-center p-3 border rounded hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                transaction.type === "income" ? "bg-income-bg text-income" : "bg-expense-bg text-expense",
              )}
            >
              <CategoryIcon transaction={transaction} />
            </div>
            <div>
              <div className="font-medium">{getCategoryLabel(transaction.category, transaction.type)}</div>
              {transaction.description && (
                <div className="text-sm text-muted-foreground">{transaction.description}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className={cn("font-medium", transaction.type === "income" ? "text-income" : "text-expense")}>
                {transaction.type === "income" ? "+" : "-"}
                {transaction.amount.toLocaleString()} 円
              </div>
              <div className="text-sm text-muted-foreground">{format(parseISO(transaction.date), "yyyy/MM/dd")}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-muted-foreground"
              aria-label={`${rowLabel}を編集`}
              onClick={() => onEdit(transaction)}
            >
              編集
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`${rowLabel}を削除`}
                >
                  削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>取引を削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>この操作は取り消せません。取引履歴から完全に削除されます。</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(transaction.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        )
      })}
    </div>
  )
}
