"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth"
import { api } from "@/lib/api"
import { getBaseUrl } from "@/lib/api-client"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [apiError, setApiError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const { saveAuthTokens } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null)

    try {
      const responseData = await api.auth.login(data.email, data.password)

      if (!responseData?.token) {
        throw new Error("認証トークンの取得に失敗しました")
      }

      saveAuthTokens(responseData.token, responseData.refresh_token, data.email)

      toast.success("ログイン成功", { description: "ダッシュボードにリダイレクトします" })
      router.push("/dashboard")
    } catch (error) {
      const message = error instanceof Error ? error.message : "ログインに失敗しました。もう一度お試しください。"
      setApiError(message)
      toast.error("エラー", { description: message })
    }
  }

  const handleGoogleRegister = async () => {
    setApiError(null)
    setIsGoogleLoading(true)

    try {
      window.location.href = `${getBaseUrl()}/api/v1/auth/google`
    } catch (error) {
      console.error("Google認証エラー:", error)
      setApiError("Google認証中にエラーが発生しました。後でもう一度お試しください。")
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
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="例: example@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <div className="text-sm text-right">
                <Link href="/reset-password" className="text-primary hover:underline">
                  パスワードをお忘れですか？
                </Link>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-400 hover:bg-blue-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleGoogleRegister}
              disabled={isGoogleLoading || isSubmitting}
              className="w-full flex items-center justify-center"
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Image src="/Google.svg" alt="Google" width={20} height={20} className="mr-2" />
              )}
              Googleでログイン
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            <Link href="/register" className="text-blue-500 hover:underline font-medium">
              新規登録はこちらから
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
