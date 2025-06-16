"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const getApiUrl = () => {
        if (process.env.NODE_ENV === 'development') {
          return process.env.NEXT_PUBLIC_DEV_URL;
        }
        return process.env.NEXT_PUBLIC_API_URL;
      };
      
      const apiUrl = `${getApiUrl()}/api/v1/sessions`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // エラーメッセージの詳細化
        switch (response.status) {
          case 401:
            throw new Error('メールアドレスまたはパスワードが正しくありません');
          case 403:
            throw new Error('アカウントがロックされています');
          case 404:
            throw new Error('アカウントが見つかりません');
          default:
            throw new Error(errorData.error || 'ログインに失敗しました');
        }
      }

      const data = await response.json();

      // トークンの検証
      if (!data.token) {
        throw new Error('認証トークンの取得に失敗しました');
      }

      // トークンの保存とリダイレクト
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUserEmail", email);

      // Success case
      toast.success("ログイン成功", {
        description: "ダッシュボードにリダイレクトします",
      });

      router.push("/dashboard")
    } catch (error) {
      // Error case
      if (error instanceof Error) {
        setError(error.message)
        toast.error("エラー", {
          description: error.message,
        });
      } else {
        setError("ログインに失敗しました。もう一度お試しください。");
        toast.error("エラー", {
          description: "ログインに失敗しました。もう一度お試しください。",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleRegister = async () => {
    setError(null)
    setIsGoogleLoading(true)

    try {
      
      // Google認証の処理
      window.location.href = `${getApiUrl()}/api/v1/auth/google`;

    } catch (error) {
      console.error("Google認証エラー:", error);
      setError("Google認証中にエラーが発生しました。後でもう一度お試しください。")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">ログイン</CardTitle>
          <CardDescription className="text-center">アカウントにログインしてください</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="例: example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-sm text-right">
                <Link href="/reset-password" className="text-primary hover:underline">
                  パスワードをお忘れですか？
                </Link>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-400 hover:bg-blue-600 text-white"
              disabled={isLoading}>
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

          <div className="px-2 py-4">
            <div className="flex items-center">
              <div className="flex-grow border-t border-muted-foreground/30"></div>
              <span className="mx-4 flex-shrink text-xs uppercase text-muted-foreground">または</span>
              <div className="flex-grow border-t border-muted-foreground/30"></div>
            </div>
          </div>

          {/* Googleログインボタン */}
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
              Googleでログイン
            </Button>
          </div>

        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            <Link href="/register" className="text-blue-500 hover:underline font-medium">新規登録はこちらから</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}