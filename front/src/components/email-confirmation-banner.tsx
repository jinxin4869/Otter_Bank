"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { toast } from "sonner"
import { Loader2, MailWarning, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

type EmailConfirmationBannerProps = {
  email: string
  // 確認せずにログインできる期限（ISO 8601）。分からなければ期限の文言を省く
  deadline: string | null
}

const formatDeadline = (deadline: string | null): string | null => {
  if (!deadline) return null
  const date = parseISO(deadline)
  return Number.isNaN(date.getTime()) ? null : format(date, "M月d日 H:mm", { locale: ja })
}

/**
 * メールアドレスが未確認のユーザーに確認を促すバナー。
 * 閉じた状態は覚えないので、再読み込み・次のログインでまた表示される
 */
export default function EmailConfirmationBanner({ email, deadline }: EmailConfirmationBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [isSending, setIsSending] = useState(false)

  if (dismissed) return null

  const deadlineText = formatDeadline(deadline)

  const handleResend = async () => {
    setIsSending(true)
    try {
      const res = await api.auth.resendEmailConfirmation(email)
      toast.success(res?.message ?? "確認メールを送信しました。メールをご確認ください。")
    } catch (error) {
      console.error("確認メールの再送エラー:", error)
      toast.error("確認メールを送れませんでした", {
        description: error instanceof Error ? error.message : "時間をおいて再度お試しください",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div role="status" className="border-b border-primary/30 bg-accent text-accent-foreground">
      <div className="header-container flex flex-col gap-2 py-2 text-sm sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-2">
          <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p>
            メールアドレス（{email}）の確認が済んでいません。
            {deadlineText ? `${deadlineText} までに、` : ""}
            届いたメールのリンクから確認してください。
          </p>
        </div>
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={handleResend} disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            確認メールを送り直す
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDismissed(true)} aria-label="閉じる">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
