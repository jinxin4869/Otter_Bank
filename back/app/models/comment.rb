# frozen_string_literal: true

class Comment < ApplicationRecord
  belongs_to :post
  belongs_to :user
  has_many :likes, as: :likeable, dependent: :destroy

  validates :content, presence: true

  # 削除できるのはコメントの投稿者本人か管理者。編集は本人のみ
  def deletable_by?(user)
    user_id == user.id || user.admin?
  end
end
