/** 認証済みユーザーの型 */
export type User = {
  id: number
  email: string
  username: string
  name?: string
}

/** 認証済みユーザー（認証 API のレスポンスから作るフロント内部型） */
export type AuthUser = {
  id: number
  email: string
  username: string
  name?: string
  lastSignInAt: string | null // 前回サインイン時刻（sleeping mood 判定用）
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
  }
}
