import { parseAuthUser } from "@/types/user"

describe("parseAuthUser", () => {
  it("認証 API のユーザーをキャメルケースへ変換する", () => {
    expect(
      parseAuthUser({ id: 1, email: "dev@example.com", username: "devuser", name: null, last_sign_in_at: "2026-09-01T00:00:00Z" })
    ).toEqual({ id: 1, email: "dev@example.com", username: "devuser", name: undefined, lastSignInAt: "2026-09-01T00:00:00Z" })
  })

  it("{ user: ... } で包まれたレスポンスも受け付ける", () => {
    expect(parseAuthUser({ user: { id: 2, email: "a@b.c", username: "abc" } })).toMatchObject({ id: 2, lastSignInAt: null })
  })

  it.each([null, undefined, "x", {}, { id: "1", email: "a@b.c", username: "abc" }, { id: 1, username: "abc" }])(
    "不正な値 %p は null を返す",
    (value) => {
      expect(parseAuthUser(value)).toBeNull()
    }
  )
})
