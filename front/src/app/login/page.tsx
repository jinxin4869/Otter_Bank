"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // 入力検証
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。")
      setIsLoading(false)
      return
    }

    try {
      // 実際のアプリではAPIを呼び出します
      // このデモでは、ローカルストレージに保存するだけです
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // ユーザー情報をローカルストレージに保存
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("currentUserEmail", email)

      // 成功メッセージを表示
      toast.success("ログイン成功",{
        description: "ダッシュボードにリダイレクトします。",
      })

      // ダッシュボードにリダイレクト
      router.push("/dashboard")
    } catch (error) {
      setError("ログイン中にエラーが発生しました。後でもう一度お試しください。")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setIsGoogleLoading(true)

    try {
      // 実際のアプリではGoogle OAuth認証を行います
      // このデモでは、シミュレーションのみ行います
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // ダミーのGoogleアカウント情報
      const googleEmail = "user@gmail.com"

      // ユーザー情報をローカルストレージに保存
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("currentUserEmail", googleEmail)

      // 成功メッセージを表示
      toast.success("Google認証完了",{
        description: "Googleアカウントでログインしました。",
      })

      // ダッシュボードにリダイレクト
      router.push("/dashboard")
    } catch (error) {
      setError("Google認証中にエラーが発生しました。後でもう一度お試しください。")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">ログイン</CardTitle>
          <CardDescription className="text-center">
            メールアドレスとパスワードを入力してログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Googleでログインボタン */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center"
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Image
                  src="/placeholder.svg?height=20&width=20&text=G"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
              )}
              Googleでログイン
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">または</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  パスワードを忘れた場合
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ログイン中...
                </>
              ) : (
                "ログイン"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            アカウントをお持ちでない場合は{" "}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
              新規登録
            </Link>
            してください。
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

