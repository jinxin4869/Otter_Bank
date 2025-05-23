require "test_helper"

class Api::V1::TransactionsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_v1_transactions_index_url
    assert_response :success
  end

  test "should get create" do
    get api_v1_transactions_create_url
    assert_response :success
  end

  test "should get update" do
    get api_v1_transactions_update_url
    assert_response :success
  end

  test "should get destroy" do
    get api_v1_transactions_destroy_url
    assert_response :success
  end
end
