# frozen_string_literal: true

module Api
  module V1
    # 投稿・コメントへのいいね（Like はポリモーフィックなので、対象を @likeable にして共通の処理で扱う）
    class LikesController < ApplicationController
      include PostLookup

      before_action :set_post_likeable, only: %i[create_post_like destroy_post_like]
      before_action :set_comment_likeable, only: %i[create_comment_like destroy_comment_like]

      def create_post_like
        create_like { update_likes_received_achievement(@likeable) }
      end

      def destroy_post_like
        destroy_like
      end

      def create_comment_like
        create_like
      end

      def destroy_comment_like
        destroy_like
      end

      private

      def set_post_likeable
        load_post(params.expect(:id))
        @likeable = @post
      end

      def set_comment_likeable
        @likeable = Comment.find(params.expect(:id))
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'コメントが見つかりません' }, status: :not_found
      end

      # いいねを作成する。作成できたときだけブロック（実績の更新など）を実行する
      def create_like
        like = @likeable.likes.new(user: current_api_v1_user)

        if like.save
          @likeable.increment!(:likes_count)
          yield if block_given?
          render json: { message: 'いいねしました', likes_count: @likeable.likes_count }, status: :created
        else
          render json: { errors: like.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy_like
        like = @likeable.likes.find_by(user: current_api_v1_user)

        if like
          like.destroy
          @likeable.decrement!(:likes_count) if @likeable.likes_count.to_i.positive?
          render json: { message: 'いいねを取り消しました', likes_count: @likeable.likes_count }
        else
          render json: { error: 'いいねが見つかりません' }, status: :not_found
        end
      end

      # 投稿者の「いいねを受け取った」実績を更新する。失敗しても、いいね自体は成功させる
      def update_likes_received_achievement(post)
        return unless post.user

        AchievementService.new(post.user).update_community_likes_received_achievements
      rescue StandardError => e
        Rails.logger.error "実績更新失敗 user_id=#{post.user.id} error=#{e.message}"
      end
    end
  end
end
