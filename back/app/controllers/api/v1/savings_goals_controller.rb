# frozen_string_literal: true

module Api
  module V1
    class SavingsGoalsController < ApplicationController
      before_action :set_savings_goal, only: %i[update destroy]

      def index
        @savings_goals = @current_user.savings_goals.order(created_at: :desc)
        render json: @savings_goals
      end

      def create
        @savings_goal = @current_user.savings_goals.new(savings_goal_params)
        if @savings_goal.save
          render json: @savings_goal, status: :created
        else
          render json: { errors: @savings_goal.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @savings_goal.update(savings_goal_params)
          render json: @savings_goal
        else
          render json: { errors: @savings_goal.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @savings_goal.destroy
        head :no_content
      end

      private

      def set_savings_goal
        @savings_goal = @current_user.savings_goals.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: '貯金目標が見つかりません' }, status: :not_found
      end

      def savings_goal_params
        params.expect(savings_goal: %i[title target_amount current_amount deadline])
      end
    end
  end
end
