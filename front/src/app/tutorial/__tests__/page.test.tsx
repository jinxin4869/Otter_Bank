import { render, screen, fireEvent } from "@testing-library/react"
import TutorialPage from "@/app/tutorial/page"
import { useAuth } from "@/hooks/useAuth"

const push = jest.fn()

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
jest.mock("@/hooks/useAuth", () => ({ useAuth: jest.fn() }))

const mockUseAuth = useAuth as jest.Mock

// 「次へ」を押して最後のステップまで進める（ボタン名が変わっても止まるよう回数に上限を設ける）
const goToLastStep = () => {
  for (let i = 0; i < 20; i++) {
    const next = screen.queryByRole("button", { name: /次へ/ })
    if (!next) return
    fireEvent.click(next)
  }
}

describe("TutorialPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("ログイン済みなら最後のボタンが「マイページへ」になり、マイページへ移動する", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })
    render(<TutorialPage />)
    goToLastStep()

    fireEvent.click(screen.getByRole("button", { name: /マイページへ/ }))
    expect(push).toHaveBeenCalledWith("/dashboard")
  })

  it("未ログインなら最後のボタンは「アプリを始める」で、新規登録へ移動する", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })
    render(<TutorialPage />)
    goToLastStep()

    fireEvent.click(screen.getByRole("button", { name: /アプリを始める/ }))
    expect(push).toHaveBeenCalledWith("/register")
  })

  it("ログイン状態の確認中は最後のボタンを押せない", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true })
    render(<TutorialPage />)
    goToLastStep()

    const button = screen.getByRole("button", { name: /アプリを始める/ })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(push).not.toHaveBeenCalled()
  })
})
