/**
 * @jest-environment node
 */
import { renderToStaticMarkup } from "react-dom/server"
import RootLayout from "@/app/layout"

jest.mock("@/components/header", () => ({ __esModule: true, default: () => <header /> }))
jest.mock("@/components/footer", () => ({ __esModule: true, default: () => <footer /> }))
jest.mock("@/components/ui/sonner", () => ({ Toaster: () => <div data-testid="toaster" /> }))

describe("RootLayout", () => {
  it("トースト通知用の Toaster をマウントする", () => {
    const html = renderToStaticMarkup(<RootLayout>本文</RootLayout>)
    expect(html).toContain('data-testid="toaster"')
    expect(html).toContain("本文")
  })
})
