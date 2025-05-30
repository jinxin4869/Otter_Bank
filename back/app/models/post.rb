class Post < ApplicationRecord
  # アソシエーション
  has_many :comments, dependent: :destroy
  has_many :likes, as: :likeable, dependent: :destroy

  # バリデーション
  validates :title, :content, :author, presence: true

  # メソッド
  def increment_views!
    increment!(:views_count)
  end
end
