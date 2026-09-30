import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import DashboardPage from "@/app/dashboard/page"
import { api } from "@/lib/api"

const refetch = jest.fn()
let summary: { growthStage: { stage: string } } | null = null

const push = jest.fn()
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
jest.mock("next/dynamic", () => () => () => null)
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
type AuthState = {
  user: { lastSignInAt: null } | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  hasLoggedOut: boolean
}
const signedIn: AuthState = {
  user: { lastSignInAt: null },
  token: "test-token",
  isLoading: false,
  isAuthenticated: true,
  hasLoggedOut: false,
}
let authState: AuthState = signedIn
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => authState }))
jest.mock("@/hooks/useAchievements", () => ({
  useAchievements: () => ({ achievements: [], achievementSummary: summary, refetch }),
}))
jest.mock("@/lib/api", () => ({
  api: { transactions: { list: jest.fn(), create: jest.fn(), delete: jest.fn() } },
}))
jest.mock("@/components/tutorial", () => ({ Tutorial: () => null }))
jest.mock("@/components/achievement-unlock-modal", () => ({ AchievementUnlockModal: () => null }))
// Radix の Select は jsdom で操作しづらいため、ネイティブの select に差し替える
jest.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: ReactNode }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      <option value="" />
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ value }: { value: string }) => <option value={value}>{value}</option>,
}))

const create = api.transactions.create as jest.Mock
const list = api.transactions.list as jest.Mock

const apiTransaction = {
  id: 1, amount: 500, description: "", transaction_type: "expense", category: "food",
  date: "2026-09-21", created_at: "2026-09-21T00:00:00Z", updated_at: "2026-09-21T00:00:00Z",
}
const unlocked = {
  id: 1, title: "はじめての貯金", description: "d", tier: "bronze", category: "savings", reward: "", image_url: null,
}

const submitTransaction = async () => {
  const { container } = render(<DashboardPage />)
  await waitFor(() => expect(list).toHaveBeenCalled())
  fireEvent.change(container.querySelector("#amount")!, { target: { value: "500" } })
  // 取引フォームのカテゴリ選択（food の option を持つ select）
  const categorySelect = Array.from(container.querySelectorAll("select")).find((el) =>
    el.querySelector('option[value="food"]')
  )!
  fireEvent.change(categorySelect, { target: { value: "food" } })
  fireEvent.click(screen.getByRole("button", { name: /登録|追加|保存/ }))
  return container
}

describe("DashboardPage 実績解除後の再取得", () => {
  beforeEach(() => {
    refetch.mockReset()
    create.mockReset()
    list.mockReset()
    list.mockResolvedValue({ transactions: [] })
    summary = { growthStage: { stage: "bronze" } }
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it("実績が解除されたら silent で再取得する", async () => {
    create.mockResolvedValue({ transaction: apiTransaction, newly_unlocked_achievements: [unlocked] })
    await submitTransaction()
    await waitFor(() => expect(refetch).toHaveBeenCalledWith({ silent: true }))
  })

  it("実績が解除されなければ再取得しない", async () => {
    create.mockResolvedValue({ transaction: apiTransaction, newly_unlocked_achievements: [] })
    await submitTransaction()
    await waitFor(() => expect(create).toHaveBeenCalled())
    expect(refetch).not.toHaveBeenCalled()
  })

  it("取得済みの成長ステージをカワウソへ渡す", async () => {
    const { container } = render(<DashboardPage />)
    await waitFor(() => expect(list).toHaveBeenCalled())
    expect(container.querySelector("[data-growth-stage]")).toHaveAttribute("data-growth-stage", "bronze")
  })

  it("実績サマリー未取得の間は成長ステージを渡さない", async () => {
    summary = null
    const { container } = render(<DashboardPage />)
    await waitFor(() => expect(list).toHaveBeenCalled())
    expect(container.querySelector("[data-growth-stage]")).toBeNull()
  })
})

describe("DashboardPage 未ログイン時の遷移", () => {
  const signedOut = { user: null, token: null, isLoading: false, isAuthenticated: false }

  beforeEach(() => {
    push.mockReset()
    list.mockReset()
  })

  afterEach(() => {
    authState = signedIn
  })

  it("未ログインで来たらログイン画面へ移動する", async () => {
    authState = { ...signedOut, hasLoggedOut: false }
    render(<DashboardPage />)
    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"))
  })

  it("自分でログアウトした直後はログイン画面へ移動しない（遷移先は useAuth がトップにする）", async () => {
    authState = { ...signedOut, hasLoggedOut: true }
    render(<DashboardPage />)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(push).not.toHaveBeenCalledWith("/login")
  })
})
