# frozen_string_literal: true

module Api
  module V1
    class AchievementsController < ApplicationController
      # before_action :authorize を削除（ApplicationControllerで処理済み）

      def index
        achievements = @current_user.achievements.order(:tier, :original_achievement_id).to_a

        render json: {
          achievements: achievements.map do |ach|
            {
              id: ach.id,
              original_achievement_id: ach.original_achievement_id,
              title: ach.title,
              description: ach.description,
              category: ach.category,
              unlocked: ach.unlocked,
              progress: ach.progress,
              progress_percentage: ach.progress_percentage,
              progress_target: ach.progress_target,
              image_url: ach.image_url,
              reward: ach.reward,
              tier: ach.tier,
              created_at: ach.created_at,
              updated_at: ach.updated_at,
              unlocked_at: ach.unlocked_at
            }
          end,
          summary: {
            total_achievements: achievements.size,
            unlocked_achievements: achievements.count(&:unlocked),
            progress_by_category: achievements.group_by(&:category).transform_values do |achs|
              {
                total: achs.count,
                unlocked: achs.count(&:unlocked),
                progress_percentage: (achs.count(&:unlocked).to_f / achs.count * 100).round
              }
            end
          }
        }
      end

      def show
        achievement = @current_user.achievements.find(params[:id])
        render json: {
          achievement: {
            id: achievement.id,
            original_achievement_id: achievement.original_achievement_id,
            title: achievement.title,
            description: achievement.description,
            category: achievement.category,
            unlocked: achievement.unlocked,
            progress: achievement.progress,
            progress_percentage: achievement.progress_percentage,
            progress_target: achievement.progress_target,
            image_url: achievement.image_url,
            reward: achievement.reward,
            tier: achievement.tier,
            created_at: achievement.created_at,
            updated_at: achievement.updated_at,
            unlocked_at: achievement.unlocked_at
          },
          related_achievements: related_achievements(achievement)
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: '実績が見つかりません' }, status: :not_found
      end

      def update
        achievement = @current_user.achievements.find_by(id: params[:id])

        if achievement
          if achievement.update(achievement_params)
            # フロントエンドで使う主要な情報を返す
            render json: {
              id: achievement.id,
              original_achievement_id: achievement.original_achievement_id,
              title: achievement.title,
              description: achievement.description,
              category: achievement.category,
              unlocked: achievement.unlocked,
              progress: achievement.progress,
              image_url: achievement.image_url,
              reward: achievement.reward,
              tier: achievement.tier
            }, status: :ok
          else
            render json: { errors: achievement.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Achievement not found' }, status: :not_found
        end
      end

      private

      def achievement_params
        # progress, unlocked など、更新可能なパラメータを指定
        params.expect(achievement: %i[progress unlocked])
      end

      def related_achievements(achievement)
        @current_user.achievements
                     .where(category: achievement.category)
                     .where.not(id: achievement.id)
                     .limit(3)
                     .map do |ach|
          {
            id: ach.id,
            title: ach.title,
            progress_percentage: ach.progress_percentage,
            unlocked: ach.unlocked
          }
        end
      end
    end
  end
end
