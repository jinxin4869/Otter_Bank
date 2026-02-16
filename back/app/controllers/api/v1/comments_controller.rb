class Api::V1::CommentsController < ApplicationController
  before_action :set_post
  before_action :set_comment, only: [:update, :destroy]

  def skip_authorization?
    action_name == 'index'
  end

  def index
    @comments = @post.comments.includes(:user).order(created_at: :desc)
    render json: @comments.map { |comment| comment_json(comment) }
  end

  def create
    @comment = @post.comments.new(comment_params)
    @comment.user = current_api_v1_user
    @comment.likes_count ||= 0

    if @comment.save
      @post.increment!(:comments_count)
      render json: comment_json(@comment), status: :created
    else
      render json: @comment.errors, status: :unprocessable_entity
    end
  end

  def update
    unless @comment.user_id == current_api_v1_user.id
      render json: { error: 'コメントの編集権限がありません' }, status: :forbidden
      return
    end

    if @comment.update(comment_params)
      render json: comment_json(@comment)
    else
      render json: @comment.errors, status: :unprocessable_entity
    end
  end

  def destroy
    unless @comment.user_id == current_api_v1_user.id
      render json: { error: 'コメントの削除権限がありません' }, status: :forbidden
      return
    end

    @comment.destroy
    @post.decrement!(:comments_count) if @post.comments_count.to_i > 0
    head :no_content
  end

  private

  def set_post
    @post = Post.find(params[:post_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Post not found' }, status: :not_found
  end

  def set_comment
    @comment = @post.comments.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Comment not found' }, status: :not_found
  end

  def comment_params
    params.require(:comment).permit(:content)
  end

  def comment_json(comment)
    {
      id: comment.id,
      post_id: comment.post_id,
      content: comment.content,
      author: comment.user&.username,
      author_email: comment.user&.email,
      user_id: comment.user_id,
      likes_count: comment.likes_count || 0,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    }
  end
end
