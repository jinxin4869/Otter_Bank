class Post < ApplicationRecord
  # アソシエーション
  belongs_to :user
  has_many :comments, dependent: :destroy
  has_many :likes, as: :likeable, dependent: :destroy
  has_many :bookmarks, dependent: :destroy
  has_many :post_categories, dependent: :destroy
  has_many :categories, through: :post_categories

  # バリデーション
  validates :title, :content, presence: true

  # メソッド
  def increment_views!
    increment!(:views_count)
  end
end
