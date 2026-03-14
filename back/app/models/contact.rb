# frozen_string_literal: true

class Contact < ApplicationRecord
  enum :status, { pending: 0, resolved: 1 }

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :subject, presence: true
  validates :message, presence: true
end
