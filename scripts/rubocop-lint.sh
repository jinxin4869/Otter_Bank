#!/bin/bash
# rbenv で正しい Ruby バージョンを使いつつ RuboCop を実行する lint-staged 用スクリプト
# $HOME/.rbenv/bin/rbenv を使って shims を PATH に追加し、ユーザー名依存を排除する
eval "$($HOME/.rbenv/bin/rbenv init - bash)"
cd back && bundle exec rubocop -A --force-exclusion "$@"
