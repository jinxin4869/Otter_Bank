/** 認証済みユーザー（認証 API のレスポンスから作るフロント内部型） */
export type AuthUser = {
  id: number
  email: string
  username: string
  name?: string
  lastSignInAt: string | null // 前回サインイン時刻（sleeping mood 判定用）
  isAdmin: boolean // 運営（他人の投稿・コメントを削除できる）。表示の出し分けだけに使い、権限の判定はサーバーが行う
  emailConfirmed: boolean // メールアドレスを確認済みか。未確認なら確認を促すバナーを出す
  emailConfirmationDeadline: string | null // 確認せずにログインできる期限（確認済みなら null）
  unconfirmedEmail: string | null // 変更を申請し、確認待ちの新しいメールアドレス（無ければ null）
}

/**
 * 認証 API（/auth/verify など）のレスポンスを検証して AuthUser に変換する。
 * レスポンスはユーザーそのものか { user: ... } の形。必須項目が欠けていれば null を返す
 */
export function parseAuthUser(data: unknown): AuthUser | null {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null
  const wrapped = (data as Record<string, unknown>).user
  const raw = (typeof wrapped === "object" && wrapped !== null ? wrapped : data) as Record<string, unknown>
  if (typeof raw.id !== "number" || typeof raw.email !== "string" || typeof raw.username !== "string") return null

  return {
    id: raw.id,
    email: raw.email,
    username: raw.username,
    name: typeof raw.name === "string" ? raw.name : undefined,
    lastSignInAt: typeof raw.last_sign_in_at === "string" ? raw.last_sign_in_at : null,
    isAdmin: raw.admin === true,
    // 項目が無いレスポンス（ログイン API など）では確認済みとして扱い、バナーを誤って出さない
    emailConfirmed: raw.email_confirmed !== false,
    emailConfirmationDeadline:
      typeof raw.email_confirmation_deadline === "string" ? raw.email_confirmation_deadline : null,
    unconfirmedEmail: typeof raw.unconfirmed_email === "string" ? raw.unconfirmed_email : null,
  }
}
