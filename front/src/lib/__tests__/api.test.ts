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

describe("api.posts.list の検索条件", () => {
  beforeEach(() => fetchMock.mockClear())

  const lastUrl = () => new URL(String(fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0]))

  it("条件をクエリパラメーターにして送る（配列は [] 付きで繰り返す）", async () => {
    await api.posts.list("t", 2, 20, {
      q: "節約 & 貯金",
      searchCategories: ["savings"],
      category: "budget",
      categories: ["investment", "income"],
      sort: "popular",
    })
    const params = lastUrl().searchParams
    expect(params.get("page")).toBe("2")
    expect(params.get("q")).toBe("節約 & 貯金")
    expect(params.getAll("search_categories[]")).toEqual(["savings"])
    expect(params.get("category")).toBe("budget")
    expect(params.getAll("categories[]")).toEqual(["investment", "income"])
    expect(params.get("sort")).toBe("popular")
  })

  it("bookmarked を指定すると bookmarked=true を送る", async () => {
    await api.posts.list("t", 1, 20, { bookmarked: true })
    expect(lastUrl().searchParams.get("bookmarked")).toBe("true")
  })

  it("条件が無ければページ指定だけを送る", async () => {
    await api.posts.list("t")
    expect([...lastUrl().searchParams.keys()]).toEqual(["page", "per"])
  })
})

describe("api.auth のメールアドレス確認", () => {
  beforeEach(() => fetchMock.mockClear())

  const lastCall = () => {
    const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit]
    return { path: new URL(url).pathname, method: init.method, body: JSON.parse(String(init.body)) }
  }

  it("confirmEmail はトークンを送る", async () => {
    await api.auth.confirmEmail("abc")
    expect(lastCall()).toEqual({ path: "/api/v1/auth/confirm-email", method: "POST", body: { token: "abc" } })
  })

  it("resendEmailConfirmation はメールアドレスを送る", async () => {
    await api.auth.resendEmailConfirmation("otter@example.com")
    expect(lastCall()).toEqual({
      path: "/api/v1/auth/confirm-email/resend",
      method: "POST",
      body: { email: "otter@example.com" },
    })
  })
})
