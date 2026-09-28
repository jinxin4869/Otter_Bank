import { parseApiError, ApiError } from '@/lib/api-error'

/** 環境に応じたベース URL を返す。未設定の場合は例外をスロー */
export function getApiUrl(): string {
  const url =
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_DEV_URL
      : process.env.NEXT_PUBLIC_API_URL
  if (!url) {
    throw new Error(
      'API URL が設定されていません。環境変数 NEXT_PUBLIC_DEV_URL / NEXT_PUBLIC_API_URL を確認してください。'
    )
  }
  return url
}

// 認証状態が変わった（ログイン・ログアウト・更新失敗）ことを useAuth の各インスタンスへ知らせるイベント名
export const AUTH_STATE_CHANGED_EVENT = 'auth-state-changed'
// API 呼び出し中にアクセストークンを更新できたことを知らせるイベント名。useAuth はこれで新しいトークンを取り直す
export const AUTH_TOKEN_REFRESHED_EVENT = 'auth-token-refreshed'

// リフレッシュトークンは使うたびに作り直されるため、並行して呼ぶと片方が失敗する。
// 複数の呼び出し元が同時に期限切れを検知しても、リフレッシュは 1 回だけ行う
let refreshInFlight: Promise<string | null> | null = null

/**
 * HttpOnly Cookie のリフレッシュトークンでアクセストークンを再発行し、localStorage に保存して返す。
 * 失敗したら null（Cookie が無い・失効済み・ネットワーク障害）
 */
export const refreshAccessToken = (): Promise<string | null> => {
  refreshInFlight ??= fetch(`${getApiUrl()}/api/v1/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then(async (res) => {
      if (!res.ok) return null
      const data: unknown = await res.json()
      const token = data !== null && typeof data === 'object' ? (data as { token?: unknown }).token : undefined
      if (typeof token !== 'string') return null
      localStorage.setItem('authToken', token)
      window.dispatchEvent(new CustomEvent(AUTH_TOKEN_REFRESHED_EVENT, { detail: { token } }))
      return token
    })
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  token?: string | null
  body?: unknown
  credentials?: RequestCredentials
  // 期限切れ（401 token_expired）のとき、リフレッシュして 1 回だけ再試行する。既定は有効。
  // useAuth の検証（/auth/verify）は自前でリフレッシュを扱うため false にする
  retryOnExpired?: boolean
}

/**
 * 認証付き API リクエストを実行する
 * - 成功時: レスポンスを T 型として返す
 * - 204 No Content: undefined を返す
 * - アクセストークン期限切れ: リフレッシュして 1 回だけ再試行。更新できなければ認証状態の再確認を促してからスロー
 * - 失敗時: Error をスロー
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T | undefined> {
  const { method = 'GET', token, body, credentials, retryOnExpired = true } = options
  const url = `${getApiUrl()}/api/v1${path}`

  const send = async (accessToken: string | null | undefined) => {
    const headers: Record<string, string> = {}
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
    if (body !== undefined) headers['Content-Type'] = 'application/json'

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials,
    })

    if (res.status === 204) return { ok: true as const, data: undefined }

    let data: unknown
    try {
      data = await res.json()
    } catch {
      throw new Error(res.ok ? 'レスポンスの解析に失敗しました' : 'エラーが発生しました')
    }

    if (!res.ok) {
      const message = parseApiError(data, 'エラーが発生しました')
      const code =
        data !== null &&
        typeof data === 'object' &&
        'code' in data &&
        typeof (data as { code: unknown }).code === 'string'
          ? (data as { code: string }).code
          : undefined
      return { ok: false as const, error: new ApiError(message, code) }
    }
    return { ok: true as const, data: data as T }
  }

  const first = await send(token)
  if (first.ok) return first.data

  const expired = first.error.code === 'token_expired' && !!token && retryOnExpired
  if (!expired) throw first.error

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    // 更新できない = セッション終了。useAuth に再確認させ、ログアウト表示と /login への誘導に任せる
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED_EVENT))
    throw first.error
  }

  const second = await send(refreshed)
  if (second.ok) return second.data
  throw second.error
}

/**
 * 認証不要の API リクエスト（ログイン・登録用）
 */
export async function publicApiRequest<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'token'> = {}
): Promise<T | undefined> {
  return apiRequest<T>(path, options)
}
