#!/bin/bash
set -e

# 通过环境变量替换后台api的地址

find /usr/share/nginx/html -name '*.js' | xargs sed -i "s#API_GATEWAY_URL#${API_GATEWAY_URL}#g"
find /usr/share/nginx/html -name '*.js' | xargs sed -i "s#TAX_CENTER#${TAX_CENTER}#g"
find /usr/share/nginx/html -name '*.js' | xargs sed -i "s#FILE_URL#${FILE_URL}#g"
find /usr/share/nginx/html -name '*.js' | xargs sed -i "s#CERTIFICATION_URL#${CERTIFICATION_URL}#g"
find /usr/share/nginx/html -name '*.js' | xargs sed -i "s#SEAL_PORTAL#${SEAL_PORTAL}#g"
find /usr/share/nginx/html -name '*.js' | xargs sed -i "s#CAA_HOST#${CAA_HOST}#g"

exec "$@"
