# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Posts', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/posts' do
    before { create_list(:post, 3, user: user) }

    it '投稿一覧を返す' do
      get '/api/v1/posts'
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['posts']).to be_an(Array)
      expect(json['posts'].length).to eq(3)
    end

    it '認証なしでも一覧を取得できる' do
      get '/api/v1/posts'
      expect(response).to have_http_status(:ok)
    end

    it '不正なトークン付きでも一覧を取得でき、自分のいいね状態は false になる' do
      get '/api/v1/posts', headers: { 'Authorization' => 'Bearer invalid-token' }
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['posts']).to all(include('liked_by_me' => false, 'bookmarked_by_me' => false))
    end

    it 'レスポンスに必要なフィールドが含まれる' do
      get '/api/v1/posts', headers: headers
      json = response.parsed_body
      post_data = json['posts'].first
      expect(post_data).to include('id', 'title', 'content', 'author', 'likes_count', 'comments_count', 'views_count',
                                   'liked_by_me', 'bookmarked_by_me')
    end

    it '認証済みユーザーはliked_by_meが正しく返る' do
      post_record = create(:post, user: user)
      create(:like, user: user, likeable: post_record)

      get '/api/v1/posts', headers: headers
      json = response.parsed_body
      liked_post = json['posts'].find { |p| p['id'] == post_record.id }
      expect(liked_post['liked_by_me']).to be true
    end
  end

  describe 'GET /api/v1/posts/:id' do
    let!(:post_record) { create(:post, user: user) }

    it '投稿詳細を返す' do
      get "/api/v1/posts/#{post_record.id}"
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['id']).to eq(post_record.id)
      expect(json['title']).to eq(post_record.title)
    end

    it '存在しない投稿は404を返す' do
      get '/api/v1/posts/0'
      expect(response).to have_http_status(:not_found)
    end

    it '認証済みユーザーはliked_by_meが正しく返る' do
      create(:like, user: user, likeable: post_record)
      get "/api/v1/posts/#{post_record.id}", headers: headers
      json = response.parsed_body
      expect(json['liked_by_me']).to be true
    end

    it '認証済みユーザーはbookmarked_by_meが正しく返る' do
      create(:bookmark, user: user, post: post_record)
      get "/api/v1/posts/#{post_record.id}", headers: headers
      json = response.parsed_body
      expect(json['bookmarked_by_me']).to be true
    end

    it '未認証ユーザーはliked_by_meとbookmarked_by_meがfalseになる' do
      get "/api/v1/posts/#{post_record.id}"
      json = response.parsed_body
      expect(json['liked_by_me']).to be false
      expect(json['bookmarked_by_me']).to be false
    end
  end

  describe 'GET /api/v1/posts の検索・絞り込み・並び替え' do
    let(:ids) { -> { response.parsed_body['posts'].pluck('id') } }
    let(:category_post) do
      create(:post, title: '投資の話', content: '本文', created_at: 3.days.ago).tap do |p|
        p.categories << Category.find_or_create_by!(name: 'investment')
      end
    end
    let!(:savings_post) do
      create(:post, title: '貯金のコツ', content: '毎月の積立', likes_count: 5, comments_count: 0, created_at: 2.days.ago)
        .tap { |p| p.categories << Category.find_or_create_by!(name: 'savings') }
    end
    let!(:commented_post) do
      create(:post, title: '質問です', content: 'NISA について', likes_count: 1, comments_count: 9,
                    created_at: 1.day.ago)
    end

    before { category_post }

    it 'q でタイトル・本文を部分一致で検索する（読み込み済みの範囲に限らない）' do
      get '/api/v1/posts', params: { q: '積立', per: 1 }
      expect(ids.call).to eq([savings_post.id])
      expect(response.parsed_body['meta']['total_count']).to eq(1)
    end

    it 'q は投稿者のユーザー名にも一致する' do
      get '/api/v1/posts', params: { q: commented_post.user.username }
      expect(ids.call).to eq([commented_post.id])
    end

    it 'q の % や _ はワイルドカードとして扱わない' do
      get '/api/v1/posts', params: { q: '%' }
      expect(ids.call).to be_empty
    end

    it 'search_categories を渡すと、そのカテゴリの投稿も検索結果に含める' do
      get '/api/v1/posts', params: { q: '該当なしの語', search_categories: ['investment'] }
      expect(ids.call).to eq([category_post.id])
    end

    it 'category（タブ）と categories（フィルター）で絞り込む' do
      get '/api/v1/posts', params: { category: 'savings' }
      expect(ids.call).to eq([savings_post.id])

      get '/api/v1/posts', params: { categories: %w[savings investment] }
      expect(ids.call).to contain_exactly(savings_post.id, category_post.id)
    end

    it 'sort=popular はいいね数、sort=comments はコメント数の多い順に並べる' do
      get '/api/v1/posts', params: { sort: 'popular' }
      expect(ids.call.first).to eq(savings_post.id)

      get '/api/v1/posts', params: { sort: 'comments' }
      expect(ids.call.first).to eq(commented_post.id)
    end

    it '並び替えは全投稿が対象で、2 ページ目にも続きが正しく入る' do
      get '/api/v1/posts', params: { sort: 'popular', per: 1, page: 2 }
      expect(ids.call).to eq([commented_post.id])
      expect(response.parsed_body['meta']['total_pages']).to eq(3)
    end

    it 'いいね数・コメント数が NULL の投稿は人気順・コメント数順の末尾に回す' do
      null_post = create(:post, title: '古いデータ', created_at: 1.hour.ago)
      null_post.update_columns(likes_count: nil, comments_count: nil)

      get '/api/v1/posts', params: { sort: 'popular' }
      expect(ids.call.last).to eq(null_post.id)

      get '/api/v1/posts', params: { sort: 'comments' }
      expect(ids.call.last).to eq(null_post.id)
    end

    it '検索・カテゴリ・並び替えを組み合わせても、ページをまたいで重複しない' do
      extra = create(:post, title: '貯金の積立 2', content: '本文', likes_count: 9)
      extra.categories << Category.find_by!(name: 'savings')

      conditions = { q: '積立', categories: %w[savings], sort: 'popular', per: 1 }
      fetched = [1, 2].flat_map do |page|
        get '/api/v1/posts', params: conditions.merge(page: page)
        ids.call
      end
      expect(fetched).to eq([extra.id, savings_post.id])
      expect(response.parsed_body['meta']['total_count']).to eq(2)
    end

    it 'q が空白だけなら検索しない' do
      get '/api/v1/posts', params: { q: '   ' }
      expect(ids.call.length).to eq(3)
    end

    context 'bookmarked=true（自分のブックマーク）' do
      before do
        create(:bookmark, user: user, post: savings_post)
        create(:bookmark, user: user, post: category_post)
        create(:bookmark, user: create(:user), post: commented_post) # 他人のブックマークは含めない
      end

      it '自分がブックマークした投稿だけを新しい順に返す' do
        get '/api/v1/posts', params: { bookmarked: true }, headers: headers
        expect(ids.call).to eq([savings_post.id, category_post.id])
        expect(response.parsed_body['posts']).to all(include('bookmarked_by_me' => true))
      end

      it 'ほかの条件と組み合わせられる' do
        get '/api/v1/posts', params: { bookmarked: true, category: 'investment' }, headers: headers
        expect(ids.call).to eq([category_post.id])
      end

      it '未ログイン（不正なトークンを含む）では 401 を返す' do
        get '/api/v1/posts', params: { bookmarked: true }
        expect(response).to have_http_status(:unauthorized)

        get '/api/v1/posts', params: { bookmarked: true }, headers: { 'Authorization' => 'Bearer invalid-token' }
        expect(response).to have_http_status(:unauthorized)
      end

      it 'bookmarked=false なら通常の一覧を返す' do
        get '/api/v1/posts', params: { bookmarked: false }, headers: headers
        expect(ids.call.length).to eq(3)
      end
    end

    it '未知の sort は新着順として扱う' do
      get '/api/v1/posts', params: { sort: 'unknown' }
      expect(ids.call).to eq([commented_post.id, savings_post.id, category_post.id])
    end
  end

  describe 'POST /api/v1/posts' do
    let(:valid_params) { { post: { title: 'テスト投稿', content: 'テスト内容です。' } } }

    it '投稿を作成できる' do
      expect do
        post '/api/v1/posts', params: valid_params, headers: headers
      end.to change(Post, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'カテゴリ付きで投稿を作成できる' do
      params = { post: { title: 'テスト投稿', content: 'テスト内容です。', category_names: %w[節約 家計簿] } }
      post '/api/v1/posts', params: params, headers: headers
      expect(response).to have_http_status(:created)
      json = response.parsed_body
      expect(json['categories']).to include('節約', '家計簿')
    end

    it '投稿作成時にcommunity_first_post実績が解除される' do
      post '/api/v1/posts', params: valid_params, headers: headers
      expect(response).to have_http_status(:created)
      achievement = user.achievements.find_by(original_achievement_id: 'community_first_post')
      expect(achievement.reload.unlocked).to be true
    end

    it '未認証では投稿できない' do
      post '/api/v1/posts', params: valid_params
      expect(response).to have_http_status(:unauthorized)
    end

    it 'タイトルなしでは422を返す' do
      post '/api/v1/posts', params: { post: { content: '内容だけ' } }, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'PATCH /api/v1/posts/:id' do
    let!(:post_record) { create(:post, user: user) }

    it '自分の投稿を更新できる' do
      patch "/api/v1/posts/#{post_record.id}", params: { post: { title: '更新タイトル' } }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(post_record.reload.title).to eq('更新タイトル')
    end

    it '他ユーザーの投稿は更新できない' do
      other_post = create(:post, user: create(:user))
      patch "/api/v1/posts/#{other_post.id}", params: { post: { title: '不正更新' } }, headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it '未認証では更新できない' do
      patch "/api/v1/posts/#{post_record.id}", params: { post: { title: '更新' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'DELETE /api/v1/posts/:id' do
    let!(:post_record) { create(:post, user: user) }

    it '自分の投稿を削除できる' do
      expect do
        delete "/api/v1/posts/#{post_record.id}", headers: headers
      end.to change(Post, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it '他ユーザーの投稿は削除できない' do
      other_post = create(:post, user: create(:user))
      delete "/api/v1/posts/#{other_post.id}", headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it '未認証では削除できない' do
      delete "/api/v1/posts/#{post_record.id}"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/posts/:id/increment_views' do
    let!(:post_record) { create(:post, user: user, views_count: 0) }

    it '閲覧数をインクリメントする' do
      post "/api/v1/posts/#{post_record.id}/increment_views"
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['views_count']).to eq(1)
    end

    it '認証なしでもインクリメントできる' do
      post "/api/v1/posts/#{post_record.id}/increment_views"
      expect(response).to have_http_status(:ok)
    end
  end
end
