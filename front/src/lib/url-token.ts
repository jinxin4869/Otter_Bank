/**
 * メールのリンクのパスに載せたトークンを戻す。バックエンドは / や + を含みうるトークンを URL エンコードして載せている。
 * 受け取った値がエンコードされたままでも、すでに戻されていても同じトークンになる（トークンは % を含まないため）
 */
export function decodeUrlToken(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}
