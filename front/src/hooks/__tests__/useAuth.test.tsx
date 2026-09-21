import { renderHook, waitFor, act } from "@testing-library/react"
import { useAuth } from "@/hooks/useAuth"

// getApiUrl は環境変数に依存するためテスト用に固定値を返すようモックする
jest.mock("@/lib/api-client", () => ({
  getApiUrl: () => "http://localhost:3000",
}))

// useRouter（next/navigation）はテスト環境では動かないためモックする
const pushMock = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
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
    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it("有効なトークンがある場合はユーザー情報を取得して認証済みになる", async () => {
    localStorage.setItem("authToken", "valid-token")
    const user = { id: 1, email: "otter@example.com", username: "otter" }
    mockFetch({ ok: true, json: async () => ({ user }) })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(user)
    expect(result.current.token).toBe("valid-token")
    expect(localStorage.getItem("isLoggedIn")).toBe("true")
  })

  it("トークン検証に失敗した場合は認証情報をクリアする", async () => {
    localStorage.setItem("authToken", "invalid-token")
    mockFetch({ ok: false, json: async () => ({ error: "Token verification failed" }) })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem("authToken")).toBeNull()
  })

  it("logout で認証情報を削除しログイン画面へ遷移する", async () => {
    localStorage.setItem("authToken", "valid-token")
    localStorage.setItem("isLoggedIn", "true")
    mockFetch({ ok: true, json: async () => ({ user: { id: 1, email: "a@b.c", username: "a" } }) })

    const { result } = renderHook(() => useAuth())
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

describe("useAuth（複数インスタンス間の認証状態の共有）", () => {
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

  it("別インスタンスでログインしたら、ヘッダー相当のインスタンスも認証済みになる", async () => {
    const header = renderHook(() => useAuth())
    const loginPage = renderHook(() => useAuth())
    await waitFor(() => expect(header.result.current.isLoading).toBe(false))
    expect(header.result.current.isAuthenticated).toBe(false)

    await act(async () => {
      await loginPage.result.current.login("access-token", "dev@example.com")
    })

    expect(loginPage.result.current.isAuthenticated).toBe(true)
    await waitFor(() => expect(header.result.current.isAuthenticated).toBe(true))
  })

  it("ログインした発火元自身は再検証しない（検証は発火元 1 回と他インスタンス 1 回ずつ）", async () => {
    const header = renderHook(() => useAuth())
    const loginPage = renderHook(() => useAuth())
    await waitFor(() => expect(header.result.current.isLoading).toBe(false))
    await waitFor(() => expect(loginPage.result.current.isLoading).toBe(false))

    await act(async () => {
      await loginPage.result.current.login("access-token", "dev@example.com")
    })
    await waitFor(() => expect(header.result.current.isAuthenticated).toBe(true))

    expect(verifyCalls()).toBe(2)
  })

  it("別インスタンスでログアウトしたら、もう一方も未認証になる", async () => {
    localStorage.setItem("authToken", "access-token")
    const header = renderHook(() => useAuth())
    const dashboard = renderHook(() => useAuth())
    await waitFor(() => expect(header.result.current.isAuthenticated).toBe(true))
    await waitFor(() => expect(dashboard.result.current.isAuthenticated).toBe(true))

    await act(async () => {
      await dashboard.result.current.logout()
    })

    await waitFor(() => expect(header.result.current.isAuthenticated).toBe(false))
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

    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.logout()
    })

    await act(async () => {
      resolveVerify({ ok: true, json: async () => ({ user: verifiedUser }) })
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem("authToken")).toBeNull()
  })

  it("アンマウント後はイベントを購読しない", async () => {
    const other = renderHook(() => useAuth())
    const target = renderHook(() => useAuth())
    await waitFor(() => expect(target.result.current.isLoading).toBe(false))
    target.unmount()
    const before = verifyCalls()

    localStorage.setItem("authToken", "access-token")
    await act(async () => {
      await other.result.current.login("access-token", "dev@example.com")
    })

    // 発火元の検証 1 回のみ（アンマウント済みのインスタンスは検証しない）
    expect(verifyCalls() - before).toBe(1)
  })
})
