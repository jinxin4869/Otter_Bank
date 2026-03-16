export type ApiErrorResponse = {
  error?: string
  errors?: string[]
  code?: string
}

/** APIエラーをコード付きで表現するクラス */
export class ApiError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * APIエラーレスポンスからユーザー向けメッセージを取得する
 * - {errors: [...]} — バリデーションエラー配列 → 読点で連結
 * - {error: "..."} — 単一エラー文字列 → そのまま返す
 * - どちらもなければ fallback を返す
 */
export function parseApiError(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback
  }

  const maybe = data as { errors?: unknown; error?: unknown }

  if (
    Array.isArray(maybe.errors) &&
    maybe.errors.length > 0 &&
    maybe.errors.every((e) => typeof e === 'string')
  ) {
    return (maybe.errors as string[]).join('、')
  }

  if (typeof maybe.error === 'string' && maybe.error.trim() !== '') {
    return maybe.error
  }

  return fallback
}
