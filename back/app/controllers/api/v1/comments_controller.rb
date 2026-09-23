# frozen_string_literal: true

module Api
  module V1
    class CommentsController < ApplicationController
      include PostLookup

      before_action :set_post
      before_action :set_comment, only: %i[update destroy]

      def skip_authorization?
        action_name == 'index'
      end

      def index
        @comments = @post.comments.includes(:user).order(created_at: :desc)
        # 閲覧者がいいね済みのコメント ID をまとめて取得する（コメントごとに問い合わせない）
        viewer = optional_current_user
        liked_ids = if viewer
                      Like.where(likeable_type: 'Comment', likeable_id: @comments.map(&:id), user: viewer)
                          .pluck(:likeable_id).to_set
                    else
                      Set.new
                    end
        render json: @comments.map { |comment| comment_json(comment, liked_by_me: liked_ids.include?(comment.id)) }
      end

      def create
        @comment = @post.comments.new(comment_params)
        @comment.user = current_api_v1_user
        @comment.likes_count ||= 0

        if @comment.save
          @post.increment!(:comments_count)
          render json: comment_json(@comment), status: :created
        else
          render json: { errors: @comment.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        unless @comment.user_id == current_api_v1_user.id
          render json: { error: 'コメントの編集権限がありません' }, status: :forbidden
          return
        end

        if @comment.update(comment_params)
          render json: comment_json(@comment, liked_by_me: @comment.likes.exists?(user: current_api_v1_user))
        else
          render json: { errors: @comment.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        unless @comment.user_id == current_api_v1_user.id
          render json: { error: 'コメントの削除権限がありません' }, status: :forbidden
          return
        end

        @comment.destroy
        @post.decrement!(:comments_count) if @post.comments_count.to_i.positive?
        head :no_content
      end

      private

      def set_post
        load_post(params.expect(:post_id))
      end

      def set_comment
        @comment = @post.comments.find(params.expect(:id))
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'コメントが見つかりません' }, status: :not_found
      end

      def comment_params
        params.expect(comment: [:content])
      end

      def comment_json(comment, liked_by_me: false)
        {
          id: comment.id,
          post_id: comment.post_id,
          content: comment.content,
          author: comment.user&.username,
          user_id: comment.user_id,
          likes_count: comment.likes_count || 0,
          liked_by_me: liked_by_me,
          created_at: comment.created_at,
          updated_at: comment.updated_at
        }
      end
    end
  end
end
