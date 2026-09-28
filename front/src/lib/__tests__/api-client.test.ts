import { api } from "@/lib/api"

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
})
