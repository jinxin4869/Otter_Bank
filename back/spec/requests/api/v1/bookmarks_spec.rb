require 'rails_helper'

RSpec.describe "Api::V1::Bookmarks", type: :request do
  describe "GET /create" do
    it "returns http success" do
      get "/api/v1/bookmarks/create"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /destroy" do
    it "returns http success" do
      get "/api/v1/bookmarks/destroy"
      expect(response).to have_http_status(:success)
    end
  end

end
