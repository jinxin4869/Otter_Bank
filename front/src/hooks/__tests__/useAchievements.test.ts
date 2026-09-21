import { renderHook, act, waitFor } from "@testing-library/react"
import { useAchievements } from "@/hooks/useAchievements"
import { api } from "@/lib/api"

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ token: "test-token", isAuthenticated: true }),
}))
jest.mock("@/lib/api", () => ({
  api: { achievements: { list: jest.fn() } },
}))

const list = api.achievements.list as jest.Mock

const response = (unlocked: number, stage: string) => ({
  achievements: [],
  summary: {
    total_achievements: 20,
    unlocked_achievements: unlocked,
    progress_by_category: {},
    growth_stage: { stage, next_stage: null, achievements_to_next: null, progress_percentage: 100 },
  },
})

describe("useAchievements", () => {
  beforeEach(() => {
    list.mockReset()
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it("silent の再取得ではローディング表示にせずサマリーを更新する", async () => {
    list.mockResolvedValueOnce(response(2, "none"))
    const { result } = renderHook(() => useAchievements())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    list.mockResolvedValueOnce(response(3, "bronze"))
    await act(async () => {
      const promise = result.current.refetch({ silent: true })
      expect(result.current.isLoading).toBe(false)
      await promise
    })

    expect(result.current.achievementSummary?.growthStage.stage).toBe("bronze")
  })

  it("silent の再取得に失敗してもエラー状態にせず表示中のデータを保つ", async () => {
    list.mockResolvedValueOnce(response(2, "none"))
    const { result } = renderHook(() => useAchievements())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    list.mockRejectedValueOnce(new Error("network"))
    await act(async () => {
      await result.current.refetch({ silent: true })
    })

    expect(result.current.error).toBeNull()
    expect(result.current.achievementSummary?.growthStage.stage).toBe("none")
  })

  it("古いリクエストのレスポンスが新しい結果を上書きしない", async () => {
    let resolveOld: (v: unknown) => void = () => {}
    list.mockResolvedValueOnce(response(2, "none"))
    const { result } = renderHook(() => useAchievements())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    list.mockReturnValueOnce(new Promise((r) => (resolveOld = r)))
    list.mockResolvedValueOnce(response(8, "silver"))
    await act(async () => {
      const oldReq = result.current.refetch({ silent: true })
      await result.current.refetch({ silent: true })
      resolveOld(response(3, "bronze"))
      await oldReq
    })

    expect(result.current.achievementSummary?.growthStage.stage).toBe("silver")
  })
})
