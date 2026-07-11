import { render, screen } from "@testing-library/react"
import OtterAnimation, { type OtterMood } from "@/components/otter-animation"

// 各 mood ごとのセリフ候補（コンポーネント側の MOOD_MESSAGES と対応）
const MOOD_MESSAGES: Record<OtterMood, string[]> = {
  happy: [
    "お金が貯まってきたね！このまま頑張ろう！",
    "いい調子だよ！貯金が増えてきたね🦦",
    "順調そのもの！この調子でいこう！",
    "やったね、黒字だよ！えらいえらい！",
  ],
  neutral: [
    "収支のバランスが取れているよ。もう少し節約できるといいね！",
    "まずまずかな。無理なく続けていこう！",
    "悪くないバランスだね。この調子でいこう。",
    "今のところ安定してるよ。油断は禁物！",
  ],
  sad: [
    "支出が多いみたい...節約を心がけよう。",
    "ちょっと使いすぎかも？一緒に見直そう。",
    "うーん、今月は赤字だね...次は頑張ろう。",
    "お財布がさみしそう...無駄遣いに気をつけて。",
  ],
  excited: [
    "やったー！実績解除だよ！すごいすごい！🎉",
    "おめでとう！新しいバッジをゲットしたね！",
    "うわーい！また一つ達成したね！最高！",
    "きみは本当にすごいよ！どんどんいこう！",
  ],
  sleeping: [
    "すぴー...zzz",
    "ふぁ...おかえり。ちょっとうたた寝してたよ...",
    "んん...久しぶりだね。会いたかったよ。",
    "zzz...あ、起きた！また一緒に頑張ろう！",
  ],
}

describe("OtterAnimation", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("mood に対応したセリフ候補のいずれかを表示する", () => {
    render(<OtterAnimation mood="happy" />)
    const message = screen.getByText((_, el) => el?.tagName === "P")
    expect(MOOD_MESSAGES.happy).toContain(message.textContent)
  })

  it("Math.random の値に応じてセリフを選択する", () => {
    // 0.99 を返すようにモックし、プールの最後の要素が選ばれることを検証する
    jest.spyOn(Math, "random").mockReturnValue(0.99)
    render(<OtterAnimation mood="sad" />)
    const lastMessage = MOOD_MESSAGES.sad[MOOD_MESSAGES.sad.length - 1]
    expect(screen.getByText(lastMessage)).toBeInTheDocument()
  })

  it("Math.random が 0 のときプールの先頭のセリフを選択する", () => {
    jest.spyOn(Math, "random").mockReturnValue(0)
    render(<OtterAnimation mood="excited" />)
    expect(screen.getByText(MOOD_MESSAGES.excited[0])).toBeInTheDocument()
  })

  it("customMessage が指定された場合はランダム選択せずそのメッセージを表示する", () => {
    // random をモックしてもランダム選択されないことを確認する
    jest.spyOn(Math, "random").mockReturnValue(0.99)
    render(<OtterAnimation mood="happy" customMessage="カスタムメッセージだよ！" />)
    expect(screen.getByText("カスタムメッセージだよ！")).toBeInTheDocument()
  })

  it("mood に応じたカワウソ画像を表示する", () => {
    render(<OtterAnimation mood="neutral" />)
    const image = screen.getByAltText("Otter feeling neutral")
    expect(image).toBeInTheDocument()
  })
})
