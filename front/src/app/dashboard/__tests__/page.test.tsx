import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import type { ReactNode } from "react"
import DashboardPage from "@/app/dashboard/page"
import { api } from "@/lib/api"

const refetch = jest.fn()
let summary: { growthStage: { stage: string } } | null = null

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock("next/dynamic", () => () => () => null)
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { lastSignInAt: null },
    token: "test-token",
    isLoading: false,
    isAuthenticated: true,
  }),
}))
jest.mock("@/hooks/useAchievements", () => ({
  useAchievements: () => ({ achievements: [], achievementSummary: summary, refetch }),
}))
jest.mock("@/lib/api", () => ({
  api: {
    transactions: { list: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), monthlySummary: jest.fn() },
  },
}))
jest.mock("@/components/tutorial", () => ({ Tutorial: () => null }))
// 日付の選択は Radix の Popover + カレンダー操作になるため、固定日を選ぶボタンに差し替える
jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
jest.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: { onSelect: (d: Date) => void }) => (
    <button type="button" onClick={() => onSelect(new Date(2020, 0, 15))}>
      2020-01-15 を選ぶ
    </button>
  ),
}))
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
const update = api.transactions.update as jest.Mock
const monthlySummary = api.transactions.monthlySummary as jest.Mock

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

describe("DashboardPage 取引の編集", () => {
  // 表示中の期間（今月）に入るよう、今日の日付の取引にする
  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const existing = { ...apiTransaction, id: 7, amount: 500, date: todayStr }

  beforeEach(() => {
    refetch.mockReset()
    update.mockReset()
    list.mockReset()
    list.mockResolvedValue({ transactions: [existing] })
    summary = null
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  const openEditDialog = async () => {
    render(<DashboardPage />)
    fireEvent.click(await screen.findByRole("button", { name: /を編集$/ }))
    return screen.findByRole("dialog")
  }

  it("編集ダイアログに現在の値が入り、保存すると PATCH して一覧を更新する", async () => {
    update.mockResolvedValue({
      transaction: { ...existing, amount: 1200 },
      newly_unlocked_achievements: [],
    })
    const dialog = await openEditDialog()
    const amountInput = dialog.querySelector("#edit-amount") as HTMLInputElement
    expect(amountInput.value).toBe("500")

    fireEvent.change(amountInput, { target: { value: "1200" } })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith("test-token", "7", {
        amount: 1200,
        transaction_type: "expense",
        category: "food",
        description: "",
        date: todayStr,
      })
    )
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    // 一覧の行が新しい金額に置き換わる（収支カードにも同じ金額が出るので、編集ボタンのある行の中で探す）
    const row = screen.getByRole("button", { name: /を編集$/ }).parentElement!
    expect(within(row).getByText("-1,200 円")).toBeInTheDocument()
  })

  it("編集・削除ボタンは行ごとに区別できる名前を持つ", async () => {
    render(<DashboardPage />)
    const [month, day] = [today.getMonth() + 1, today.getDate()]
    expect(await screen.findByRole("button", { name: `${month}月${day}日の食費を編集` })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: `${month}月${day}日の食費を削除` })).toBeInTheDocument()
  })

  it("表示中の期間の外へ日付を移したら、そのことをトーストで伝える", async () => {
    update.mockImplementation(async (_t: string, _id: string, params: { date: string }) => ({
      transaction: { ...existing, date: params.date },
      newly_unlocked_achievements: [],
    }))
    const { toast } = jest.requireMock("sonner") as { toast: { success: jest.Mock } }
    toast.success.mockClear()
    const dialog = await openEditDialog()

    fireEvent.click(within(dialog).getByRole("button", { name: "2020-01-15 を選ぶ" }))
    fireEvent.click(within(dialog).getByRole("button", { name: "保存" }))

    await waitFor(() => expect(update).toHaveBeenCalledWith("test-token", "7", expect.objectContaining({ date: "2020-01-15" })))
    expect(toast.success).toHaveBeenCalledWith("取引を更新しました", { description: "表示中の期間の外に移動しました" })
  })

  it("更新に失敗したらダイアログを閉じない", async () => {
    update.mockRejectedValue(new Error("サーバーエラー"))
    await openEditDialog()
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    await waitFor(() => expect(update).toHaveBeenCalled())
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("更新で実績が解除されたら silent で再取得する", async () => {
    update.mockResolvedValue({ transaction: existing, newly_unlocked_achievements: [unlocked] })
    await openEditDialog()
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    await waitFor(() => expect(refetch).toHaveBeenCalledWith({ silent: true }))
  })
})

describe("DashboardPage 期間ごとの取得", () => {
  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const thisMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`

  beforeEach(() => {
    list.mockReset()
    monthlySummary.mockReset()
    list.mockResolvedValue({ transactions: [], has_more: false })
    monthlySummary.mockResolvedValue([])
    summary = null
  })

  it("表示中の月の初日から末日までを指定して取得する", async () => {
    render(<DashboardPage />)
    await waitFor(() => expect(list).toHaveBeenCalled())
    const [, range] = list.mock.calls[0]
    expect(range.startDate).toBe(`${thisMonth}-01`)
    expect(range.endDate.startsWith(thisMonth)).toBe(true)
  })

  it("前の月へ移ると、その月を取得する", async () => {
    render(<DashboardPage />)
    await waitFor(() => expect(list).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole("button", { name: "前へ" }))
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2))
    expect(list.mock.calls[1][1].startDate).not.toBe(`${thisMonth}-01`)
  })

  it("カワウソの気分は、表示中の期間ではなく今月の集計で決める", async () => {
    monthlySummary.mockResolvedValue([{ month: thisMonth, income: 1000, expense: 5000 }])
    render(<DashboardPage />)
    expect(await screen.findByAltText("心配しているカワウソ")).toBeInTheDocument()
  })

  it("件数上限で一部しか受け取れなかったときは、そのことを表示する", async () => {
    list.mockResolvedValue({ transactions: [], has_more: true })
    render(<DashboardPage />)
    expect(await screen.findByRole("status")).toHaveTextContent("一部だけを表示しています")
  })
})
