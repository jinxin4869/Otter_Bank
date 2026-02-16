class Api::V1::LikesController < ApplicationController
  def create_post_like
    post = Post.find(params[:post_id])
    like = post.likes.new(user: current_api_v1_user)

    if like.save
      post.increment!(:likes_count)
      render json: { status: 'success', message: 'Post liked', likes_count: post.likes_count }, status: :created
    else
      render json: { status: 'error', error: like.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Post not found' }, status: :not_found
  end

  def destroy_post_like
    post = Post.find(params[:post_id])
    like = post.likes.find_by(user: current_api_v1_user)

    if like
      like.destroy
      post.decrement!(:likes_count) if post.likes_count.to_i > 0
      render json: { status: 'success', message: 'Post unliked', likes_count: post.likes_count }
    else
      render json: { error: 'Like not found' }, status: :not_found
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Post not found' }, status: :not_found
  end

  def create_comment_like
    comment = Comment.find(params[:comment_id])
    like = comment.likes.new(user: current_api_v1_user)

    if like.save
      comment.increment!(:likes_count)
      render json: { status: 'success', message: 'Comment liked', likes_count: comment.likes_count }, status: :created
    else
      render json: { status: 'error', error: like.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Comment not found' }, status: :not_found
  end

  def destroy_comment_like
    comment = Comment.find(params[:comment_id])
    like = comment.likes.find_by(user: current_api_v1_user)

    if like
      like.destroy
      comment.decrement!(:likes_count) if comment.likes_count.to_i > 0
      render json: { status: 'success', message: 'Comment unliked', likes_count: comment.likes_count }
    else
      render json: { error: 'Like not found' }, status: :not_found
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Comment not found' }, status: :not_found
  end
end
