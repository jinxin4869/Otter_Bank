"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Mail, Lock, User, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { parseApiError } from "@/lib/api-error"
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const getApiUrl = () => {
    if (process.env.NODE_ENV === "development") {
      return process.env.NEXT_PUBLIC_DEV_URL
    }
    return process.env.NEXT_PUBLIC_API_URL
  }

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null)

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            username: data.username,
            email: data.email,
            password: data.password,
            password_confirmation: data.confirmPassword,
          },
        }),
      })

      if (!response.ok) {
        let errorData: unknown
        try {
          errorData = await response.json()
        } catch {
          errorData = null
        }
        throw new Error(parseApiError(errorData, "登録に失敗しました。"))
      }

      const responseData = await response.json()

      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("currentUserEmail", data.email)
      if (responseData.token) {
        localStorage.setItem("authToken", responseData.token)
      }
      if (responseData.refresh_token) {
        localStorage.setItem("refreshToken", responseData.refresh_token)
      }
      localStorage.setItem("tutorialSeen", "false")

      toast.success("登録完了", { description: "アカウントが正常に作成されました。" })
      router.push("/dashboard")
    } catch (error) {
      const message = error instanceof Error ? error.message : "登録中にエラーが発生しました。後でもう一度お試しください。"
      setApiError(message)
      console.error("Registration error:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">アカウント作成</CardTitle>
          <CardDescription className="text-center">必要情報を入力して、獭獭銀行を始めましょう</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ユーザー名</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="ユーザー名"
                  className="pl-10"
                  disabled={isSubmitting}
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  disabled={isSubmitting}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="8文字以上"
                  className="pl-10"
                  disabled={isSubmitting}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">パスワード（確認）</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="パスワードを再入力"
                  className="pl-10"
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-400 hover:bg-blue-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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
