#!/bin/bash
set -e

# サーバープロセスIDファイルを削除
rm -f /app/tmp/pids/server.pid


# 渡されたコマンドを実行
exec "$@"