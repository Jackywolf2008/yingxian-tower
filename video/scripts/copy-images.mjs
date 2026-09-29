// 把仓库根目录的历史照片与测绘图复制到 public/img，供视频引用
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public/img');
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, '..')).filter(f => /^(ta-1933|liang-.*)\.jpg$/.test(f))) {
  fs.copyFileSync(path.join(ROOT, '..', f), path.join(OUT, f));
  console.log(`复制 ${f}`);
}
