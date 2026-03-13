# Git 操作の基本的な流れ

このドキュメントでは、コードに変更を加えた後の一般的な Git 操作の流れについて説明します。


## 1. 変更の確認

まず、どのファイルが変更されたかを確認します：

git status

## 2. 変更をステージングに追加

### 特定のファイルを追加する場合
git add ファイル名

### すべての変更ファイルを追加する場合
git add .

## 3. 変更をコミット
git commit -m "変更内容の説明"

## 4. リモートリポジトリへプッシュ

### 現在のブランチをプッシュ
git push origin 現在のブランチ名

### デフォルトのリモートブランチにプッシュ（通常はmaster/main）
git push

## 5. ローカルでのマージ

### マージしたいブランチ（例：main）に切り替え
git checkout main

### マージ元のブランチ（例：feature）の変更を取り込む
git merge feature

### コンフリクトがある場合は解決してから再度コミット
git add .
git commit -m "Merged feature branch"