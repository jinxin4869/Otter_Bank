import { render, screen, waitFor } from "@testing-library/react"
import ConfirmEmailChangePage from "@/app/confirm-email-change/[token]/page"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

const refreshUser = jest.fn()

jest.mock("next/navigation", () => ({ useParams: () => ({ token: "abc%3D--sig" }) }))
jest.mock("@/hooks/useAuth", () => ({ useAuth: jest.fn() }))
jest.mock("@/lib/api", () => ({ api: { auth: { confirmEmailChange: jest.fn() } } }))

const confirmEmailChange = api.auth.confirmEmailChange as jest.Mock
const mockUseAuth = useAuth as jest.Mock

describe("ConfirmEmailChangePage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, refreshUser })
  })

  it("戻したトークンを送り、変更できたらユーザー情報を取り直して設定への導線を出す", async () => {
    confirmEmailChange.mockResolvedValue({ message: "ok" })
    render(<ConfirmEmailChangePage />)

    expect(await screen.findByText(/メールアドレスを変更しました/)).toBeInTheDocument()
    expect(confirmEmailChange).toHaveBeenCalledWith("abc=--sig")
    expect(refreshUser).toHaveBeenCalled()
    expect(screen.getByRole("link", { name: "設定へ戻る" })).toHaveAttribute("href", "/settings")
  })

  it("未ログインならログインへの導線を出す", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, refreshUser })
    confirmEmailChange.mockResolvedValue({ message: "ok" })
    render(<ConfirmEmailChangePage />)

    expect(await screen.findByRole("link", { name: "ログインする" })).toHaveAttribute("href", "/login")
  })

  it("変更できなければ理由を表示し、ユーザー情報は取り直さない", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {})
    confirmEmailChange.mockRejectedValue(new Error("このメールアドレスはすでに使われているため変更できません。"))
    render(<ConfirmEmailChangePage />)

    expect(await screen.findByText("このメールアドレスはすでに使われているため変更できません。")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("link", { name: "設定へ戻る" })).toBeInTheDocument())
    expect(refreshUser).not.toHaveBeenCalled()
  })
})
