# frozen_string_literal: true

class Post < ApplicationRecord
  # アソシエーション
  belongs_to :user
  has_many :comments, dependent: :destroy
  has_many :likes, as: :likeable, dependent: :destroy
  has_many :bookmarks, dependent: :destroy
  has_many :post_categories, dependent: :destroy
  has_many :categories, through: :post_categories

  # 並び替えの種類（front/src/app/board/_components/board-constants.ts の SORT_OPTIONS と揃える）。
  # 同じ値のときは新しい順、さらに id で並びを固定し、ページをまたいで重複・欠落しないようにする
  SORT_ORDERS = {
    'latest' => { created_at: :desc, id: :desc },
    'popular' => { likes_count: :desc, created_at: :desc, id: :desc },
    'comments' => { comments_count: :desc, created_at: :desc, id: :desc }
  }.freeze

  # いずれかのカテゴリ（名前）が付いた投稿
  scope :in_categories, lambda { |names|
    where(id: PostCategory.joins(:category).where(categories: { name: names }).select(:post_id))
  }

  # タイトル・本文・投稿者名の部分一致。category_names を渡すと、そのカテゴリが付いた投稿も含める
  # （画面のカテゴリ名で検索したとき、保存値の "investment" などに読み替えて渡す）
  scope :search, lambda { |term, category_names = []|
    pattern = "%#{sanitize_sql_like(term)}%"
    matched = left_joins(:user).where('posts.title ILIKE :p OR posts.content ILIKE :p OR users.username ILIKE :p',
                                      p: pattern)
    category_names.present? ? matched.or(left_joins(:user).in_categories(category_names)) : matched
  }

  scope :sorted_by, ->(key) { order(SORT_ORDERS.fetch(key.to_s, SORT_ORDERS['latest'])) }

  # バリデーション
  validates :title, :content, presence: true

  # メソッド
  def increment_views!
    increment!(:views_count)
  end
end
