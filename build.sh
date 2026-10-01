#!/bin/sh
# 把 Claude artifact 用的页面片段（index.html）包成完整网页，连同图片输出到 docs/，GitHub Pages 从 docs/ 发布
set -e
cd "$(dirname "$0")"
mkdir -p docs
URL=https://jackywolf2008.github.io/yingxian-tower
{
  printf '<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  printf '<meta name="description" content="一本可以一层层点进去的应县木塔立体书：结构按梁思成的测绘图与记述搭建，最后从空地把木塔重新盖起来。">\n'
  printf '<meta property="og:title" content="应县木塔">\n<meta property="og:image" content="%s/ta-1933.jpg">\n' "$URL"
  printf '<style>[hidden]{display:none!important}img{max-width:100%%}</style>\n'
  awk '/^<div class="wrap">/{exit} {print}' index.html
  printf '</head>\n<body>\n'
  awk 'f||/^<div class="wrap">/{f=1;print}' index.html
  printf '\n</body>\n</html>\n'
} > docs/index.html
# 公开站点不依赖外部 CDN：three.js 随站点一起发布；Google 字体改为不阻塞渲染（大陆打不开时直接用系统字体）
# three.js 的版本以 index.html 里 importmap 的地址为准。0.186 起 npm 包不再附带压缩版，
# 这里用 esbuild 把 three.module.js 和 three.core.js 打成一个压缩文件（需要 Node.js；版本没变就不重打）
THREE_VER=$(sed -n 's#.*cdn.jsdelivr.net/npm/three@\([0-9.]*\)/build/three.module.js.*#\1#p' index.html | head -n 1)
BANNER="/* three.js $THREE_VER | Copyright 2010-2026 Three.js Authors | MIT License | https://github.com/mrdoob/three.js */"
if ! head -c 200 docs/three.module.min.js 2>/dev/null | grep -qF "three.js $THREE_VER |"; then
  tmp=$(mktemp -d)
  ( cd "$tmp" && npm init -y >/dev/null && npm install --silent --no-audit --no-fund "three@$THREE_VER" esbuild@0.28.2 \
    && echo "export * from 'three';" > entry.js \
    && npx esbuild entry.js --bundle --minify --format=esm --legal-comments=none --banner:js="$BANNER" --outfile=three.module.min.js --log-level=warning )
  cp "$tmp/three.module.min.js" docs/
  rm -rf "$tmp"
fi
rm -f docs/three.min.js
# -i.bak 在 macOS 和 Linux 的 sed 上都能用；importmap 里的相对地址必须以 ./ 开头
sed -i.bak -e "s#https://cdn.jsdelivr.net/npm/three@$THREE_VER/build/three.module.js#./three.module.min.js#" \
  -e 's#display=swap" rel="stylesheet">#display=swap" rel="stylesheet" media="print" onload="this.media=\x27all\x27">#' docs/index.html
rm -f docs/index.html.bak
cp ta-1933.jpg liang-*.jpg docs/
touch docs/.nojekyll
