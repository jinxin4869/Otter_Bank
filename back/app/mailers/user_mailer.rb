# frozen_string_literal: true

class UserMailer < ApplicationMailer
  def password_reset(user, reset_token)
    @user = user
    @reset_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}/reset-password/#{reset_token}"
    mail(to: @user.email, subject: '【獺獺銀行】パスワードリセットのご案内')
  end
end
