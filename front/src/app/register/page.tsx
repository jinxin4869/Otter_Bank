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
import { Loader2, Mail, Lock, User, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // 入力検証
    if (!email || !password || !confirmPassword || !username) {
      setError("すべての項目を入力してください。")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません。")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。")
      setIsLoading(false)
      return
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            username: username,
            email: email,
            password: password,
            password_confirmation: confirmPassword,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "登録に失敗しました。");
      }

      const data = await response.json();

      // ユーザー情報をローカルストレージに保存 (トークンなど)
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUserEmail", email)
      if (data.token) {
        localStorage.setItem("authToken", data.token)
      }
      localStorage.setItem("tutorialSeen", "false")

      // 成功メッセージを表示
      toast.success("登録完了", {
        description: "アカウントが正常に作成されました。",
      })

      // ダッシュボードにリダイレクト
      router.push("/dashboard");

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("登録中にエラーが発生しました。後でもう一度お試しください。");
      }
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null)
    setIsGoogleLoading(true)

    try {
      // Google認証の処理
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google`;

    } catch (error) {
      setError("Google認証中にエラーが発生しました。後でもう一度お試しください。")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">アカウント作成</CardTitle>
          <CardDescription className="text-center">必要情報を入力して、獭獭銀行を始めましょう</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ユーザー名</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="ユーザー名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
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
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="8文字以上"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">パスワード（確認）</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-400 hover:bg-blue-600 text-white"
              disabled={isLoading || isGoogleLoading}>

              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登録中...
                </>
              ) : (
                "登録する"
              )}
            </Button>
          </form>
        </CardContent>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">または</span>
          </div>
        </div>

        {/* Googleで登録ボタン */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={handleGoogleRegister}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center"
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image
                src="/Google.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
            )}
            Googleで登録
          </Button>
        </div>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            登録することで、
            <Link href="/terms" className="text-blue-500 hover:text-blue-700 underline underline-offset-4">
              利用規約
            </Link>
            と
            <Link href="/privacy" className="text-blue-500 hover:text-blue-700 underline underline-offset-4">
              プライバシーポリシー
            </Link>
            に同意したことになります。
          </div>
          <div className="text-sm text-center">
            すでにアカウントをお持ちですか？{" "}
            <Link href="/login" className="text-red-400 hover:text-primary underline underline-offset-4">
              ログイン
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

