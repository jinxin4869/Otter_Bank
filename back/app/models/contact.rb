# frozen_string_literal: true

class Contact < ApplicationRecord
  enum :status, { pending: 0, resolved: 1 }

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  # 画面の「お問い合わせ種類」の選択肢（front/src/app/contact/page.tsx と揃える）。運営宛メールの件名に使う
  SUBJECT_LABELS = {
    'question' => 'ご質問・ご相談',
    'feedback' => 'ご意見・ご感想',
    'bug' => '不具合の報告',
    'feature' => '機能リクエスト',
    'other' => 'その他'
  }.freeze

  validates :subject, presence: true, inclusion: { in: SUBJECT_LABELS.keys }
  validates :message, presence: true
end
