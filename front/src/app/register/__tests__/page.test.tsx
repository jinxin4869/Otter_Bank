import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { toast } from "sonner"
import RegisterPage from "@/app/register/page"
import { api } from "@/lib/api"

const push = jest.fn()
const login = jest.fn()

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ login }) }))
jest.mock("@/lib/api", () => ({ api: { auth: { register: jest.fn() } } }))

const apiRegister = api.auth.register as jest.Mock

describe("RegisterPage", () => {
  beforeEach(() => jest.clearAllMocks())

  it("登録できたら、確認メールを送ったアドレスを知らせてマイページへ移動する", async () => {
    apiRegister.mockResolvedValue({ token: "access-token" })
    login.mockResolvedValue(undefined)
    const { container } = render(<RegisterPage />)

    fireEvent.change(container.querySelector("#username")!, { target: { value: "otter" } })
    fireEvent.change(container.querySelector("#email")!, { target: { value: "otter@example.com" } })
    fireEvent.change(container.querySelector("#password")!, { target: { value: "password123" } })
    fireEvent.change(container.querySelector("#confirm-password")!, { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: "登録する" }))

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"))
    expect(toast.success).toHaveBeenCalledWith("登録完了", {
      description: "otter@example.com に確認メールを送りました。7日以内にメールのリンクから確認してください。",
    })
  })
})
