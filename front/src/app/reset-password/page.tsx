"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setErrorMessage("メールアドレスを入力してください。")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const res = await api.auth.requestPasswordReset(email)
      setSuccessMessage(res?.message ?? "パスワードリセットのメールを送信しました。メールをご確認ください。")
    } catch (err) {
      console.error("Password reset request error:", err)
      setErrorMessage(
        err instanceof Error ? err.message : "エラーが発生しました。時間をおいて再度お試しください。"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">パスワードをリセット</CardTitle>
          <CardDescription>
            登録時に使用したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                {successMessage}
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  メールアドレス
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="例: example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-400 hover:bg-blue-600 text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "パスワードリセットリンクを送信"
                )}
              </Button>
            </form>
          )}
          <div className="text-center text-sm mt-4">
            <Link
              href="/login"
              className="text-primary hover:underline flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              ログイン画面に戻る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
