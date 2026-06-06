# frozen_string_literal: true

module Api
  module V1
    class SavingsGoalsController < ApplicationController
      before_action :set_savings_goal, only: %i[update destroy]

      EMERGENCY_FUND_THRESHOLD = 100_000

      def index
        @savings_goals = current_api_v1_user.savings_goals.order(created_at: :desc)
        render json: @savings_goals
      end

      def create
        @savings_goal = current_api_v1_user.savings_goals.new(savings_goal_params)
        if @savings_goal.save
          trigger_emergency_fund_achievement(@savings_goal)
          render json: @savings_goal, status: :created
        else
          render json: { errors: @savings_goal.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        was_achieved = goal_achieved?(@savings_goal)
        if @savings_goal.update(savings_goal_params)
          trigger_goal_first_achieved(@savings_goal, was_achieved)
          render json: @savings_goal
        else
          render json: { errors: @savings_goal.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        @savings_goal.destroy
        head :no_content
      end

      private

      def set_savings_goal
        @savings_goal = current_api_v1_user.savings_goals.find(params.expect(:id))
      rescue ActiveRecord::RecordNotFound
        render json: { error: '貯金目標が見つかりません' }, status: :not_found
      end

      def savings_goal_params
        params.expect(savings_goal: %i[title target_amount current_amount deadline])
      end

      def goal_achieved?(goal)
        goal.current_amount.present? && goal.current_amount >= goal.target_amount
      end

      # 更新後に初めて達成した場合のみ goal_first_achieved を解除する
      def trigger_goal_first_achieved(goal, was_achieved_before)
        return if was_achieved_before
        return unless goal_achieved?(goal)

        service = AchievementService.new(current_api_v1_user)
        service.update_special_achievements(:goal_achieved)
      rescue StandardError => e
        Rails.logger.error "実績更新エラー（目標達成）: #{e.message}"
      end

      # 緊急資金規模（10万円以上）の貯金目標作成時に解除する
      def trigger_emergency_fund_achievement(goal)
        return unless goal.target_amount >= EMERGENCY_FUND_THRESHOLD

        service = AchievementService.new(current_api_v1_user)
        service.update_special_achievements(:emergency_fund)
      rescue StandardError => e
        Rails.logger.error "実績更新エラー（緊急資金）: #{e.message}"
      end
    end
  end
end
