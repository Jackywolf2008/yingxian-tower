// 只下载视频里实际用到的字：扫描 src/ 与抓取到的标注文字，向 Google Fonts 请求子集（text= 参数），存到 public/fonts/
// 需要在 npm run capture 之后运行（标注里的字来自抓取结果）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public/fonts');
const FONTS = [
  { family: 'Ma Shan Zheng', weight: 400, file: 'mashanzheng-400' },
  { family: 'Noto Serif SC', weight: 500, file: 'notoserifsc-500' },
  { family: 'Noto Serif SC', weight: 700, file: 'notoserifsc-700' },
  { family: 'Noto Serif SC', weight: 900, file: 'notoserifsc-900' },
  { family: 'Noto Sans SC', weight: 400, file: 'notosanssc-400' },
  { family: 'Noto Sans SC', weight: 700, file: 'notosanssc-700' },
];
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

const chars = new Set();
const add = s => { for (const ch of s) if (ch.codePointAt(0) > 32) chars.add(ch); };
for (let c = 33; c < 127; c++) chars.add(String.fromCharCode(c));
const walk = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (/\.(tsx?|json)$/.test(e.name)) add(fs.readFileSync(p, 'utf8'));
});
walk(path.join(ROOT, 'src'));
const shots = path.join(ROOT, 'public/shots');
if (fs.existsSync(shots)) for (const s of fs.readdirSync(shots)) {
  const f = path.join(shots, s, 'meta.json');
  if (!fs.existsSync(f)) continue;
  const m = JSON.parse(fs.readFileSync(f, 'utf8'));
  m.labels.flat().forEach(l => add(l.t));
  (m.steps || []).forEach(st => add(st.name));
} else console.warn('还没有抓取结果，标注用字可能不全；抓取后再运行一次');

const all = [...chars];
const chunks = [];
for (let i = 0; i < all.length; i += 250) chunks.push(all.slice(i, i + 250).join(''));
console.log(`共 ${all.length} 个字符，分 ${chunks.length} 批请求`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const manifest = [];
for (const f of FONTS) {
  let n = 0;
  for (const text of chunks) {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.family)}:wght@${f.weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url, { headers: { 'user-agent': UA } })).text();
    for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
      const src = /url\(([^)]+)\)/.exec(block)?.[1];
      if (!src) continue;
      const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1];
      const file = `${f.file}-${n++}.woff2`;
      fs.writeFileSync(path.join(OUT, file), Buffer.from(await (await fetch(src)).arrayBuffer()));
      manifest.push({ family: f.family, weight: String(f.weight), file, unicodeRange: range });
    }
  }
  console.log(`  ${f.family} ${f.weight}：${n} 个文件`);
}
fs.writeFileSync(path.join(OUT, 'fonts.json'), JSON.stringify(manifest, null, 1));
