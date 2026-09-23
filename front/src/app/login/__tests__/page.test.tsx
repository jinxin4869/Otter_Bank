import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { toast } from "sonner"
import LoginPage from "@/app/login/page"
import { api } from "@/lib/api"

const push = jest.fn()
const login = jest.fn()

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ login }) }))
jest.mock("@/lib/api-client", () => ({ getApiUrl: () => "http://api.test" }))
jest.mock("@/lib/api", () => ({ api: { auth: { login: jest.fn() } } }))

const apiLogin = api.auth.login as jest.Mock

const submit = async (container: HTMLElement) => {
  fireEvent.change(container.querySelector("#email")!, { target: { value: "dev@example.com" } })
  fireEvent.change(container.querySelector("#password")!, { target: { value: "wrong-password" } })
  fireEvent.click(screen.getByRole("button", { name: "ログイン" }))
}

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("ログインに失敗したらエラーをインライン表示だけで出し、トーストは出さない", async () => {
    apiLogin.mockRejectedValue(new Error("メールアドレスまたはパスワードが無効です"))
    const { container } = render(<LoginPage />)
    await submit(container)

    expect(await screen.findByRole("alert")).toHaveTextContent("メールアドレスまたはパスワードが無効です")
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("ログインに成功したら成功トーストを出してダッシュボードへ遷移する", async () => {
    apiLogin.mockResolvedValue({ token: "access-token" })
    login.mockResolvedValue(undefined)
    const { container } = render(<LoginPage />)
    await submit(container)

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"))
    expect(toast.success).toHaveBeenCalledWith("ログイン成功", expect.anything())
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it.each([
    ["cancelled", "Googleログインがキャンセルされました"],
    ["failed", "Googleログインに失敗しました。もう一度お試しください。"],
  ])("Google ログインから oauth_error=%s で戻ってきたらインラインでエラーを表示する", async (reason, message) => {
    window.history.pushState({}, "", `/login?oauth_error=${reason}`)
    render(<LoginPage />)
    expect(await screen.findByRole("alert")).toHaveTextContent(message)
    window.history.pushState({}, "", "/login")
  })

  it("未知の oauth_error はそのまま表示せず、失敗のメッセージにする", async () => {
    window.history.pushState({}, "", "/login?oauth_error=%3Cscript%3E")
    render(<LoginPage />)
    expect(await screen.findByRole("alert")).toHaveTextContent("Googleログインに失敗しました。もう一度お試しください。")
    window.history.pushState({}, "", "/login")
  })
})
