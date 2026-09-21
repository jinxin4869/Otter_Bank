import { forwardRef, type ComponentProps } from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { toast } from "sonner"
import LoginPage from "@/app/login/page"
import { api } from "@/lib/api"

// Jest は React 18、アプリ本体（Next.js）は同梱の React 19 で動く。shadcn の Input は
// React 19 の書き方（ref を props で受ける）で、React 18 では ref が渡らず react-hook-form が
// 値を読めないため、テストでは ref を転送する Input に差し替える
jest.mock("@/components/ui/input", () => ({
  Input: forwardRef<HTMLInputElement, ComponentProps<"input">>(function MockInput(props, ref) {
    return <input ref={ref} {...props} />
  }),
}))

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
})
