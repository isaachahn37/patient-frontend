#!/bin/sh
set -e
: "${API_BASE:=http://localhost:8080}"
sed -i "s|%API_BASE%|${API_BASE}|g" /usr/share/nginx/html/assets/config.js || true
exec "$@"
