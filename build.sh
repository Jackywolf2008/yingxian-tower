#!/bin/sh
# 把 Claude artifact 用的页面片段（index.html）包成完整网页，连同图片输出到 docs/，GitHub Pages 从 docs/ 发布
set -e
cd "$(dirname "$0")"
mkdir -p docs
URL=https://jackywolf2008.github.io/yingxian-tower
{
  printf '<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  printf '<meta name="description" content="一本可以一层层点进去的应县木塔立体书：结构按梁思成的测绘图与记述搭建，最后从空地把木塔重新盖起来。">\n'
  printf '<meta property="og:title" content="拆开应县木塔">\n<meta property="og:image" content="%s/ta-1933.jpg">\n' "$URL"
  printf '<style>[hidden]{display:none!important}img{max-width:100%%}</style>\n'
  awk '/^<div class="wrap">/{exit} {print}' index.html
  printf '</head>\n<body>\n'
  awk 'f||/^<div class="wrap">/{f=1;print}' index.html
  printf '\n</body>\n</html>\n'
} > docs/index.html
cp ta-1933.jpg liang-*.jpg docs/
touch docs/.nojekyll
