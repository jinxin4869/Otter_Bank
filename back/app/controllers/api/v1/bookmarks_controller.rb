# frozen_string_literal: true

module Api
  module V1
    class BookmarksController < ApplicationController
      before_action :set_post

      def create
        bookmark = @post.bookmarks.new(user: current_api_v1_user)

        if @post.bookmarks.exists?(user: current_api_v1_user)
          render json: { errors: ['すでにブックマーク済みです'] }, status: :unprocessable_entity
          return
        end

        if bookmark.save
          render json: { message: 'Post bookmarked' }, status: :created
        else
          render json: { errors: bookmark.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        bookmark = @post.bookmarks.find_by(user: current_api_v1_user)

        if bookmark
          bookmark.destroy
          render json: { message: 'Post unbookmarked' }, status: :ok
        else
          render json: { error: 'ブックマークが見つかりません' }, status: :not_found
        end
      end

      private

      def set_post
        @post = Post.find(params[:post_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: '投稿が見つかりません' }, status: :not_found
      end
    end
  end
end
