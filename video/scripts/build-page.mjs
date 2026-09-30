// 把介绍视频单独发布成一个页面：../docs/video/（与立体书应用分开，线上地址 …/yingxian-tower/video/）
// 章节时间按 src/timeline.json 计算，改了场景时长重新运行即可
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(ROOT, '../docs/video');
const URL = 'https://jackywolf2008.github.io/yingxian-tower';
const VIDEO = path.join(ROOT, 'out/yingxian-tower-intro.mp4');
const POSTER = path.join(ROOT, 'out/intro-poster.jpg');
for (const f of [VIDEO, POSTER]) if (!fs.existsSync(f)) throw new Error(`缺少 ${path.relative(ROOT, f)}，先运行 npm run render 和 npm run poster`);

const NAMES = {
  hero: '应县木塔', history: '梁思成的一块钱', eaves: '六重屋檐', spire: '塔刹', levels: '明五暗四', dark: '暗层斜撑',
  section: '剖开看', bracket: '斗拱', fork: '叉柱造', joint: '榫卯', quake: '为什么震不倒', today: '今天的木塔',
  build: '重建木塔', ui: '一本能点的书',
};
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/timeline.json'), 'utf8'));
const chapters = [];
let acc = 0;
for (const s of TL.scenes) {
  // 相邻场景淡入淡出交叠，跳到淡入结束的那一刻
  if (NAMES[s.id]) chapters.push({ t: (acc + TL.transition) / TL.fps, name: NAMES[s.id] });
  acc += s.frames - TL.transition;
}
const total = (acc + TL.transition) / TL.fps;
const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

const html = fs.readFileSync(path.join(ROOT, 'site/index.html'), 'utf8')
  .replaceAll('{{URL}}', URL)
  .replaceAll('{{DURATION}}', `${Math.round(total / 5) * 5}-second`)
  .replaceAll('{{SIZE}}', `${Math.round(fs.statSync(VIDEO).size / 1e6)} MB`)
  .replace('{{CHAPTERS}}', chapters.map(c => `  <li><button data-t="${c.t.toFixed(2)}"><time>${mmss(c.t)}</time>${c.name}</button></li>`).join('\n'));

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.copyFileSync(VIDEO, path.join(OUT, 'yingxian-tower-intro.mp4'));
fs.copyFileSync(POSTER, path.join(OUT, 'poster.jpg'));
console.log(`视频页 → docs/video/（${chapters.length} 个章节，${total.toFixed(1)} 秒）`);
