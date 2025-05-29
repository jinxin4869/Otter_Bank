class Api::V1::BookmarksController < ApplicationController
  before_action :set_post

  def create
    bookmark = @post.bookmarks.new(user: current_api_v1_user)

    if @post.bookmarks.exists?(user: current_api_v1_user)
      render json: { status: 'error', message: 'Post already bookmarked' }, status: :unprocessable_entity
      return
    end

    if bookmark.save
      render json: { status: 'success', message: 'Post bookmarked' }, status: :created
    else
      render json: { status: 'error', error: bookmark.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    bookmark = @post.bookmarks.find_by(user: current_api_v1_user)

    if bookmark
      bookmark.destroy
      render json: { status: 'success', message: 'Post unbookmarked' }, status: :ok
    else
      render json: { status: 'error', message: 'Bookmark not found' }, status: :not_found
    end
  end

  private

  def set_post
    @post = Post.find(params[:post_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Post not found' }, status: :not_found
  end
end
