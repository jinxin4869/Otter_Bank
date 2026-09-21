import { render } from "@testing-library/react"
import type { CSSProperties } from "react"
import { Toaster } from "@/components/ui/sonner"

let capturedStyle: CSSProperties | undefined

jest.mock("next-themes", () => ({ useTheme: () => ({ theme: "light" }) }))
jest.mock("sonner", () => ({
  Toaster: ({ style }: { style?: CSSProperties }) => {
    capturedStyle = style
    return null
  },
}))

describe("Toaster", () => {
  it("globals.css の HSL 数値変数を hsl() で包んで色として渡す", () => {
    render(<Toaster />)
    const vars = capturedStyle as Record<string, string>
    expect(vars["--normal-bg"]).toBe("hsl(var(--popover))")
    expect(vars["--normal-text"]).toBe("hsl(var(--popover-foreground))")
    expect(vars["--normal-border"]).toBe("hsl(var(--border))")
  })
})
