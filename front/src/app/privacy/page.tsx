import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// 内容は実装に合わせる。収集する項目・預託先・保存するキーを変えたら、ここと改定日も更新する
export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">プライバシーポリシー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            Otter Bank（以下「本サービス」）の運営者（以下「運営者」）は、利用者の情報を次のとおり取り扱います。
          </p>

          <section>
            <h3 className="text-xl font-bold mb-2">1. 収集する情報</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>アカウント情報: メールアドレス、ユーザー名、表示名、パスワード（復元できない形に変換して保存し、元のパスワードは保存しません）</li>
              <li>家計データ: 取引の金額・種別（収入／支出）・カテゴリ・日付・メモ、予算、貯金目標、実績の進捗</li>
              <li>掲示板のデータ: 投稿・コメントの内容、いいね、ブックマーク</li>
              <li>お問い合わせの内容: お名前、メールアドレス、お問い合わせの種類と内容</li>
              <li>利用状況: 最後にログインした日時（しばらくぶりのログインでカワウソの表示を変えるために使います）</li>
              <li>接続元の IP アドレス: 短時間に大量のリクエストを送る不正利用を防ぐため、一時的に回数の計算に使います</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">2. Google アカウントでのログイン</h3>
            <p>
              Google アカウントでログインする場合、Google からメールアドレス、名前、Google アカウントの識別子を受け取ります。
              これらはアカウントの作成とログインにのみ使い、Google のアクセストークンは保存しません。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">3. 利用目的</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>家計簿・実績・掲示板など、本サービスの機能を提供するため</li>
              <li>ログイン状態を保つため</li>
              <li>パスワード再設定のメールを送るため</li>
              <li>お問い合わせに回答するため</li>
              <li>不正な利用を防ぎ、本サービスを安全に運営するため</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">4. 第三者への提供・預託</h3>
            <p className="mb-2">
              法令に基づく場合を除き、利用者の同意なく個人情報を第三者に提供することはありません。
              ただし、本サービスの運営に必要な範囲で、次の事業者のサービスを利用しており、情報がこれらの事業者の設備に保存・送信されます。
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Vercel（画面の配信）</li>
              <li>Render（API サーバーの運用）</li>
              <li>Neon（データベース。上記 1 の情報を保存します）</li>
              <li>メール送信事業者（パスワード再設定メール・お問い合わせの通知の送信）</li>
              <li>Google（Google アカウントでのログインを利用する場合）</li>
              <li>UptimeRobot（稼働状況の監視。本サービスの URL に定期的にアクセスするだけで、利用者の情報は送りません）</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">5. Cookie とブラウザへの保存</h3>
            <p className="mb-2">本サービスは、広告や行動分析のための Cookie を使いません。ログインと表示のために次の情報を保存します。</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cookie: ログイン状態を更新するためのトークン（JavaScript から読めない形で保存し、14 日で失効します）</li>
              <li>
                ブラウザのローカルストレージ: ログイン用のトークン（30 分で失効）、ログイン中かどうか、ログインしたメールアドレス、チュートリアルを見たかどうか、画面のテーマ（ライト／ダーク）
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">6. 掲示板への投稿</h3>
            <p>
              掲示板の投稿・コメントとユーザー名は、ログインしていない人を含むすべての閲覧者に公開されます。
              家計の具体的な金額や、個人を特定できる情報の投稿にはご注意ください。
              利用規約に反する投稿・コメントは、運営者が削除することがあります。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">7. 退会とデータの削除</h3>
            <p>
              設定画面の「退会」から、いつでもアカウントを削除できます。
              退会すると、アカウント情報、家計データ、掲示板の投稿・コメント・いいね・ブックマークを削除し、元に戻すことはできません。
              ただし、障害に備えたデータベースのバックアップからは、一定期間が経過したのちに消去されます。
              お問い合わせの内容は、回答のために保存しているため、退会後も残ります。削除を希望する場合はお問い合わせください。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">8. お問い合わせ</h3>
            <p>
              本ポリシーや、ご自身の情報の開示・訂正・削除については、
              <Link href="/contact" className="text-primary hover:underline">
                お問い合わせフォーム
              </Link>
              からご連絡ください。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">9. 改定</h3>
            <p>本ポリシーは、本サービスの変更に合わせて改定することがあります。改定した場合は、このページでお知らせします。</p>
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
