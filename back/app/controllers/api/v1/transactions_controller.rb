class Api::V1::TransactionsController < ApplicationController
  before_action :set_transaction, only: [:update, :destroy]

  def index
    @transactions = current_api_v1_user.transactions.order(date: :desc, created_at: :desc)

    # 期間フィルタ
    if params[:start_date].present?
      @transactions = @transactions.where('date >= ?', params[:start_date])
    end
    if params[:end_date].present?
      @transactions = @transactions.where('date <= ?', params[:end_date])
    end

    # タイプフィルタ（income / expense）
    if params[:transaction_type].present?
      @transactions = @transactions.where(transaction_type: params[:transaction_type])
    end

    render json: {
      transactions: @transactions,
      summary: {
        total_income: current_api_v1_user.transactions.income.sum(:amount),
        total_expense: current_api_v1_user.transactions.expense.sum(:amount),
        balance: current_api_v1_user.transactions.income.sum(:amount) - current_api_v1_user.transactions.expense.sum(:amount)
      }
    }
  end

  def create
    @transaction = current_api_v1_user.transactions.new(transaction_params)

    if @transaction.save
      render json: @transaction, status: :created
    else
      render json: { errors: @transaction.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @transaction.update(transaction_params)
      render json: @transaction
    else
      render json: { errors: @transaction.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @transaction.destroy
    head :no_content
  end

  private

  def set_transaction
    @transaction = current_api_v1_user.transactions.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: '取引が見つかりません' }, status: :not_found
  end

  def transaction_params
    params.require(:transaction).permit(:amount, :transaction_type, :category, :description, :date)
  end
end
