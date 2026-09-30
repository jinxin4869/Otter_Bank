"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { profileSchema, type ProfileFormValues } from "@/lib/schemas/auth"

type ProfileFormProps = {
  token: string
  initialUsername: string
  initialName: string
  // 保存に成功したら、表示中のユーザー情報を取り直す
  onSaved: () => Promise<void> | void
}

export default function ProfileForm({ token, initialUsername, initialName, onSaved }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: initialUsername, name: initialName },
  })

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await api.user.update(token, { username: values.username, name: values.name })
      toast.success("プロフィールを保存しました")
      reset(values)
      await onSaved()
    } catch (error) {
      console.error("プロフィール更新エラー:", error)
      toast.error("プロフィールを保存できませんでした", {
        description: error instanceof Error ? error.message : "時間をおいて再度お試しください",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">ユーザー名</Label>
        <Input id="username" autoComplete="username" {...register("username")} />
        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">表示名（任意）</Label>
        <Input id="name" autoComplete="nickname" {...register("name")} />
      </div>
      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        保存
      </Button>
    </form>
  )
}
