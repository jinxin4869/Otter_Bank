#!/bin/bash
echo "🧹 Docker Composeのクリーンアップを開始..."
docker-compose down --remove-orphans
docker container prune -f
docker image prune -f
echo "✅ クリーンアップ完了。再起動中..."
docker-compose up --remove-orphans -d
echo "📊 コンテナ状態を確認中..."
docker-compose ps
echo "📋 ログを表示します..."
docker-compose logs -f
