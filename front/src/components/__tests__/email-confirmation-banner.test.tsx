import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { toast } from "sonner"
import EmailConfirmationBanner from "@/components/email-confirmation-banner"
import { api } from "@/lib/api"

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("@/lib/api", () => ({ api: { auth: { resendEmailConfirmation: jest.fn() } } }))

const resend = api.auth.resendEmailConfirmation as jest.Mock

describe("EmailConfirmationBanner", () => {
  beforeEach(() => jest.clearAllMocks())

  it("アドレスと確認の期限を表示する", () => {
    // 期限は表示する環境のタイムゾーンで出すので、ローカル時刻で作る
    const deadline = new Date(2026, 9, 9, 18, 30).toISOString()
    render(<EmailConfirmationBanner email="otter@example.com" deadline={deadline} />)

    expect(screen.getByRole("status")).toHaveTextContent("メールアドレス（otter@example.com）の確認が済んでいません。")
    expect(screen.getByRole("status")).toHaveTextContent("10月9日 18:30 までに")
  })

  it("期限が無ければ期限の文言を省く", () => {
    render(<EmailConfirmationBanner email="otter@example.com" deadline={null} />)
    expect(screen.getByRole("status")).not.toHaveTextContent("までに、")
  })

  it("送り直すと自分のアドレスで送り、結果をトーストで知らせる", async () => {
    resend.mockResolvedValue({ message: "確認メールを送信しました。メールをご確認ください。" })
    render(<EmailConfirmationBanner email="otter@example.com" deadline={null} />)

    fireEvent.click(screen.getByRole("button", { name: "確認メールを送り直す" }))

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("確認メールを送信しました。メールをご確認ください。"))
    expect(resend).toHaveBeenCalledWith("otter@example.com")
  })

  it("送り直しに失敗したらエラーのトーストを出す", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {})
    resend.mockRejectedValue(new Error("リクエストが多すぎます"))
    render(<EmailConfirmationBanner email="otter@example.com" deadline={null} />)

    fireEvent.click(screen.getByRole("button", { name: "確認メールを送り直す" }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("確認メールを送れませんでした", { description: "リクエストが多すぎます" })
    )
  })

  it("閉じると表示しない", () => {
    render(<EmailConfirmationBanner email="otter@example.com" deadline={null} />)
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }))
    expect(screen.queryByRole("status")).toBeNull()
  })
})
