import { api } from "@/lib/api"

// getApiUrl は NODE_ENV=test では NEXT_PUBLIC_API_URL を読む
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000"

const fetchMock = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => ({ token: "t" }),
})
global.fetch = fetchMock as unknown as typeof fetch

const lastInit = () => fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1] as RequestInit

describe("api.auth の Cookie 送受信", () => {
  beforeEach(() => fetchMock.mockClear())

  // リフレッシュトークンは HttpOnly Cookie で受け取るため、発行元の API はすべて credentials: 'include' が必要
  it.each([
    ["login", () => api.auth.login("otter@example.com", "password")],
    ["register", () => api.auth.register({ username: "otter", email: "otter@example.com", password: "p", password_confirmation: "p" })],
    ["refresh", () => api.auth.refresh()],
    ["logout", () => api.auth.logout("token")],
  ])("%s は credentials: 'include' で呼ぶ", async (_name, call) => {
    await call()
    expect(lastInit().credentials).toBe("include")
  })
})
