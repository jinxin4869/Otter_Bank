"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// 誤操作を防ぐため、確認欄にこの語を打ってもらう
export const DELETE_CONFIRMATION_WORD = "退会"

type DeleteAccountSectionProps = {
  // 成功したら true（呼び出し元の useAuth がトップへ移動させる）
  onDelete: () => Promise<boolean>
}

export default function DeleteAccountSection({ onDelete }: DeleteAccountSectionProps) {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (isDeleting) return
    setOpen(next)
    if (!next) setConfirmation("")
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    // 成功するとセッションが終わり、この画面ごと閉じてトップへ移るので、失敗時だけ状態を戻す
    if (!(await onDelete())) setIsDeleting(false)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        アカウントと、取引・実績・予算・貯金目標などの家計データ、掲示板の投稿・コメント・いいね・ブックマークをすべて削除します。削除したデータは元に戻せません。
      </p>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">退会する</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-popover text-popover-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>本当に退会しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              すべてのデータが削除され、元に戻せません。続けるには確認欄に「{DELETE_CONFIRMATION_WORD}」と入力してください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">確認のため「{DELETE_CONFIRMATION_WORD}」と入力</Label>
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={DELETE_CONFIRMATION_WORD}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
            {/* AlertDialogAction は押すと必ず閉じるため、失敗時に開いたままにできるよう通常のボタンにする */}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmation.trim() !== DELETE_CONFIRMATION_WORD || isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              退会を確定する
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
