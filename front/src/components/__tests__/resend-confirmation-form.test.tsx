import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ResendConfirmationForm from "@/components/resend-confirmation-form"
import { api } from "@/lib/api"

jest.mock("@/lib/api", () => ({ api: { auth: { resendEmailConfirmation: jest.fn() } } }))

const resend = api.auth.resendEmailConfirmation as jest.Mock

describe("ResendConfirmationForm", () => {
  beforeEach(() => jest.clearAllMocks())

  it("入力済みのアドレスで送り、サーバーの文言を表示する", async () => {
    resend.mockResolvedValue({ message: "確認メールを送信しました。メールをご確認ください。" })
    render(<ResendConfirmationForm defaultEmail="otter@example.com" />)

    fireEvent.click(screen.getByRole("button", { name: "確認メールを送り直す" }))

    expect(await screen.findByText("確認メールを送信しました。メールをご確認ください。")).toBeInTheDocument()
    expect(resend).toHaveBeenCalledWith("otter@example.com")
  })

  it("メールアドレスの形式が正しくなければ送らない", async () => {
    const { container } = render(<ResendConfirmationForm />)
    fireEvent.change(screen.getByLabelText("メールアドレス"), { target: { value: "not-an-email" } })
    // type="email" の標準チェックは jsdom が送信を止めてしまうので、フォームを直接送信して zod の検証を確かめる
    fireEvent.submit(container.querySelector("form")!)

    expect(await screen.findByText("有効なメールアドレスを入力してください")).toBeInTheDocument()
    expect(resend).not.toHaveBeenCalled()
  })

  it("送信に失敗したらエラーを表示し、もう一度送れる", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {})
    resend.mockRejectedValue(new Error("リクエストが多すぎます"))
    render(<ResendConfirmationForm defaultEmail="otter@example.com" />)

    fireEvent.click(screen.getByRole("button", { name: "確認メールを送り直す" }))

    expect(await screen.findByText("リクエストが多すぎます")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("button", { name: "確認メールを送り直す" })).toBeEnabled())
  })
})
