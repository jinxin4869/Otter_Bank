# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_06_15_082344) do
  create_table "achievements", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "original_achievement_id", null: false
    t.string "title", null: false
    t.text "description"
    t.integer "category", default: 0, null: false
    t.integer "tier", default: 0, null: false
    t.boolean "unlocked", default: false, null: false
    t.integer "progress", default: 0, null: false
    t.integer "progress_target", null: false
    t.string "image_url"
    t.string "reward"
    t.datetime "unlocked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_achievements_on_category"
    t.index ["created_at"], name: "index_achievements_on_created_at"
    t.index ["tier"], name: "index_achievements_on_tier"
    t.index ["unlocked"], name: "index_achievements_on_unlocked"
    t.index ["user_id", "original_achievement_id"], name: "index_achievements_on_user_and_original_id", unique: true
    t.index ["user_id"], name: "index_achievements_on_user_id"
  end

  create_table "bookmarks", force: :cascade do |t|
    t.integer "post_id", null: false
    t.string "user_email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_bookmarks_on_post_id"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "comments", force: :cascade do |t|
    t.integer "post_id", null: false
    t.text "content"
    t.string "author"
    t.string "author_email"
    t.integer "likes_count"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_comments_on_post_id"
  end

  create_table "likes", force: :cascade do |t|
    t.string "likeable_type", null: false
    t.integer "likeable_id", null: false
    t.string "user_email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["likeable_type", "likeable_id"], name: "index_likes_on_likeable"
  end

  create_table "oauth_providers", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "provider"
    t.string "uid"
    t.string "access_token"
    t.string "refresh_token"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_oauth_providers_on_user_id"
  end

  create_table "post_categories", force: :cascade do |t|
    t.integer "post_id", null: false
    t.integer "category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_post_categories_on_category_id"
    t.index ["post_id"], name: "index_post_categories_on_post_id"
  end

  create_table "posts", force: :cascade do |t|
    t.string "title"
    t.text "content"
    t.string "author"
    t.string "author_email"
    t.integer "likes_count"
    t.integer "comments_count"
    t.integer "views_count"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "savings_goals", force: :cascade do |t|
    t.string "title"
    t.decimal "target_amount"
    t.decimal "current_amount"
    t.date "deadline"
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_savings_goals_on_user_id"
  end

  create_table "transactions", force: :cascade do |t|
    t.decimal "amount"
    t.string "transaction_type"
    t.string "category"
    t.text "description"
    t.integer "user_id", null: false
    t.datetime "date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_transactions_on_user_id"
  end

  create_table "user_actions", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "action_type", null: false
    t.decimal "amount", precision: 10, scale: 2
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["action_type"], name: "index_user_actions_on_action_type"
    t.index ["created_at"], name: "index_user_actions_on_created_at"
    t.index ["user_id", "created_at"], name: "index_user_actions_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_user_actions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "username"
  end

  add_foreign_key "achievements", "users"
  add_foreign_key "bookmarks", "posts"
  add_foreign_key "comments", "posts"
  add_foreign_key "oauth_providers", "users"
  add_foreign_key "post_categories", "categories"
  add_foreign_key "post_categories", "posts"
  add_foreign_key "savings_goals", "users"
  add_foreign_key "transactions", "users"
  add_foreign_key "user_actions", "users"
end
