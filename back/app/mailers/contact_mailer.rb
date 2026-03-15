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
end
