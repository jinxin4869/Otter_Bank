import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import DeleteAccountSection from "../_components/delete-account-section"
import ChangePasswordForm from "../_components/change-password-form"
import { api } from "@/lib/api"

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("@/lib/api", () => ({ api: { user: { update: jest.fn(), destroy: jest.fn() } } }))

describe("DeleteAccountSection", () => {
  const openDialog = () => {
    fireEvent.click(screen.getByRole("button", { name: "退会する" }))
    return screen.findByRole("alertdialog")
  }

  it("確認欄に「退会」と入力するまで退会ボタンを押せない", async () => {
    const onDelete = jest.fn().mockResolvedValue(true)
    render(<DeleteAccountSection onDelete={onDelete} />)
    await openDialog()
    // 開くボタンとダイアログ内の確定ボタンが同じ名前なので、後者（最後）を使う
    const confirmButton = screen.getAllByRole("button", { name: "退会する" }).at(-1)!

    expect(confirmButton).toBeDisabled()
    fireEvent.change(screen.getByLabelText("確認"), { target: { value: "たいかい" } })
    expect(confirmButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText("確認"), { target: { value: "退会" } })
    expect(confirmButton).toBeEnabled()
    fireEvent.click(confirmButton)
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1))
  })

  it("退会に失敗したらダイアログを開いたままにする", async () => {
    const onDelete = jest.fn().mockResolvedValue(false)
    render(<DeleteAccountSection onDelete={onDelete} />)
    await openDialog()
    fireEvent.change(screen.getByLabelText("確認"), { target: { value: "退会" } })
    fireEvent.click(screen.getAllByRole("button", { name: "退会する" }).at(-1)!)

    await waitFor(() => expect(onDelete).toHaveBeenCalled())
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
  })
})

describe("ChangePasswordForm", () => {
  const update = api.user.update as jest.Mock

  beforeEach(() => update.mockReset())

  it("現在のパスワードと新しいパスワードを送る", async () => {
    update.mockResolvedValue({})
    render(<ChangePasswordForm token="t" />)
    fireEvent.change(screen.getByLabelText("現在のパスワード"), { target: { value: "current-pass" } })
    fireEvent.change(screen.getByLabelText("新しいパスワード"), { target: { value: "new-pass-123" } })
    fireEvent.change(screen.getByLabelText("新しいパスワード（確認）"), { target: { value: "new-pass-123" } })
    fireEvent.click(screen.getByRole("button", { name: "パスワードを変更" }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith("t", {
        current_password: "current-pass",
        password: "new-pass-123",
        password_confirmation: "new-pass-123",
      })
    )
  })

  it("確認用のパスワードが一致しなければ送らない", async () => {
    render(<ChangePasswordForm token="t" />)
    fireEvent.change(screen.getByLabelText("現在のパスワード"), { target: { value: "current-pass" } })
    fireEvent.change(screen.getByLabelText("新しいパスワード"), { target: { value: "new-pass-123" } })
    fireEvent.change(screen.getByLabelText("新しいパスワード（確認）"), { target: { value: "different-1" } })
    fireEvent.click(screen.getByRole("button", { name: "パスワードを変更" }))

    expect(await screen.findByText("パスワードが一致しません")).toBeInTheDocument()
    expect(update).not.toHaveBeenCalled()
  })
})
