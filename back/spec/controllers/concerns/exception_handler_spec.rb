# frozen_string_literal: true

require 'rails_helper'

# 各コントローラーが捕捉し損ねた例外が、ExceptionHandler で内部情報を出さずに返ることを検証する
RSpec.describe ExceptionHandler, type: :controller do
  controller(ApplicationController) do
    def skip_authorization?
      true
    end

    def not_found
      Post.find(0)
    end

    def invalid
      User.create!(username: '', email: 'invalid')
    end
  end

  before do
    routes.draw do
      get 'not_found' => 'anonymous#not_found'
      get 'invalid' => 'anonymous#invalid'
    end
  end

  it 'RecordNotFound はモデル名や ID を含まない固定メッセージで 404 を返す' do
    get :not_found
    expect(response).to have_http_status(:not_found)
    expect(response.parsed_body).to eq('error' => 'リソースが見つかりません')
    expect(response.body).not_to include('Post')
  end

  it 'RecordInvalid は検証メッセージの配列で 422 を返す（例外メッセージをそのまま返さない）' do
    get :invalid
    expect(response).to have_http_status(:unprocessable_content)
    json = response.parsed_body
    expect(json['errors']).to be_an(Array)
    expect(json['errors']).not_to be_empty
    expect(response.body).not_to include('Validation failed')
  end
end
