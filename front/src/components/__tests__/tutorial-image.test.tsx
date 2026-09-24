import { render, act } from "@testing-library/react"
import { Tutorial } from "@/components/tutorial"

describe("Tutorial の画像", () => {
  it("存在しないプレースホルダー画像を読み込まない", () => {
    jest.useFakeTimers()
    localStorage.clear()
    render(<Tutorial />)
    act(() => {
      jest.advanceTimersByTime(1500)
    })
    const images = Array.from(document.querySelectorAll("img"))
    expect(images.some((img) => (img.getAttribute("src") ?? "").includes("placeholder.svg"))).toBe(false)
    jest.useRealTimers()
  })
})
