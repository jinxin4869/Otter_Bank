"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { contactSchema, type ContactFormValues } from "@/lib/schemas/auth"

export default function ContactPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  // ログイン中のメールアドレスを自動入力
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (isLoggedIn) {
      const userEmail = localStorage.getItem("currentUserEmail")
      if (userEmail) {
        setValue("email", userEmail)
      }
    }
  }, [setValue])

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const apiUrl =
        process.env.NODE_ENV === "development"
          ? process.env.NEXT_PUBLIC_DEV_URL
          : process.env.NEXT_PUBLIC_API_URL

      const res = await fetch(`${apiUrl}/api/v1/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: data }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.errors?.join(", ") || "エラーが発生しました")
      }

      toast.success("送信完了", { description: "お問い合わせを受け付けました。回答をお待ちください。" })
      reset()
      router.push("/")
    } catch (error) {
      console.error("Contact form submission error:", error)
      toast.error("エラー", {
        description: error instanceof Error ? error.message : "送信に失敗しました。後ほど再度お試しください。",
      })
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <Input id="name" placeholder="山田 太郎" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" placeholder="example@example.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">お問い合わせ種類</Label>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="お問い合わせ種類を選択" />
                    </SelectTrigger>
                    <SelectContent className="board-dialog-content">
                      <SelectItem value="question">ご質問・ご相談</SelectItem>
                      <SelectItem value="feedback">ご意見・ご感想</SelectItem>
                      <SelectItem value="bug">不具合の報告</SelectItem>
                      <SelectItem value="feature">機能リクエスト</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">お問い合わせ内容</Label>
              <Textarea
                id="message"
                placeholder="お問い合わせ内容を詳しくご記入ください"
                rows={5}
                {...register("message")}
              />
              {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
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
