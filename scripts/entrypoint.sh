#!/bin/sh
set -e
: "${API_BASE:=https://patientbackend.isaachahn.my.id}"
sed -i "s|%API_BASE%|${API_BASE}|g" /usr/share/nginx/html/assets/config.js || true
exec "$@"
