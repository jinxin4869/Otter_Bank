import { renderHook, waitFor, act, render, screen } from "@testing-library/react"
import { useAuth, AuthProvider } from "@/hooks/useAuth"

// API のベース URL（getApiUrl は NODE_ENV=test では NEXT_PUBLIC_API_URL を読む）
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000"

// useRouter（next/navigation）はテスト環境では動かないためモックする
const pushMock = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/",
}))

// toast の副作用を無効化する
jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}))

const mockFetch = (response: Partial<Response> & { json: () => Promise<unknown> }) => {
  global.fetch = jest.fn().mockResolvedValue(response) as unknown as typeof fetch
}

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it("トークンが無い場合は未認証状態になる", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it("有効なトークンがある場合はユーザー情報を取得して認証済みになる", async () => {
    localStorage.setItem("authToken", "valid-token")
    const user = { id: 1, email: "otter@example.com", username: "otter" }
    mockFetch({ ok: true, json: async () => ({ user }) })

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(true)
    // API のレスポンスはキャメルケースの内部型に変換して保持する
    expect(result.current.user).toEqual({ ...user, name: undefined, lastSignInAt: null })
    expect(result.current.token).toBe("valid-token")
    expect(localStorage.getItem("isLoggedIn")).toBe("true")
  })

  it("トークン検証に失敗した場合は認証情報をクリアする", async () => {
    localStorage.setItem("authToken", "invalid-token")
    mockFetch({ ok: false, json: async () => ({ error: "Token verification failed" }) })

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem("authToken")).toBeNull()
  })

  it("logout で認証情報を削除しログイン画面へ遷移する", async () => {
    localStorage.setItem("authToken", "valid-token")
    localStorage.setItem("isLoggedIn", "true")
    mockFetch({ ok: true, json: async () => ({ user: { id: 1, email: "a@b.c", username: "a" } }) })

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem("authToken")).toBeNull()
    expect(localStorage.getItem("isLoggedIn")).toBeNull()
    expect(pushMock).toHaveBeenCalledWith("/login")
  })
})

describe("useAuth（AuthProvider による状態の共有）", () => {
  const verifiedUser = { id: 1, email: "dev@example.com", username: "devuser" }
  const originalFetch = global.fetch

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    jest.spyOn(console, "error").mockImplementation(() => {})
    global.fetch = jest.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "DELETE") return { ok: true, json: async () => ({}) }
      return { ok: true, json: async () => ({ user: verifiedUser }) }
    }) as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  const verifyCalls = () =>
    (global.fetch as jest.Mock).mock.calls.filter(([url]) => String(url).endsWith("/auth/verify")).length

  // ヘッダーとページのように、同じ Provider の下で useAuth を呼ぶ 2 つの利用者
  let actions: { login: (t: string, e?: string) => Promise<void>; logout: () => Promise<void> } | null = null
  const Consumer = ({ label }: { label: string }) => {
    const auth = useAuth()
    actions = auth
    return <p data-testid={label}>{auth.isLoading ? "loading" : auth.isAuthenticated ? "in" : "out"}</p>
  }
  const renderApp = () =>
    render(
      <AuthProvider>
        <Consumer label="header" />
        <Consumer label="page" />
      </AuthProvider>
    )

  it("マウント時の検証は利用者の数によらず 1 回だけ", async () => {
    localStorage.setItem("authToken", "access-token")
    renderApp()
    await waitFor(() => expect(screen.getByTestId("header")).toHaveTextContent("in"))
    expect(screen.getByTestId("page")).toHaveTextContent("in")
    expect(verifyCalls()).toBe(1)
  })

  it("ページ側で login したら、ヘッダー側も認証済みになる", async () => {
    renderApp()
    await waitFor(() => expect(screen.getByTestId("header")).toHaveTextContent("out"))

    await act(async () => {
      await actions!.login("access-token", "dev@example.com")
    })

    expect(screen.getByTestId("header")).toHaveTextContent("in")
    expect(screen.getByTestId("page")).toHaveTextContent("in")
    expect(verifyCalls()).toBe(1)
  })

  it("ページ側で logout したら、ヘッダー側も未認証になる", async () => {
    localStorage.setItem("authToken", "access-token")
    renderApp()
    await waitFor(() => expect(screen.getByTestId("header")).toHaveTextContent("in"))

    await act(async () => {
      await actions!.logout()
    })

    expect(screen.getByTestId("header")).toHaveTextContent("out")
    expect(localStorage.getItem("authToken")).toBeNull()
  })

  it("API 呼び出し中にトークンが更新されたら、新しいトークンを取り直す", async () => {
    localStorage.setItem("authToken", "access-token")
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    localStorage.setItem("authToken", "refreshed-token")
    await act(async () => {
      window.dispatchEvent(new CustomEvent("auth-token-refreshed", { detail: { token: "refreshed-token" } }))
    })

    await waitFor(() => expect(result.current.token).toBe("refreshed-token"))
  })

  it("検証中にログアウトされたら、遅れて返った検証結果で認証済みに戻らない", async () => {
    localStorage.setItem("authToken", "old-token")
    let resolveVerify: (v: unknown) => void = () => {}
    global.fetch = jest.fn((_url: string, init?: RequestInit) => {
      if (init?.method === "DELETE") return Promise.resolve({ ok: true, json: async () => ({}) })
      return new Promise((resolve) => {
        resolveVerify = resolve
      })
    }) as unknown as typeof fetch

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await act(async () => {
      await result.current.logout()
    })

    await act(async () => {
      resolveVerify({ ok: true, json: async () => ({ user: verifiedUser }) })
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem("authToken")).toBeNull()
  })

  it("API 呼び出し中の更新失敗（expired）を受けたら、再検証せずにログアウト状態にする", async () => {
    localStorage.setItem("authToken", "access-token")
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))
    const before = verifyCalls()

    await act(async () => {
      window.dispatchEvent(new CustomEvent("auth-state-changed", { detail: { expired: true } }))
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem("authToken")).toBeNull()
    expect(verifyCalls()).toBe(before)
  })

  it("AuthProvider の外で useAuth を呼ぶと分かるエラーになる", () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/)
  })
})

describe("useAuth（トークンの期限切れ・一時的な失敗）", () => {
  const verifiedUser = { id: 1, email: "dev@example.com", username: "devuser" }
  const originalFetch = global.fetch

  const jsonResponse = (status: number, body: unknown) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it("ネットワーク障害では保存済みトークンを消さない（次回の確認でやり直せる）", async () => {
    localStorage.setItem("authToken", "valid-token")
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch")) as unknown as typeof fetch

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem("authToken")).toBe("valid-token")
  })

  it("期限切れならリフレッシュした新しいトークンで認証済みになる", async () => {
    localStorage.setItem("authToken", "expired-token")
    global.fetch = jest.fn(async (url: string, init?: RequestInit) => {
      if (String(url).endsWith("/auth/refresh")) return jsonResponse(200, { token: "new-token" })
      const auth = (init?.headers as Record<string, string>)?.Authorization
      return auth === "Bearer new-token"
        ? jsonResponse(200, verifiedUser)
        : jsonResponse(401, { error: "トークンの有効期限が切れています", code: "token_expired" })
    }) as unknown as typeof fetch

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    expect(result.current.token).toBe("new-token")
    expect(localStorage.getItem("authToken")).toBe("new-token")
  })

  it("同一タブ内で Provider が並行して期限切れを検知しても、リフレッシュは 1 回だけ呼ぶ", async () => {
    localStorage.setItem("authToken", "expired-token")
    global.fetch = jest.fn(async (url: string, init?: RequestInit) => {
      if (String(url).endsWith("/auth/refresh")) return jsonResponse(200, { token: "new-token" })
      const auth = (init?.headers as Record<string, string>)?.Authorization
      return auth === "Bearer new-token"
        ? jsonResponse(200, verifiedUser)
        : jsonResponse(401, { error: "期限切れ", code: "token_expired" })
    }) as unknown as typeof fetch

    const header = renderHook(() => useAuth(), { wrapper: AuthProvider })
    const dashboard = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(header.result.current.isAuthenticated).toBe(true))
    await waitFor(() => expect(dashboard.result.current.isAuthenticated).toBe(true))

    const refreshCalls = (global.fetch as jest.Mock).mock.calls.filter(([url]) => String(url).endsWith("/auth/refresh"))
    expect(refreshCalls).toHaveLength(1)
  })

  it("リフレッシュにも失敗したら認証情報を消す", async () => {
    localStorage.setItem("authToken", "expired-token")
    global.fetch = jest.fn(async (url: string) =>
      String(url).endsWith("/auth/refresh")
        ? jsonResponse(401, { error: "無効", code: "invalid_refresh_token" })
        : jsonResponse(401, { error: "期限切れ", code: "token_expired" })
    ) as unknown as typeof fetch

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem("authToken")).toBeNull()
  })
})
