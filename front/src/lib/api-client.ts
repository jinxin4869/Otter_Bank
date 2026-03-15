import { parseApiError } from '@/lib/api-error'

/** 環境に応じたベース URL を返す */
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_DEV_URL ?? ''
  }
  return process.env.NEXT_PUBLIC_API_URL ?? ''
}

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  token?: string | null
  body?: unknown
}

/**
 * 認証付き API リクエストを実行する
 * - 成功時: レスポンスを T 型として返す
 * - 204 No Content: undefined を返す
 * - 失敗時: Error をスロー
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T | undefined> {
  const { method = 'GET', token, body } = options
  const url = `${getBaseUrl()}/api/v1${path}`

  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined

  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new Error(res.ok ? 'レスポンスの解析に失敗しました' : 'エラーが発生しました')
  }

  if (!res.ok) {
    throw new Error(parseApiError(data, 'エラーが発生しました'))
  }
  return data as T
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
