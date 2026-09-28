import { api } from "@/lib/api"
import { isExpiredToken } from "@/lib/api-client"

// getApiUrl は NODE_ENV=test では NEXT_PUBLIC_API_URL を読む
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000"

const fetchMock = jest.fn()
global.fetch = fetchMock as unknown as typeof fetch

const jsonResponse = (status: number, body: unknown) => ({ ok: status < 400, status, json: async () => body })
const expired = () => jsonResponse(401, { error: "トークンの有効期限が切れています", code: "token_expired" })

describe("apiRequest の期限切れ時の自動リフレッシュ", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    localStorage.clear()
    // apiRequest に渡すトークンは常に保存済みのもの（ログアウト後は refresh 結果を捨てるため、保存が無いと更新されない）
    localStorage.setItem("authToken", "old-token")
  })

  it("401 token_expired ならリフレッシュして新しいトークンで 1 回だけ再試行する", async () => {
    fetchMock
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(jsonResponse(200, { token: "new-token" }))
      .mockResolvedValueOnce(jsonResponse(200, { transactions: [] }))

    const result = await api.transactions.list("old-token")

    expect(result).toEqual({ transactions: [] })
    const urls = fetchMock.mock.calls.map(([url]) => String(url))
    expect(urls[1]).toMatch(/\/auth\/refresh$/)
    expect((fetchMock.mock.calls[2][1] as RequestInit).headers).toMatchObject({ Authorization: "Bearer new-token" })
    expect(localStorage.getItem("authToken")).toBe("new-token")
  })

  it("リフレッシュに失敗したら元のエラーを投げ、認証状態の再確認を促す", async () => {
    const listener = jest.fn()
    window.addEventListener("auth-state-changed", listener)
    fetchMock
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(jsonResponse(401, { error: "無効", code: "invalid_refresh_token" }))

    await expect(api.transactions.list("old-token")).rejects.toMatchObject({ code: "token_expired" })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener("auth-state-changed", listener)
  })

  it("verify は自動リフレッシュしない（useAuth が扱う）", async () => {
    fetchMock.mockResolvedValueOnce(expired())

    await expect(api.auth.verify("old-token")).rejects.toMatchObject({ code: "token_expired" })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("同時に複数の呼び出しが期限切れになってもリフレッシュは 1 回", async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (String(url).endsWith("/auth/refresh")) return jsonResponse(200, { token: "new-token" })
      const auth = (init?.headers as Record<string, string> | undefined)?.Authorization
      return auth === "Bearer new-token" ? jsonResponse(200, { ok: true }) : expired()
    })

    await Promise.all([api.transactions.list("old-token"), api.achievements.list("old-token")])

    const refreshCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/auth/refresh"))
    expect(refreshCalls).toHaveLength(1)
  })

  it("再試行は 1 回だけ（再試行後も期限切れなら諦めてエラーを投げる）", async () => {
    fetchMock
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(jsonResponse(200, { token: "new-token" }))
      .mockResolvedValueOnce(expired())

    await expect(api.transactions.list("old-token")).rejects.toMatchObject({ code: "token_expired" })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it("exp が過去のトークンは送信前にリフレッシュし、新しいトークンで 1 回だけ呼ぶ", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { token: "new-token" }))
      .mockResolvedValueOnce(jsonResponse(200, { posts: [], meta: {} }))

    await api.posts.list(makeJwt(Math.floor(Date.now() / 1000) - 60))

    const urls = fetchMock.mock.calls.map(([url]) => String(url))
    expect(urls[0]).toMatch(/\/auth\/refresh$/)
    expect((fetchMock.mock.calls[1][1] as RequestInit).headers).toMatchObject({ Authorization: "Bearer new-token" })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("応答待ちの間にログアウトされていたら、更新したトークンを保存しない", async () => {
    fetchMock
      .mockResolvedValueOnce(expired())
      .mockImplementationOnce(async () => {
        localStorage.removeItem("authToken") // refresh の応答前にログアウト
        return jsonResponse(200, { token: "new-token" })
      })

    await expect(api.transactions.list("old-token")).rejects.toMatchObject({ code: "token_expired" })
    expect(localStorage.getItem("authToken")).toBeNull()
  })
})

const makeJwt = (exp: number) => {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url")
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ user_id: 1, exp })}.sig`
}

describe("isExpiredToken", () => {
  it("exp が過去なら true、未来なら false、JWT でなければ false", () => {
    const now = Math.floor(Date.now() / 1000)
    expect(isExpiredToken(makeJwt(now - 1))).toBe(true)
    expect(isExpiredToken(makeJwt(now + 60))).toBe(false)
    expect(isExpiredToken("not-a-jwt")).toBe(false)
  })
})
