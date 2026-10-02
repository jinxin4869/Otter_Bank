import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import DeleteAccountSection from "../_components/delete-account-section"
import ChangePasswordForm from "../_components/change-password-form"
import ProfileForm from "../_components/profile-form"
import ChangeEmailForm from "../_components/change-email-form"
import { toast } from "sonner"
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
    const confirmButton = screen.getByRole("button", { name: "退会を確定する" })

    expect(confirmButton).toBeDisabled()
    fireEvent.change(screen.getByLabelText("確認のため「退会」と入力"), { target: { value: "たいかい" } })
    expect(confirmButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText("確認のため「退会」と入力"), { target: { value: "退会" } })
    expect(confirmButton).toBeEnabled()
    fireEvent.click(confirmButton)
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1))
  })

  it("退会に失敗したらダイアログを開いたままにする", async () => {
    const onDelete = jest.fn().mockResolvedValue(false)
    render(<DeleteAccountSection onDelete={onDelete} />)
    await openDialog()
    fireEvent.change(screen.getByLabelText("確認のため「退会」と入力"), { target: { value: "退会" } })
    fireEvent.click(screen.getByRole("button", { name: "退会を確定する" }))

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

describe("ProfileForm", () => {
  const update = api.user.update as jest.Mock

  beforeEach(() => update.mockReset())

  it("保存に成功したらユーザー情報を取り直す", async () => {
    update.mockResolvedValue({})
    const onSaved = jest.fn()
    render(<ProfileForm token="t" initialUsername="otter" initialName="" onSaved={onSaved} />)
    fireEvent.change(screen.getByLabelText("ユーザー名"), { target: { value: "otter2" } })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(update).toHaveBeenCalledWith("t", { username: "otter2", name: "" })
  })

  it("保存に失敗したら取り直さない", async () => {
    update.mockRejectedValue(new Error("ユーザー名はすでに存在します"))
    const onSaved = jest.fn()
    render(<ProfileForm token="t" initialUsername="otter" initialName="" onSaved={onSaved} />)
    fireEvent.change(screen.getByLabelText("ユーザー名"), { target: { value: "taken" } })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    await waitFor(() => expect(update).toHaveBeenCalled())
    expect(onSaved).not.toHaveBeenCalled()
  })

  it("ユーザー名が 3 文字未満なら送らず、エラーを読み上げ可能に出す", async () => {
    render(<ProfileForm token="t" initialUsername="otter" initialName="" onSaved={jest.fn()} />)
    fireEvent.change(screen.getByLabelText("ユーザー名"), { target: { value: "ab" } })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("ユーザー名は3文字以上で入力してください")
    expect(screen.getByLabelText("ユーザー名")).toHaveAttribute("aria-invalid", "true")
    expect(update).not.toHaveBeenCalled()
  })
})

describe("ChangeEmailForm", () => {
  const update = api.user.update as jest.Mock
  const onRequested = jest.fn()

  beforeEach(() => {
    update.mockReset()
    onRequested.mockReset()
    jest.mocked(toast.success).mockClear()
  })

  const fill = (email: string, password = "current-pass") => {
    fireEvent.change(screen.getByLabelText("新しいメールアドレス"), { target: { value: email } })
    fireEvent.change(screen.getByLabelText("現在のパスワード"), { target: { value: password } })
    fireEvent.click(screen.getByRole("button", { name: "確認メールを送る" }))
  }

  it("新しいアドレスと現在のパスワードを送り、確認待ちのアドレスを取り直す", async () => {
    update.mockResolvedValue({})
    render(<ChangeEmailForm token="t" currentEmail="before@example.com" unconfirmedEmail={null} onRequested={onRequested} />)
    fill("after@example.com")

    await waitFor(() => expect(onRequested).toHaveBeenCalled())
    expect(update).toHaveBeenCalledWith("t", { email: "after@example.com", current_password: "current-pass" })
    expect(toast.success).toHaveBeenCalledWith("確認メールを送りました", expect.anything())
  })

  it("今と同じアドレスなら送らない", async () => {
    render(<ChangeEmailForm token="t" currentEmail="before@example.com" unconfirmedEmail={null} onRequested={onRequested} />)
    fill("before@example.com")

    expect(await screen.findByText("現在のメールアドレスと同じです")).toBeInTheDocument()
    expect(update).not.toHaveBeenCalled()
  })

  it("確認待ちのアドレスがあれば表示する", () => {
    render(
      <ChangeEmailForm
        token="t"
        currentEmail="before@example.com"
        unconfirmedEmail="after@example.com"
        onRequested={onRequested}
      />
    )
    expect(screen.getByText(/after@example.com への変更を確認待ちです/)).toBeInTheDocument()
  })
})
