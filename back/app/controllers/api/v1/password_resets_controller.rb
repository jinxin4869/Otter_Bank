# frozen_string_literal: true

module Api
  module V1
    class PasswordResetsController < ApplicationController
      def skip_authorization?
        true
      end

      # POST /api/v1/auth/reset-password
      # メールアドレスを受け取り、リセットリンクを送信する
      def request_reset
        user = User.find_by(email: params[:email])

        # ユーザーが存在しない場合も 200 を返す（メールアドレス列挙攻撃を防ぐ）
        if user
          token = user.generate_password_reset_token!
          UserMailer.password_reset(user, token).deliver_later
        end

        render json: { message: 'パスワードリセットのメールを送信しました。メールをご確認ください。' }, status: :ok
      end

      # POST /api/v1/auth/reset-password/confirm
      # トークンとパスワードを受け取り、パスワードを更新する
      def confirm_reset
        user = User.find_by(reset_password_token: params[:token])

        unless user&.password_reset_token_valid?
          render json: { error: 'リセットリンクが無効または期限切れです。再度リセット申請を行ってください。' }, status: :unprocessable_content
          return
        end

        if user.update(password: params[:password], password_confirmation: params[:password])
          user.clear_password_reset_token!
          render json: { message: 'パスワードをリセットしました。ログインしてください。' }, status: :ok
        else
          render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_content
        end
      end
    end
  end
end
