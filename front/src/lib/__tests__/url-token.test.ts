import { decodeUrlToken } from "@/lib/url-token"

describe("decodeUrlToken", () => {
  it("URL エンコードされたトークンを戻す", () => {
    expect(decodeUrlToken("eyJh%2Fb%2Bc%3D%3D--sig")).toBe("eyJh/b+c==--sig")
  })

  it("すでに戻されたトークンはそのまま返す", () => {
    expect(decodeUrlToken("eyJh/b+c==--sig")).toBe("eyJh/b+c==--sig")
  })

  it("戻せない値はそのまま返す", () => {
    expect(decodeUrlToken("%E0%A4%A")).toBe("%E0%A4%A")
  })
})
