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
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

export default function ContactPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: "" },
  })

  // ログイン中のメールアドレスを自動入力
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setValue("email", user.email)
    }
  }, [isAuthenticated, user, setValue])

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await api.contacts.send(data)
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
