require 'rails_helper'

RSpec.describe "Api::V1::Likes", type: :request do
  describe "GET /create_post_like" do
    it "returns http success" do
      get "/api/v1/likes/create_post_like"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /destroy_post_like" do
    it "returns http success" do
      get "/api/v1/likes/destroy_post_like"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /create_comment_like" do
    it "returns http success" do
      get "/api/v1/likes/create_comment_like"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /destroy_comment_like" do
    it "returns http success" do
      get "/api/v1/likes/destroy_comment_like"
      expect(response).to have_http_status(:success)
    end
  end

end
