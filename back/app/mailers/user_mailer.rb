# frozen_string_literal: true

class UserMailer < ApplicationMailer
  def password_reset(user, reset_token)
    @user = user
    @reset_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}/reset-password/#{reset_token}"
    mail(to: @user.email, subject: '【獺獺銀行】パスワードリセットのご案内')
  end

  # トークンは署名付きで DB に保存しないため、送るときにここで作る。
  # トークンには / や + が入りうるので、URL のパスに入れるときはエンコードする
  def email_confirmation(user)
    @user = user
    token = ERB::Util.url_encode(user.generate_token_for(:email_confirmation))
    @confirm_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}/confirm-email/#{token}"
    @deadline = user.email_confirmation_deadline
    mail(to: @user.email, subject: '【獺獺銀行】メールアドレスの確認のお願い')
  end

  # メールアドレスの変更の確認。新しいアドレスに送り、リンクを開くまで email は変えない。
  # 送る前に変更が確定・取り消されていたら（unconfirmed_email が空なら）送らない
  def email_change_confirmation(user)
    return if user.unconfirmed_email.blank?

    @user = user
    token = ERB::Util.url_encode(user.generate_token_for(:email_change))
    @confirm_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}/confirm-email-change/#{token}"
    mail(to: user.unconfirmed_email, subject: '【獺獺銀行】新しいメールアドレスの確認のお願い')
  end

  # 今のアドレスへのお知らせ。本人が申請していなければ、パスワードを変えてもらう（乗っ取りに気づけるように）
  def email_change_requested(user)
    return if user.unconfirmed_email.blank?

    @user = user
    @new_email = user.unconfirmed_email
    @reset_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}/reset-password"
    mail(to: user.email, subject: '【獺獺銀行】メールアドレスの変更が申請されました')
  end
end
