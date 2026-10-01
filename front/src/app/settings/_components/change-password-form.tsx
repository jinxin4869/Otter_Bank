"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/schemas/auth"

type ChangePasswordFormProps = {
  token: string
}

export default function ChangePasswordForm({ token }: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  })

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await api.user.update(token, {
        current_password: values.currentPassword,
        password: values.password,
        password_confirmation: values.confirmPassword,
      })
      reset()
      toast.success("パスワードを変更しました", { description: "ほかの端末は、しばらくするとログアウトされます" })
    } catch (error) {
      console.error("パスワード変更エラー:", error)
      // 現在のパスワード違い・Google ログインのみでパスワード未設定などはサーバーの文言をそのまま出す
      toast.error("パスワードを変更できませんでした", {
        description: error instanceof Error ? error.message : "時間をおいて再度お試しください",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">現在のパスワード</Label>
        <Input id="current-password" type="password" autoComplete="current-password" aria-invalid={!!errors.currentPassword}
          aria-describedby={errors.currentPassword ? "current-password-error" : undefined}
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p id="current-password-error" role="alert" className="text-sm text-destructive">
            {errors.currentPassword.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">新しいパスワード</Label>
        <Input id="new-password" type="password" autoComplete="new-password" aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "new-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="new-password-error" role="alert" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
        <Input id="confirm-password" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p id="confirm-password-error" role="alert" className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        パスワードを変更
      </Button>
    </form>
  )
}
