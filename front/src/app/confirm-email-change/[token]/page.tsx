"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { decodeUrlToken } from "@/lib/url-token"

// メールアドレス変更の確認メールのリンクの開き先。開くと新しいアドレスへ切り替わる
export default function ConfirmEmailChangePage() {
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
        await api.auth.confirmEmailChange(decodeUrlToken(token))
      } catch (error) {
        console.error("メールアドレス変更の確認エラー:", error)
        setErrorMessage(error instanceof Error ? error.message : "変更に失敗しました")
        setStatus("error")
        return
      }
      setStatus("success")
      // ログイン中なら表示中のアドレスを新しいものにするため、ユーザー情報を取り直す（未ログインなら何もしない）
      await refreshUser()
    }

    void confirm()
  }, [token, refreshUser])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">メールアドレスの変更</CardTitle>
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
                  メールアドレスを変更しました。次回から新しいアドレスでログインしてください。
                </AlertDescription>
              </Alert>
              {!authIsLoading && (
                <Button asChild className="w-full">
                  {isAuthenticated ? <Link href="/settings">設定へ戻る</Link> : <Link href="/login">ログインする</Link>}
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
              {!authIsLoading && (
                <Button asChild variant="outline" className="w-full">
                  {isAuthenticated ? <Link href="/settings">設定へ戻る</Link> : <Link href="/login">ログインする</Link>}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
