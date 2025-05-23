require 'rails_helper'

RSpec.describe "Api::V1::Auths", type: :request do
  describe "GET /google_callback" do
    it "returns http success" do
      get "/api/v1/auth/google_callback"
      expect(response).to have_http_status(:success)
    end
  end

end
