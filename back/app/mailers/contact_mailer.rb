# frozen_string_literal: true

class ContactMailer < ApplicationMailer
  # お問い合わせ受信時にユーザーへ自動返信メールを送信する
  def confirmation(contact)
    @contact = contact
    mail(
      to: contact.email,
      subject: '【Otter Bank】お問い合わせを受け付けました'
    )
  end

  # 運営（CONTACT_NOTIFY_TO）へ新着のお問い合わせを知らせる。reply_to を送信者にして、そのまま返信できるようにする
  def notify_admin(contact)
    @contact = contact
    mail(
      to: ENV.fetch('CONTACT_NOTIFY_TO', nil),
      reply_to: contact.email,
      subject: "【Otter Bank】新しいお問い合わせ ##{contact.id}（#{Contact::SUBJECT_LABELS.fetch(contact.subject)}）"
    )
  end
end
