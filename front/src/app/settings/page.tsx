"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import ProfileForm from "./_components/profile-form"
import ChangePasswordForm from "./_components/change-password-form"
import ChangeEmailForm from "./_components/change-email-form"
import DeleteAccountSection from "./_components/delete-account-section"

export default function SettingsPage() {
  const router = useRouter()
  const { user, token, isLoading: authIsLoading, isAuthenticated, hasLoggedOut, deleteAccount, refreshUser } = useAuth()

  // 自分でログアウト・退会した直後（hasLoggedOut）は useAuth がトップへ移動させるので /login へ飛ばさない
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated && !hasLoggedOut) {
      router.push("/login")
    }
  }, [authIsLoading, isAuthenticated, hasLoggedOut, router])

  if (authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated || !user || !token) return null

  return (
    <div className="container mx-auto max-w-2xl py-6 px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
          <CardDescription>掲示板などに表示される名前です</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            token={token}
            initialUsername={user.username}
            initialName={user.name ?? ""}
            onSaved={refreshUser}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>メールアドレスの変更</CardTitle>
          <CardDescription>
            新しいアドレスに確認メールを送ります。メールのリンクを開くまでは、今のアドレス（{user.email}）のまま使えます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangeEmailForm
            token={token}
            currentEmail={user.email}
            unconfirmedEmail={user.unconfirmedEmail}
            onRequested={refreshUser}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>パスワードの変更</CardTitle>
          <CardDescription>
            Google ログインのみでパスワードが未設定の場合は、
            <Link href="/reset-password" className="text-primary hover:underline">
              パスワードの再設定
            </Link>
            から設定してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm token={token} />
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">退会</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccountSection onDelete={deleteAccount} />
        </CardContent>
      </Card>
    </div>
  )
}
