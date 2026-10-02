"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ResendConfirmationForm from "@/components/resend-confirmation-form"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"

// メールのリンクはトークンを URL エンコードして載せている（/ や + を含みうるため）。
// 受け取った値がエンコードされたままでも、すでに戻されていても同じトークンになるよう戻してから送る
const decodeToken = (raw: string): string => {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export default function ConfirmEmailPage() {
  const { token } = useParams<{ token: string }>()
  const { isAuthenticated, isLoading: authIsLoading, refreshUser } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  // 開発モードの二重実行でも 1 回だけ送る
  const hasHandled = useRef(false)

  useEffect(() => {
    if (hasHandled.current) return
    hasHandled.current = true

    const confirm = async () => {
      try {
        await api.auth.confirmEmail(decodeToken(token))
        setStatus("success")
        // ログイン中ならヘッダーのバナーを消すため、ユーザー情報を取り直す（未ログインなら何もしない）
        await refreshUser()
      } catch (error) {
        console.error("メールアドレスの確認エラー:", error)
        setErrorMessage(error instanceof Error ? error.message : "確認に失敗しました")
        setStatus("error")
      }
    }

    void confirm()
  }, [token, refreshUser])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">メールアドレスの確認</CardTitle>
          {status === "error" && (
            <CardDescription className="text-center">
              確認メールを送り直して、新しいリンクからもう一度お試しください
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="確認中" />
            </div>
          )}

          {status === "success" && (
            <>
              <Alert className="border-primary/30 bg-accent">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription className="text-accent-foreground">
                  メールアドレスを確認しました。ありがとうございます。
                </AlertDescription>
              </Alert>
              {!authIsLoading && (
                <Button asChild className="w-full">
                  {isAuthenticated ? <Link href="/dashboard">マイページへ</Link> : <Link href="/login">ログインする</Link>}
                </Button>
              )}
            </>
          )}

          {status === "error" && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              <ResendConfirmationForm />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
