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
