require 'rails_helper'

RSpec.describe "Api::Vi::UserActions", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/api/vi/user_actions/index"
      expect(response).to have_http_status(:success)
    end
  end

end
