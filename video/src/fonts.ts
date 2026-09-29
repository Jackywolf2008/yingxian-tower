import { continueRender, delayRender, staticFile } from 'remotion';

// scripts/fetch-fonts.mjs 按视频里实际用到的字下载的子集字体，清单在 public/fonts/fonts.json
type FontEntry = { family: string; weight: string; file: string; unicodeRange?: string };

let started = false;
export function loadFonts() {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('加载字体');
  fetch(staticFile('fonts/fonts.json'))
    .then(r => r.json() as Promise<FontEntry[]>)
    .then(list => Promise.all(list.map(async f => {
      const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format('woff2')`, { weight: f.weight, unicodeRange: f.unicodeRange });
      document.fonts.add(await face.load());
    })))
    .catch(() => console.warn('没有找到字体，先运行 npm run fonts；现在用系统字体代替'))
    .finally(() => continueRender(handle));
}
