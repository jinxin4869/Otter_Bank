import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">利用規約</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-bold mb-2">1. 適用</h3>
            <p>
              この規約は、Otter Bank（以下「本サービス」）の利用に関する条件を定めます。
              本サービスを利用した方は、この規約と
              <Link href="/privacy" className="text-primary hover:underline">
                プライバシーポリシー
              </Link>
              に同意したものとみなします。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">2. 本サービスについて</h3>
            <p>
              本サービスは、家計の記録と振り返りを楽しく続けるための家計簿アプリです。
              ポートフォリオ目的で作成したもので、銀行・決済・投資助言などの実際の金融サービスを提供するものではありません。
              表示される金額や分析は、利用者が入力した内容に基づく目安です。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">3. アカウント</h3>
            <p>
              利用者は、自分のアカウントのメールアドレスとパスワードを自己の責任で管理してください。
              アカウントを第三者に使わせたり、譲り渡したりすることはできません。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">4. 禁止事項</h3>
            <p className="mb-2">本サービス（特に掲示板）で、次の行為をしてはいけません。</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>法令や公序良俗に反する行為</li>
              <li>他人への誹謗中傷、嫌がらせ、差別的な表現</li>
              <li>自分や他人の個人情報（氏名・住所・電話番号・口座番号など）を投稿すること</li>
              <li>宣伝・勧誘・スパム、同じ内容の繰り返し投稿</li>
              <li>不正アクセスや、本サービスの運営を妨げる行為</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">5. 投稿の取り扱い</h3>
            <p>
              掲示板の投稿・コメントは、ログインしていない人を含むすべての閲覧者に公開されます。
              運営者は、禁止事項に当たると判断した投稿・コメントを、予告なく削除することがあります。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">6. 退会</h3>
            <p>
              利用者は、設定画面の「退会」からいつでも退会できます。退会すると、アカウントと家計データ、掲示板の投稿などが削除されます。
              詳しくはプライバシーポリシーをご覧ください。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">7. サービスの変更・停止</h3>
            <p>
              運営者は、本サービスの内容を変更し、または提供を停止・終了することがあります。
              無料プランのサーバーを利用しているため、アクセスが少ない時間帯の後は表示に時間がかかる場合があります。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">8. 免責</h3>
            <p>
              運営者は、本サービスが常に利用できること、データが失われないことを保証しません。
              大切な記録は、必要に応じてご自身でも控えてください。
              本サービスの利用によって生じた損害について、運営者は、運営者の故意または重大な過失による場合を除き、責任を負いません。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">9. 規約の変更</h3>
            <p>
              運営者は、この規約を変更することがあります。変更した場合は、このページでお知らせし、お知らせした後に本サービスを利用した方は変更に同意したものとみなします。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">10. お問い合わせ</h3>
            <p>
              ご不明点は
              <Link href="/contact" className="text-primary hover:underline">
                お問い合わせフォーム
              </Link>
              からご連絡ください。
            </p>
          </section>

          <div className="text-sm text-muted-foreground text-right">
            <p>制定日: 2025年5月20日</p>
            <p>最終改定日: 2026年9月30日</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
