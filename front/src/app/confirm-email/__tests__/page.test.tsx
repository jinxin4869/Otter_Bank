import { render, screen, waitFor } from "@testing-library/react"
import ConfirmEmailPage from "@/app/confirm-email/[token]/page"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

let routeToken = "abc"
const refreshUser = jest.fn()

jest.mock("next/navigation", () => ({ useParams: () => ({ token: routeToken }) }))
jest.mock("@/hooks/useAuth", () => ({ useAuth: jest.fn() }))
jest.mock("@/lib/api", () => ({
  api: { auth: { confirmEmail: jest.fn(), resendEmailConfirmation: jest.fn() } },
}))

const confirmEmail = api.auth.confirmEmail as jest.Mock
const mockUseAuth = useAuth as jest.Mock

describe("ConfirmEmailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    routeToken = "abc"
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, refreshUser })
  })

  it("URL エンコードされたトークンを戻してから送る", async () => {
    routeToken = "eyJh%2Fb%2Bc%3D%3D--sig"
    confirmEmail.mockResolvedValue({ message: "ok" })
    render(<ConfirmEmailPage />)

    await waitFor(() => expect(confirmEmail).toHaveBeenCalledWith("eyJh/b+c==--sig"))
  })

  it("確認できたら完了を表示し、ログイン中ならユーザー情報を取り直してマイページへの導線を出す", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, refreshUser })
    confirmEmail.mockResolvedValue({ message: "ok" })
    render(<ConfirmEmailPage />)

    expect(await screen.findByText("メールアドレスを確認しました。ありがとうございます。")).toBeInTheDocument()
    expect(refreshUser).toHaveBeenCalled()
    expect(screen.getByRole("link", { name: "マイページへ" })).toHaveAttribute("href", "/dashboard")
  })

  it("未ログインならログインへの導線を出す", async () => {
    confirmEmail.mockResolvedValue({ message: "ok" })
    render(<ConfirmEmailPage />)

    expect(await screen.findByRole("link", { name: "ログインする" })).toHaveAttribute("href", "/login")
  })

  it("リンクが無効・期限切れなら理由と送り直しフォームを出す", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {})
    confirmEmail.mockRejectedValue(new Error("確認リンクが無効または期限切れです。確認メールを送り直してください。"))
    render(<ConfirmEmailPage />)

    expect(await screen.findByText("確認リンクが無効または期限切れです。確認メールを送り直してください。")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "確認メールを送り直す" })).toBeInTheDocument()
    expect(refreshUser).not.toHaveBeenCalled()
  })
})
