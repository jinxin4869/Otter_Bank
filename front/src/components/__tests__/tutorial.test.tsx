import { render, screen, act } from "@testing-library/react"
import { Tutorial } from "@/components/tutorial"

describe("Tutorial", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => jest.useRealTimers())

  const showsTutorial = () => screen.queryByText("獭獭銀行へようこそ！") !== null

  const renderAndWait = () => {
    render(<Tutorial />)
    act(() => {
      jest.advanceTimersByTime(1500)
    })
  }

  it("tutorialSeen が未設定なら表示する", () => {
    renderAndWait()
    expect(showsTutorial()).toBe(true)
  })

  it("登録直後に保存される tutorialSeen=false でも表示する", () => {
    localStorage.setItem("tutorialSeen", "false")
    renderAndWait()
    expect(showsTutorial()).toBe(true)
  })

  it("tutorialSeen=true なら表示しない", () => {
    localStorage.setItem("tutorialSeen", "true")
    renderAndWait()
    expect(showsTutorial()).toBe(false)
  })
})
