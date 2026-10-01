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
end
