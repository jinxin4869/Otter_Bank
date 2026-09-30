import { renderHook, waitFor, act } from "@testing-library/react"
import { useTransactions } from "@/hooks/useTransactions"
import { api } from "@/lib/api"

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("@/lib/api", () => ({
  api: { transactions: { list: jest.fn(), create: jest.fn(), monthlySummary: jest.fn() } },
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

    // 8 月はキャッシュ済みだったが、登録で変わりうるので取り直す
    rerender({ range: august })
    await waitFor(() => expect(list).toHaveBeenCalledTimes(3))
  })

  it("件数上限を超えたことを hasMore で伝える", async () => {
    list.mockResolvedValue({ transactions: [apiTx(1, "2026-09-10")], has_more: true })
    const { result } = renderHook(() => useTransactions("t", true, september))
    await waitFor(() => expect(result.current.hasMore).toBe(true))
  })
})
