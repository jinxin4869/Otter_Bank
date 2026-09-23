# frozen_string_literal: true

module ExceptionHandler
  extend ActiveSupport::Concern

  class InvalidToken < StandardError; end

  # 例外メッセージ（モデル名・ID・内部の詳細を含みうる）はレスポンスに埋め込まず、
  # 開発環境のログにだけ出す
  included do
    rescue_from ActiveRecord::RecordNotFound do |e|
      log_exception(e)
      render json: { error: 'リソースが見つかりません' }, status: :not_found
    end

    rescue_from ActiveRecord::RecordInvalid do |e|
      log_exception(e)
      # 検証メッセージはユーザー向けの内容なので、各コントローラーと同じ形で返す
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
    end

    rescue_from ExceptionHandler::InvalidToken do |e|
      log_exception(e)
      render json: { error: '認証に失敗しました' }, status: :unauthorized
    end
  end

  private

  def log_exception(error)
    Rails.logger.warn("#{error.class}: #{error.message}") if Rails.env.development?
  end
end
