"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function ContactPage() {
  // フォームの状態管理
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // ログイン状態の確認とメールアドレスの自動入力
  useEffect(() => {
    // ログイン状態をチェック
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (isLoggedIn) {
      const userEmail = localStorage.getItem("currentUserEmail")
      if (userEmail) {
        setEmail(userEmail)
      }
    }
  }, [])

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 実際のアプリではここでAPIを呼び出します
      // デモ用に送信成功をシミュレート
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 成功メッセージを表示
      toast.success("送信完了", {
        description: "お問い合わせを受け付けました。回答をお待ちください。",
      })

      // フォームをリセット
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")

      // ホームページにリダイレクト
      router.push("/")
    } catch (error) {
      console.error("Contact form submission error:", error);
      // エラーメッセージを表示
      toast.error("エラー", {
        description: "送信に失敗しました。後ほど再度お試しください。",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">お問い合わせ</CardTitle>
          <CardDescription className="text-center">ご質問、ご意見、不具合の報告などをお寄せください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">お問い合わせ種類</Label>
              <Select value={subject} onValueChange={setSubject} required>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="お問い合わせ種類を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">ご質問・ご相談</SelectItem>
                  <SelectItem value="feedback">ご意見・ご感想</SelectItem>
                  <SelectItem value="bug">不具合の報告</SelectItem>
                  <SelectItem value="feature">機能リクエスト</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">お問い合わせ内容</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="お問い合わせ内容を詳しくご記入ください"
                rows={5}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                "送信する"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>通常、2〜3営業日以内にご返信いたします</p>
        </CardFooter>
      </Card>
    </div>
  )
}

