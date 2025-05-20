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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, this would call an API
      // Simulate API call with validation
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Demo validation - in a real app this would be server-side
          if (email === "demo@example.com" && password === "password") {
            resolve(true)
          } else if (email === "" || password === "") {
            reject(new Error("メールアドレスとパスワードを入力してください"))
          } else {
            reject(new Error("メールアドレスまたはパスワードが正しくありません"))
          }
        }, 1000)
      })

      // Success case
      toast.success("ログイン成功",{
        description: "ダッシュボードにリダイレクトします",
      })

      router.push("/dashboard")
    } catch (error) {
      // Error case
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("ログインに失敗しました。もう一度お試しください。")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
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
                placeholder="example@example.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-sm text-right">
                <Link href="#" className="text-primary hover:underline">
                  パスワードをお忘れですか？
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">または</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" disabled={isLoading}>
            デモアカウントでログイン
          </Button>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>デモ用: メールアドレス「demo@example.com」、パスワード「password」でログインできます</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            新規登録は
            <Link href="/register" className="text-primary hover:underline">
              こちら
            </Link>
            から。
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}