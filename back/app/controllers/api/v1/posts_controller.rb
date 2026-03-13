# frozen_string_literal: true

module Api
  module V1
    class PostsController < ApplicationController
      before_action :authenticate_user!, except: %i[index show increment_views]
      before_action :set_post, only: %i[show update destroy increment_views]

      def skip_authorization?
        action_name.in?(%w[index show increment_views])
      end

      def index
        @posts = Post.includes(:user, :categories).order(created_at: :desc)
        render json: @posts.map { |post| post_json(post) }
      end

      def show
        render json: post_json(@post)
      end

      def create
        @post = current_api_v1_user.posts.new(post_params)
        @post.likes_count ||= 0
        @post.comments_count ||= 0
        @post.views_count ||= 0
        assign_categories(@post)

        if @post.save
          render json: post_json(@post), status: :created
        else
          render json: @post.errors, status: :unprocessable_entity
        end
      end

      def update
        unless @post.user_id == current_api_v1_user.id
          render json: { error: '投稿の編集権限がありません' }, status: :forbidden
          return
        end

        if @post.update(post_params)
          assign_categories(@post)
          render json: post_json(@post)
        else
          render json: @post.errors, status: :unprocessable_entity
        end
      end

      def destroy
        unless @post.user_id == current_api_v1_user.id
          render json: { error: '投稿の削除権限がありません' }, status: :forbidden
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
        @post = Post.includes(:categories).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Post not found' }, status: :not_found
      end

      def post_params
        params.expect(post: %i[title content])
      end

      def assign_categories(post)
        category_names = params.dig(:post, :category_names)
        return unless category_names.is_a?(Array)

        normalized_names = category_names.map { |name| name.to_s.strip }.reject(&:blank?).uniq
        return if normalized_names.empty?

        existing_categories = Category.where(name: normalized_names).index_by(&:name)
        missing_names = normalized_names - existing_categories.keys
        new_categories = missing_names.map { |name| Category.create(name: name) }

        post.categories = existing_categories.values + new_categories
      end

      def post_json(post)
        {
          id: post.id,
          title: post.title,
          content: post.content,
          author: post.user&.username,
          author_email: post.user&.email,
          user_id: post.user_id,
          categories: post.categories.map(&:name),
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          views_count: post.views_count || 0,
          created_at: post.created_at,
          updated_at: post.updated_at
        }
      end
    end
  end
end
