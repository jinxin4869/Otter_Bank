"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import { changeEmailSchema, type ChangeEmailFormValues } from "@/lib/schemas/auth"

type ChangeEmailFormProps = {
  token: string
  currentEmail: string
  // 変更を申請し、確認待ちの新しいアドレス（無ければ null）
  unconfirmedEmail: string | null
  // 申請に成功したら、表示中のユーザー情報（確認待ちのアドレス）を取り直す
  onRequested: () => Promise<void> | void
}

/**
 * メールアドレスの変更。新しいアドレスに届く確認メールのリンクを開くまでは、今のアドレスのまま使える
 */
export default function ChangeEmailForm({ token, currentEmail, unconfirmedEmail, onRequested }: ChangeEmailFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: "", currentPassword: "" },
  })

  const onSubmit = async (values: ChangeEmailFormValues) => {
    if (values.email === currentEmail) {
      setError("email", { message: "現在のメールアドレスと同じです" })
      return
    }
    try {
      await api.user.update(token, { email: values.email, current_password: values.currentPassword })
    } catch (error) {
      console.error("メールアドレス変更エラー:", error)
      // 現在のパスワード違い・使用中のアドレス・Google ログインのみでパスワード未設定などはサーバーの文言をそのまま出す
      toast.error("メールアドレスを変更できませんでした", {
        description: error instanceof Error ? error.message : "時間をおいて再度お試しください",
      })
      return
    }
    toast.success("確認メールを送りました", {
      description: `${values.email} に届いたメールのリンクを開くと、変更が完了します`,
    })
    reset()
    await onRequested()
  }

  return (
    <div className="space-y-4">
      {unconfirmedEmail && (
        <Alert className="border-primary/30 bg-accent">
          <MailCheck className="h-4 w-4 text-primary" />
          <AlertDescription className="text-accent-foreground">
            {unconfirmedEmail} への変更を確認待ちです。届いたメールのリンクを開くと変更が完了します（リンクの有効期限は 24 時間です）。
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-email">新しいメールアドレス</Label>
          <Input
            id="new-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "new-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="new-email-error" role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-current-password">現在のパスワード</Label>
          <Input
            id="email-current-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.currentPassword}
            aria-describedby={errors.currentPassword ? "email-current-password-error" : undefined}
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p id="email-current-password-error" role="alert" className="text-sm text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          確認メールを送る
        </Button>
      </form>
    </div>
  )
}
