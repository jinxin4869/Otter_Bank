export type ApiErrorResponse = {
  error?: string
  errors?: string[]
  code?: string
}

/**
 * APIエラーレスポンスからユーザー向けメッセージを取得する
 * - {errors: [...]} — バリデーションエラー配列 → 読点で連結
 * - {error: "..."} — 単一エラー文字列 → そのまま返す
 * - どちらもなければ fallback を返す
 */
export function parseApiError(data: ApiErrorResponse, fallback: string): string {
  if (data.errors && data.errors.length > 0) {
    return data.errors.join('、')
  }
  return data.error || fallback
}
