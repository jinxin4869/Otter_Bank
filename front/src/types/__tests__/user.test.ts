import { parseAuthUser } from "@/types/user"

describe("parseAuthUser", () => {
  it("認証 API のユーザーをキャメルケースへ変換する", () => {
    expect(
      parseAuthUser({ id: 1, email: "dev@example.com", username: "devuser", name: null, last_sign_in_at: "2026-09-01T00:00:00Z" })
    ).toEqual({
      id: 1,
      email: "dev@example.com",
      username: "devuser",
      name: undefined,
      lastSignInAt: "2026-09-01T00:00:00Z",
      isAdmin: false,
      emailConfirmed: true,
      emailConfirmationDeadline: null,
    })
  })

  it("メールアドレスの確認状態と期限を読む", () => {
    const base = { id: 1, email: "a@b.c", username: "abc" }
    expect(
      parseAuthUser({ ...base, email_confirmed: false, email_confirmation_deadline: "2026-10-09T00:00:00Z" })
    ).toMatchObject({ emailConfirmed: false, emailConfirmationDeadline: "2026-10-09T00:00:00Z" })
    expect(parseAuthUser({ ...base, email_confirmed: true, email_confirmation_deadline: null })).toMatchObject({
      emailConfirmed: true,
      emailConfirmationDeadline: null,
    })
  })

  it("確認状態の項目が無ければ確認済みとして扱う（バナーを誤って出さない）", () => {
    expect(parseAuthUser({ id: 1, email: "a@b.c", username: "abc" })?.emailConfirmed).toBe(true)
  })

  it("admin が true のときだけ管理者として扱う", () => {
    const base = { id: 1, email: "a@b.c", username: "abc" }
    expect(parseAuthUser({ ...base, admin: true })?.isAdmin).toBe(true)
    expect(parseAuthUser({ ...base, admin: "true" })?.isAdmin).toBe(false)
    expect(parseAuthUser(base)?.isAdmin).toBe(false)
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
