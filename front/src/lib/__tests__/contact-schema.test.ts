import { contactSchema } from "@/lib/schemas/auth"
import { CONTACT_MESSAGE_MAX_LENGTH } from "@/lib/text-limits"

const valid = { name: "山田", email: "a@example.com", subject: "question", message: "内容" }

describe("contactSchema のお問い合わせ内容", () => {
  it("上限ちょうどの文字数は通す", () => {
    expect(contactSchema.safeParse({ ...valid, message: "あ".repeat(CONTACT_MESSAGE_MAX_LENGTH) }).success).toBe(true)
  })

  it("上限を超えると日本語のエラーを返す", () => {
    const result = contactSchema.safeParse({ ...valid, message: "あ".repeat(CONTACT_MESSAGE_MAX_LENGTH + 1) })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("お問い合わせ内容は5,000文字以内で入力してください")
  })
})
