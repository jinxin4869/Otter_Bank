# frozen_string_literal: true

module Api
  module V1
    class AchievementsController < ApplicationController
      include AchievementJson

      # before_action :authorize を削除（ApplicationControllerで処理済み）

      def index
        achievements = @current_user.achievements.order(:tier, :original_achievement_id).to_a
        unlocked_count = achievements.count(&:unlocked)

        render json: {
          achievements: achievements.map { |ach| achievement_json(ach) },
          summary: {
            total_achievements: achievements.size,
            unlocked_achievements: unlocked_count,
            progress_by_category: achievements.group_by(&:category).transform_values do |achs|
              {
                total: achs.count,
                unlocked: achs.count(&:unlocked),
                progress_percentage: (achs.count(&:unlocked).to_f / achs.count * 100).round
              }
            end,
            growth_stage: Achievement.growth_stage_for(unlocked_count)
          }
        }
      end

      def show
        achievement = @current_user.achievements.find(params.expect(:id))
        render json: {
          achievement: achievement_json(achievement),
          related_achievements: related_achievements(achievement)
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: '実績が見つかりません' }, status: :not_found
      end

      def update
        achievement = @current_user.achievements.find_by(id: params[:id])

        if achievement
          if achievement.update(achievement_params)
            render json: achievement_json(achievement), status: :ok
          else
            render json: { errors: achievement.errors.full_messages }, status: :unprocessable_content
          end
        else
          render json: { error: '実績が見つかりません' }, status: :not_found
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
                     .map { |ach| achievement_json(ach).slice(:id, :title, :progress_percentage, :unlocked) }
      end
    end
  end
end
