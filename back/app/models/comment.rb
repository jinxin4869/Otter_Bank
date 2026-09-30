# frozen_string_literal: true

class Comment < ApplicationRecord
  belongs_to :post
  belongs_to :user
  has_many :likes, as: :likeable, dependent: :destroy

  # 文字数の上限（画面の maxLength は front/src/lib/text-limits.ts と揃える）
  CONTENT_MAX_LENGTH = 1_000

  validates :content, presence: true, length: { maximum: CONTENT_MAX_LENGTH }
end
