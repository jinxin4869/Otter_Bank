# frozen_string_literal: true

class Post < ApplicationRecord
  # アソシエーション
  belongs_to :user
  has_many :comments, dependent: :destroy
  has_many :likes, as: :likeable, dependent: :destroy
  has_many :bookmarks, dependent: :destroy
  has_many :post_categories, dependent: :destroy
  has_many :categories, through: :post_categories

  # 文字数の上限（画面の maxLength は front/src/lib/text-limits.ts と揃える）
  TITLE_MAX_LENGTH = 100
  CONTENT_MAX_LENGTH = 5_000

  # バリデーション
  validates :title, presence: true, length: { maximum: TITLE_MAX_LENGTH }
  validates :content, presence: true, length: { maximum: CONTENT_MAX_LENGTH }

  # メソッド
  # 削除できるのは投稿者本人か管理者（荒らし対策で運営が消せるようにする）。編集は本人のみ
  def deletable_by?(user)
    user_id == user.id || user.admin?
  end

  def increment_views!
    increment!(:views_count)
  end
end
