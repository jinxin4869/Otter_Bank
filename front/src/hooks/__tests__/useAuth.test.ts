import { renderHook, act, waitFor } from "@testing-library/react"
import { useAuth } from "@/hooks/useAuth"

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("@/lib/api-client", () => ({ getApiUrl: () => "http://api.test" }))

const verifiedUser = { id: 1, email: "dev@example.com", username: "devuser" }

describe("useAuth（複数インスタンス間の認証状態の共有）", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.spyOn(console, "error").mockImplementation(() => {})
    global.fetch = jest.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === "DELETE") return { ok: true, json: async () => ({}) }
      return { ok: true, json: async () => ({ user: verifiedUser }) }
    }) as unknown as typeof fetch
  })

  afterEach(() => jest.restoreAllMocks())

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
})
