import { renderHook, waitFor, act } from "@testing-library/react"
import { useTransactions } from "@/hooks/useTransactions"
import { api } from "@/lib/api"

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("@/lib/api", () => ({
  api: { transactions: { list: jest.fn(), create: jest.fn(), delete: jest.fn(), monthlySummary: jest.fn() } },
}))

const list = api.transactions.list as jest.Mock
const create = api.transactions.create as jest.Mock
const monthlySummary = api.transactions.monthlySummary as jest.Mock

const apiTx = (id: number, date: string) => ({
  id, amount: 100, transaction_type: "expense", category: "food", description: "", date,
})
const september = { startDate: "2026-09-01", endDate: "2026-09-30" }
const august = { startDate: "2026-08-01", endDate: "2026-08-31" }

describe("useTransactions の期間ごとの取得", () => {
  beforeEach(() => {
    list.mockReset()
    create.mockReset()
    monthlySummary.mockReset()
    monthlySummary.mockResolvedValue([{ month: "2026-09", income: "3000.0", expense: 500 }])
  })

  it("期間を指定して取得し、月ごとの集計は数値にして持つ", async () => {
    list.mockResolvedValue({ transactions: [apiTx(1, "2026-09-10")], has_more: false })
    const { result } = renderHook(() => useTransactions("t", true, september))

    await waitFor(() => expect(result.current.transactions).toHaveLength(1))
    expect(list).toHaveBeenCalledWith("t", september)
    await waitFor(() => expect(result.current.monthlySummary).toEqual([{ month: "2026-09", income: 3000, expense: 500 }]))
  })

  it("一度取得した期間に戻ったときは取り直さない", async () => {
    list.mockImplementation(async (_t: string, range: { startDate: string }) => ({
      transactions: [apiTx(range.startDate === "2026-09-01" ? 1 : 2, range.startDate)],
      has_more: false,
    }))
    const { result, rerender } = renderHook(({ range }) => useTransactions("t", true, range), {
      initialProps: { range: september },
    })
    await waitFor(() => expect(result.current.transactions[0]?.id).toBe("1"))

    rerender({ range: august })
    await waitFor(() => expect(result.current.transactions[0]?.id).toBe("2"))

    rerender({ range: { ...september } }) // 同じ期間（別オブジェクト）
    await waitFor(() => expect(result.current.transactions[0]?.id).toBe("1"))
    expect(list).toHaveBeenCalledTimes(2)
  })

  it("古い期間の応答が後から返っても上書きしない", async () => {
    let resolveOld: (v: unknown) => void = () => {}
    list.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve }))
    list.mockResolvedValueOnce({ transactions: [apiTx(2, "2026-08-10")], has_more: false })
    const { result, rerender } = renderHook(({ range }) => useTransactions("t", true, range), {
      initialProps: { range: september },
    })

    rerender({ range: august })
    await waitFor(() => expect(result.current.transactions[0]?.id).toBe("2"))

    await act(async () => {
      resolveOld({ transactions: [apiTx(1, "2026-09-10")], has_more: false })
    })
    expect(result.current.transactions.map((t) => t.id)).toEqual(["2"])
  })

  it("登録したら月ごとの集計を取り直し、他の期間のキャッシュは捨てる", async () => {
    list.mockResolvedValue({ transactions: [], has_more: false })
    create.mockResolvedValue({ transaction: apiTx(9, "2026-08-20"), newly_unlocked_achievements: [] })
    const { result, rerender } = renderHook(({ range }) => useTransactions("t", true, range), {
      initialProps: { range: august },
    })
    await waitFor(() => expect(list).toHaveBeenCalledTimes(1))
    rerender({ range: september })
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2))
    const summaryCalls = monthlySummary.mock.calls.length

    await act(async () => {
      await result.current.addTransaction({
        amount: 100, transaction_type: "expense", category: "food", description: "", date: "2026-08-20",
      })
    })
    await waitFor(() => expect(monthlySummary.mock.calls.length).toBe(summaryCalls + 1))
    // 表示中の 9 月も取り直す
    await waitFor(() => expect(list).toHaveBeenCalledTimes(3))
    expect(list).toHaveBeenLastCalledWith("t", september)

    // 8 月はキャッシュ済みだったが、登録で変わりうるので取り直す
    rerender({ range: august })
    await waitFor(() => expect(list).toHaveBeenCalledTimes(4))
    expect(list).toHaveBeenLastCalledWith("t", august)
  })

  it("件数上限を超えたことを hasMore で伝える", async () => {
    list.mockResolvedValue({ transactions: [apiTx(1, "2026-09-10")], has_more: true })
    const { result } = renderHook(() => useTransactions("t", true, september))
    await waitFor(() => expect(result.current.hasMore).toBe(true))
  })
})

describe("useTransactions の合計と変更後の整合", () => {
  beforeEach(() => {
    list.mockReset()
    create.mockReset()
    ;(api.transactions.delete as jest.Mock).mockReset()
    monthlySummary.mockReset()
    monthlySummary.mockResolvedValue([])
  })

  const summaryOf = (income: number, expense: number) => ({
    total_income: String(income), total_expense: String(expense), balance: String(income - expense),
  })

  it("サーバーが期間全体で出した合計を数値で返す", async () => {
    list.mockResolvedValue({ transactions: [apiTx(1, "2026-09-10")], has_more: true, summary: summaryOf(5000, 1200) })
    const { result } = renderHook(() => useTransactions("t", true, september))
    await waitFor(() => expect(result.current.summary).toEqual({ income: 5000, expense: 1200, balance: 3800 }))
  })

  it("変更前に出した取得の応答が後から返っても、変更後の一覧を上書きしない", async () => {
    let resolveOld: (v: unknown) => void = () => {}
    list.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve }))
    list.mockResolvedValue({ transactions: [apiTx(9, "2026-09-20")], has_more: false, summary: summaryOf(0, 100) })
    create.mockResolvedValue({ transaction: apiTx(9, "2026-09-20"), newly_unlocked_achievements: [] })
    const { result } = renderHook(() => useTransactions("t", true, september))

    await act(async () => {
      await result.current.addTransaction({
        amount: 100, transaction_type: "expense", category: "food", description: "", date: "2026-09-20",
      })
    })
    // 変更前の取得（登録した取引を含まない）が遅れて返ってくる
    await act(async () => {
      resolveOld({ transactions: [], has_more: false, summary: summaryOf(0, 0) })
    })
    await waitFor(() => expect(result.current.summary).toEqual({ income: 0, expense: 100, balance: -100 }))
    expect(result.current.transactions.map((t) => t.id)).toEqual(["9"])
  })

  it("削除したらその場で一覧から消し、合計は取り直すまで一覧から計算させる（null）", async () => {
    list.mockResolvedValueOnce({ transactions: [apiTx(1, "2026-09-10")], has_more: false, summary: summaryOf(0, 100) })
    let resolveReload: (v: unknown) => void = () => {}
    list.mockImplementationOnce(() => new Promise((resolve) => { resolveReload = resolve }))
    ;(api.transactions.delete as jest.Mock).mockResolvedValue(undefined)
    const { result } = renderHook(() => useTransactions("t", true, september))
    await waitFor(() => expect(result.current.transactions).toHaveLength(1))

    await act(async () => {
      await result.current.deleteTransaction("1")
    })
    expect(result.current.transactions).toHaveLength(0)
    expect(result.current.summary).toBeNull()
    expect(result.current.isLoading).toBe(false) // 取り直し中も読み込み表示は出さない

    await act(async () => {
      resolveReload({ transactions: [], has_more: false, summary: summaryOf(0, 0) })
    })
    expect(result.current.summary).toEqual({ income: 0, expense: 0, balance: 0 })
  })

  it("未取得の期間へ切り替えたら、前の期間の hasMore と合計を残さない", async () => {
    list.mockResolvedValueOnce({ transactions: [], has_more: true, summary: summaryOf(1, 1) })
    list.mockImplementationOnce(() => new Promise(() => {}))
    const { result, rerender } = renderHook(({ range }) => useTransactions("t", true, range), {
      initialProps: { range: september },
    })
    await waitFor(() => expect(result.current.hasMore).toBe(true))

    rerender({ range: august })
    await waitFor(() => expect(result.current.isLoading).toBe(true))
    expect(result.current.hasMore).toBe(false)
    expect(result.current.summary).toBeNull()
  })
})
