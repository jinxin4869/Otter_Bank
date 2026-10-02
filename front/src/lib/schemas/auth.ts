import { z } from "zod"
import { CONTACT_MESSAGE_MAX_LENGTH } from "@/lib/text-limits"

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
})

export const registerSchema = z
  .object({
    username: z.string().min(1, "ユーザー名を入力してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  })

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  })

export const contactSchema = z.object({
  name: z.string().trim().min(1, "お名前を入力してください"),
  email: z.string().trim().email("有効なメールアドレスを入力してください"),
  subject: z.string().trim().min(1, "お問い合わせ種類を選択してください"),
  message: z
    .string()
    .trim()
    .min(1, "お問い合わせ内容を入力してください")
    .max(CONTACT_MESSAGE_MAX_LENGTH, `お問い合わせ内容は${CONTACT_MESSAGE_MAX_LENGTH.toLocaleString()}文字以内で入力してください`),
})

// 確認メールの送り直し（確認ページ・ログイン画面）
export const resendConfirmationSchema = z.object({
  email: z.string().trim().email("有効なメールアドレスを入力してください"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type ContactFormValues = z.infer<typeof contactSchema>
export type ResendConfirmationFormValues = z.infer<typeof resendConfirmationSchema>

// 設定画面: プロフィール（ユーザー名はサーバーの検証と同じ 3〜20 文字）
export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "ユーザー名は3文字以上で入力してください")
    .max(20, "ユーザー名は20文字以内で入力してください"),
  name: z.string().trim(),
})

// 設定画面: パスワード変更（現在のパスワードが必要）
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  })

export type ProfileFormValues = z.infer<typeof profileSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
