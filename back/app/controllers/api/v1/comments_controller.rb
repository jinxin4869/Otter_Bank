class Api::V1::CommentsController < ApplicationController
  before_action :set_post
  before_action :set_comment, only: [:show, :update, :destroy]
  
  def index
    @comments = @post.comments.order(created_at: :desc)
    render json: @comments
  end

  def create
    @comment = @post.comments.new(comment_params)
    @comment.likes_count ||= 0

    if @comment.save
      @post.increment!(:comments_count)
      render json: @comment, status: :created
    else
      render json: @comment.errors, status: :unprocessable_entity
    end
  end

  def update
    unless @comment.user == current_api_v1_user
      render json: { error: 'Not Authorized' }, status: :forbidden
        return
    end

    if @comment.update(comment_params)
      render json: @comment
    else
      render json: @comment.errors, status: :unprocessable_entity
    end
  end

  def destroy
    unless @comment.user == current_api_v1_user
      render json: { error: 'Not Authorized' }, status: :forbidden
        return
    end

    @comment.destroy
    @post.decrement!(:comments_count) if @post.comments_count > 0
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
    params.require(:comment).permit(:content, :author_id, :likes_count)
  end
end
