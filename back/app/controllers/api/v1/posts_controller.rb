class Api::V1::PostsController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_post, only: [:show, :update, :destroy, :increment_views]
  
  def index
    @posts = Post.order(created_at: :desc)
    render json: @posts
  end

  def show
    render json: @post
  end

  def create
    @post = current_api_v1_user.posts.new(post_params)
    @post = Post.new(post_params)
    @post.likes_count ||= 0
    @post.comments_count ||= 0
    @post.views_count ||= 0

    if @post.save
      render json: @post, status: :created
    else
      render json: @post.errors, status: :unprocessable_entity
    end
  end

  def update
    authorize @post
    unless @post.author == current_api_v1_user
      render json: { error: 'You are not authorized to update this post' }, status: :forbidden
      return
    end
    
    if @post.update(post_params)
      render json: @post
    else
      render json: @post.errors, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @post
    unless @post.author == current_api_v1_user
      render json: { error: 'You are not authorized to delete this post' }, status: :forbidden
      return
    end

    @post.destroy
    head :no_content
  end

  def increment_views
    @post.increment!(:views_count)
    render json: { id: @post.id, views_count: @post.views_count }
  end

  private

  def set_post
    @post = Post.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Post not found' }, status: :not_found
  end

  def post_params
    params.require(:post).permit(:title, :content, :category_ids => []).merge(author_id: current_api_v1_user.id)
  end
end
