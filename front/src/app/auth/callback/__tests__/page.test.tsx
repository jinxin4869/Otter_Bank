import { render, screen, waitFor } from "@testing-library/react"
import AuthCallbackPage from "@/app/auth/callback/page"
import { api } from "@/lib/api"

const push = jest.fn()
const login = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}))
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ login }) }))
jest.mock("@/lib/api", () => ({ api: { auth: { refresh: jest.fn() } } }))

const refresh = api.auth.refresh as jest.Mock

describe("Google ログインのコールバック画面", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, "error").mockImplementation(() => {})
    window.history.pushState({}, "", "/auth/callback")
  })

  afterEach(() => jest.restoreAllMocks())

  it("リフレッシュ API（cookie）でアクセストークンを受け取ってログインする", async () => {
    refresh.mockResolvedValue({ token: "access-token" })
    login.mockResolvedValue(undefined)
    render(<AuthCallbackPage />)

    await waitFor(() => expect(login).toHaveBeenCalledWith("access-token"))
    expect(await screen.findByText(/ログインしました/)).toBeInTheDocument()
  })

  it("URL にトークンが付いていても使わない", async () => {
    window.history.pushState({}, "", "/auth/callback?token=leaked-token")
    refresh.mockResolvedValue({ token: "access-token" })
    render(<AuthCallbackPage />)

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1))
    expect(login).not.toHaveBeenCalledWith("leaked-token")
  })

  it("アクセストークンを受け取れなければエラーを表示する", async () => {
    refresh.mockRejectedValue(new Error("無効"))
    render(<AuthCallbackPage />)

    expect(await screen.findByText("認証エラーが発生しました")).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })
})
