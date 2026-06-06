# frozen_string_literal: true

module Api
  module V1
    class BudgetsController < ApplicationController
      before_action :set_budget, only: %i[update]

      def index
        @budgets = current_api_v1_user.budgets.order(year: :desc, month: :desc)
        render json: @budgets
      end

      def current
        today = Date.current
        budget = current_api_v1_user.budgets.find_by(year: today.year, month: today.month)
        total_expense = current_api_v1_user.transactions
                                           .where(transaction_type: 'expense')
                                           .where(date: today.all_month)
                                           .sum(:amount)

        render json: {
          budget: budget,
          total_expense: total_expense,
          within_budget: budget ? total_expense <= budget.amount : nil,
          remaining: budget ? budget.amount - total_expense : nil
        }
      end

      def create
        @budget = current_api_v1_user.budgets.new(budget_params)
        if @budget.save
          trigger_budget_first_set_achievement
          render json: @budget, status: :created
        else
          render json: { errors: @budget.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        if @budget.update(budget_params)
          render json: @budget
        else
          render json: { errors: @budget.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def set_budget
        @budget = current_api_v1_user.budgets.find(params.expect(:id))
      rescue ActiveRecord::RecordNotFound
        render json: { error: '予算が見つかりません' }, status: :not_found
      end

      def budget_params
        params.expect(budget: %i[year month amount])
      end

      def trigger_budget_first_set_achievement
        service = AchievementService.new(current_api_v1_user)
        service.update_expense_achievements({ budget_set: true, within_budget: false, consecutive_months: 0 })
      rescue StandardError => e
        Rails.logger.error "実績更新エラー（予算設定）: #{e.message}"
      end
    end
  end
end
