"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/schemas/auth"
import { api } from "@/lib/api"

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const [successMessage, setSuccessMessage] = useState("")
  const [apiError, setApiError] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setApiError("")
    setSuccessMessage("")

    try {
      await api.auth.resetPassword(token, data.password)
      setSuccessMessage("パスワードがリセットされました。ログインページにリダイレクトします。")
      setTimeout(() => router.push("/login"), 3000)
    } catch (err) {
      console.error("Password reset error:", err)
      const isNetworkError =
        err instanceof Error &&
        (err.message.toLowerCase().includes("failed to fetch") ||
          err.message.toLowerCase().includes("network"))
      setApiError(
        isNetworkError
          ? "ネットワークエラーが発生しました。時間をおいて再度お試しください。"
          : err instanceof Error
            ? err.message
            : "パスワードのリセットに失敗しました"
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">パスワードリセット</CardTitle>
        </CardHeader>
        <CardContent>
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="mb-4 border-green-500 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">新しいパスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="8文字以上"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード確認</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="パスワードを再入力"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-400 hover:bg-blue-600 text-white"
              disabled={isSubmitting || !!successMessage}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  リセット中...
                </>
              ) : (
                "パスワードをリセット"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
