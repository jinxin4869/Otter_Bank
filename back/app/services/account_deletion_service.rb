# frozen_string_literal: true

# 退会（アカウントと関連データの削除）。
# コメント数・いいね数は counter_cache ではなくコントローラーで増減しているため、
# dependent: :destroy で消えるだけでは他人の投稿・コメントの件数が減らない。削除の前に差し引く
class AccountDeletionService
  # 減らす列ごとの SQL。列名を文字列に埋め込まないよう、固定の文にしておく
  DECREMENT_SQL = {
    comments_count: 'comments_count = GREATEST(comments_count - ?, 0)',
    likes_count: 'likes_count = GREATEST(likes_count - ?, 0)'
  }.freeze
  private_constant :DECREMENT_SQL

  def initialize(user)
    @user = user
  end

  def call
    User.transaction do
      decrement_comment_counts
      decrement_like_counts
      @user.destroy!
    end
  end

  private

  # 他人の投稿に付けたコメントの分だけ、その投稿のコメント数を減らす（自分の投稿は丸ごと消える）
  def decrement_comment_counts
    counts = @user.comments.joins(:post).where.not(posts: { user_id: @user.id }).group(:post_id).count
    decrement_counts(Post, :comments_count, counts)
  end

  # 他人の投稿・コメントに付けたいいねの分だけ、いいね数を減らす
  def decrement_like_counts
    likes = @user.likes
    post_counts = likes.where(likeable_type: 'Post')
                       .where.not(likeable_id: @user.posts.select(:id)).group(:likeable_id).count
    comment_counts = likes.where(likeable_type: 'Comment')
                          .where.not(likeable_id: @user.comments.select(:id)).group(:likeable_id).count
    decrement_counts(Post, :likes_count, post_counts)
    decrement_counts(Comment, :likes_count, comment_counts)
  end

  # { id => 件数 } の分だけ減らす。手動で増減してきた値なので 0 未満にはしない
  def decrement_counts(model, column, counts)
    sql = DECREMENT_SQL.fetch(column)
    counts.each do |id, count|
      model.where(id: id).update_all([sql, count])
    end
  end
end
