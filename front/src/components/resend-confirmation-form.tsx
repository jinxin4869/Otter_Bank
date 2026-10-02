"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import { resendConfirmationSchema, type ResendConfirmationFormValues } from "@/lib/schemas/auth"

type ResendConfirmationFormProps = {
  // ログイン画面で入力済みのアドレスなど、最初から入れておく値
  defaultEmail?: string
}

/**
 * 確認メールを送り直すフォーム（確認リンクの期限切れ・確認期限を過ぎてログインできないとき用）。
 * サーバーは登録の有無にかかわらず同じ応答を返すので、成功時はその文言をそのまま表示する
 */
export default function ResendConfirmationForm({ defaultEmail = "" }: ResendConfirmationFormProps) {
  const [sentMessage, setSentMessage] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendConfirmationFormValues>({
    resolver: zodResolver(resendConfirmationSchema),
    defaultValues: { email: defaultEmail },
  })

  const onSubmit = async (values: ResendConfirmationFormValues) => {
    setApiError(null)
    try {
      const res = await api.auth.resendEmailConfirmation(values.email)
      setSentMessage(res?.message ?? "確認メールを送信しました。メールをご確認ください。")
    } catch (error) {
      console.error("確認メールの再送エラー:", error)
      setApiError(error instanceof Error ? error.message : "時間をおいて再度お試しください")
    }
  }

  if (sentMessage) {
    return (
      <Alert className="border-primary/30 bg-accent">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertDescription className="text-accent-foreground">{sentMessage}</AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="resend-email">メールアドレス</Label>
        <Input
          id="resend-email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "resend-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="resend-email-error" role="alert" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>
      {apiError && (
        <p role="alert" className="text-sm text-destructive">
          {apiError}
        </p>
      )}
      <Button type="submit" variant="outline" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        確認メールを送り直す
      </Button>
    </form>
  )
}
