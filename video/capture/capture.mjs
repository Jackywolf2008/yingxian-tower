// 逐帧抓取《应县木塔》立体书的真实三维画面，供 Remotion 合成
//
// 做法：本地起一个静态服务器发布 ../docs（与线上 GitHub Pages 相同的页面），用虚拟时钟接管
// performance.now / requestAnimationFrame / setTimeout，每推进 1/30 秒就从 WebGL 画布读出一帧（透明背景 WebP），
// 同时记下这一帧上所有标注的位置和文字，由 Remotion 重新绘制，保证文字清晰。
//
// 用法：node capture/capture.mjs [镜头名 ...]      （不带参数则抓全部；已抓完的镜头会跳过，删掉目录即可重抓）
// 环境变量：WORKERS 并行浏览器数（默认 4）
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHOTS, FPS } from './shots.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(HERE, '../../docs');
const OUT = path.resolve(HERE, '../public/shots');
const UI_OUT = path.resolve(HERE, '../public/ui');
const W = 1920, H = 1080, ASPECT = W / H, FOV = 34;
const WORKERS = +process.env.WORKERS || 4;

// ---------- 页面补丁：只在本地服务时注入，不改动仓库里的页面 ----------
const PATCHES = [
  // 由抓取脚本逐帧指定相机
  ['if(ptr.size)act=true;', 'if(ptr.size)act=true;if(window.__camFrame){const c=window.__camFrame;view.t.set(c.t[0],c.t[1],c.t[2]);view.r=c.r;view.th=c.th;view.ph=c.ph;act=true;}'],
  // 每帧都重绘，保证读到的画布是当帧内容
  ['if(needs>0){', 'if(needs>0||window.__forceRender){'],
  // 几何不动的镜头可以跳过阴影贴图重算（光源固定，只有相机在动）；__inkOnly 时只画墨线描边（封面用的线稿）
  ['renderer.shadowMap.needsUpdate=true;renderer.render(scene,cam);', 'if(!window.__noShadowUpd)renderer.shadowMap.needsUpdate=true;if(window.__inkOnly)renderer.clear();else renderer.render(scene,cam);'],
];
function patchHTML(s) {
  for (const [a, b] of PATCHES) {
    if (!s.includes(a)) throw new Error(`页面结构变了，找不到补丁位置：${a}`);
    s = s.replace(a, b);
  }
  return s;
}

const VCLOCK = `(()=>{let now=0;performance.now=()=>now;let rq=[],rid=1,ts=[],tid=1;
window.requestAnimationFrame=cb=>{const id=rid++;rq.push([id,cb]);return id;};
window.cancelAnimationFrame=id=>{rq=rq.filter(x=>x[0]!==id);};
window.setTimeout=(fn,ms=0,...a)=>{const id=tid++;ts.push({id,at:now+(+ms||0),fn,a});return id;};
window.clearTimeout=id=>{ts=ts.filter(t=>t.id!==id);};
window.__forceRender=true;
window.__vt={advance(ms){const tg=now+ms;for(;;){ts.sort((x,y)=>x.at-y.at||x.id-y.id);const t=ts[0];if(!t||t.at>tg)break;ts.shift();now=Math.max(now,t.at);try{typeof t.fn==='function'&&t.fn(...t.a);}catch(e){console.error(e);}}
 now=tg;const q=rq;rq=[];for(const [,cb] of q){try{cb(now);}catch(e){console.error(e);}}}};})();`;

const CLEAN_CSS = `body{overflow:hidden;background:transparent}.top,.chrome,.band,.panel,.notes,.plate,.tools,.hint,.tsub,.cap,.toc,.loading,.err{display:none!important}
.wrap{padding:0!important;max-width:none!important}.win{border:0!important;border-radius:0!important;box-shadow:none!important;background:none!important}
.page{display:block!important}.stage{position:fixed!important;inset:0!important;height:100vh!important;width:100vw!important;background:none!important}`;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      let p = decodeURIComponent(new URL(q.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(SITE, path.normalize(p));
      if (!f.startsWith(SITE)) { r.writeHead(403); r.end(); return; }
      fs.readFile(f, (e, b) => {
        if (e) { r.writeHead(404); r.end(); return; }
        if (f.endsWith('.html')) b = patchHTML(b.toString());
        r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
        r.end(b);
      });
    });
    srv.listen(0, () => res(srv));
  });
}

// ---------- 相机 ----------
const V = Math.tan(FOV * Math.PI / 360);
const fitR = (w, h) => (Math.max(h / 2 / V, w / 2 / (V * ASPECT)) + w * 0.3) * 1.14;
const ease = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, k) => a + (b - a) * k;
function toView(c) {
  const r = c.r ?? fitR(c.w, c.h), sx = c.sx || 0;
  // 目标点沿屏幕水平方向反向平移，塔就落在画面偏右（sx>0）或偏左（sx<0）
  const wv = 2 * r * V * ASPECT, rx = Math.cos(c.th), rz = -Math.sin(c.th);
  return { t: [c.t[0] - sx * wv * rx, c.t[1], c.t[2] - sx * wv * rz], r, th: c.th, ph: c.ph };
}
function camAt(keys, t) {
  if (t <= keys[0].at) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b.at) {
      const e = ease((t - a.at) / (b.at - a.at));
      const ra = fitR(a.w, a.h), rb = fitR(b.w, b.h);
      return {
        t: a.t.map((v, j) => lerp(v, b.t[j], e)), r: Math.exp(lerp(Math.log(ra), Math.log(rb), e)),
        th: lerp(a.th, b.th, e), ph: lerp(a.ph, b.ph, e), sx: lerp(a.sx || 0, b.sx || 0, e),
      };
    }
  }
  return keys[keys.length - 1];
}

// ---------- 抓一个镜头 ----------
async function newPage(browser, { viewport, dsf = 1, fonts = false, url = 'index.html', vclock = true }, port) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf, ignoreHTTPSErrors: true });
  if (!fonts) await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('[page error]', e.message));
  if (vclock) await page.addInitScript(VCLOCK);
  await page.goto(`http://localhost:${port}/${url}`, { waitUntil: 'domcontentloaded', timeout: 600000 });
  await page.waitForFunction(() => window.__app, null, { timeout: 600000 });
  return { ctx, page };
}

async function captureShot(browser, port, shot) {
  const dir = path.join(OUT, shot.name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const { ctx, page } = await newPage(browser, { viewport: { width: W, height: H } }, port);
  await page.addStyleTag({ content: CLEAN_CSS });
  const N = Math.round(shot.seconds * FPS), dt = 1000 / FPS * (shot.speed || 1);
  let events = [...(shot.events || [])], camFn, steps = [];

  if (shot.build) {
    const info = await page.evaluate(() => window.__app.STEPS.map(s => ({ name: s.name, level: s.level, tag: s.tag, top: s.top })));
    const { start, every } = shot.build, n = info.length;
    const at = k => start + (k - 1) * every;
    events.push({ at: 0, js: `window.__app.go('build',true,true)` });
    for (let k = 1; k <= n; k++) {
      events.push({ at: at(k), js: `document.querySelector('#blist [data-b="${k}"]').click()` });
      steps.push({ k, frame: Math.round(at(k) * FPS), name: info[k - 1].name, level: info[k - 1].level });
    }
    const tStatue = at(info.findIndex(s => s.tag === 'statue') + 1), tEnd = at(n);
    let sm = 0;
    // 相机随已盖到的高度升起，绕塔将近一周，塑像就位时正好转到剖开的一面，最后拉远看全貌
    camFn = t => {
      let top = 0;
      for (let k = 1; k <= n && at(k) <= t; k++) top = Math.max(top, info[k - 1].top);
      sm += (top - sm) * 0.12;
      const th = t < tStatue ? lerp(0.35, 2 * Math.PI, ease(t / tStatue)) : 2 * Math.PI + 0.05 * (t - tStatue);
      const ph = lerp(0.95, 1.4, ease(Math.min(1, t / (start + 5 * every))));
      const c = { t: [0, Math.max(5, sm * 0.5), 0], w: 46, h: Math.max(26, sm + 12), th, ph, sx: 0.12 };
      const k = Math.min(1, Math.max(0, (t - tEnd - 0.3) / 1.0));
      if (k > 0) {
        const f = { t: [0, 33, 0], w: 40, h: 78, th: 2 * Math.PI + 0.35, ph: 1.45, sx: 0.12 }, e = ease(k);
        return { t: c.t.map((v, j) => lerp(v, f.t[j], e)), r: Math.exp(lerp(Math.log(fitR(c.w, c.h)), Math.log(fitR(f.w, f.h)), e)), th: lerp(c.th, f.th, e), ph: lerp(c.ph, f.ph, e), sx: 0.12 };
      }
      return c;
    };
  } else camFn = t => camAt(shot.cam, t);

  // 预热几帧，让首页状态稳定
  const cam0 = toView(camFn(0));
  for (let i = 0; i < 3; i++) await page.evaluate(({ cam, dt }) => { window.__camFrame = cam; window.__vt.advance(dt); }, { cam: cam0, dt: 1000 / FPS });

  const labels = [], t0 = Date.now();
  events.sort((a, b) => a.at - b.at);
  for (let f = 0; f < N; f++) {
    const t = f / FPS, js = [];
    while (events.length && events[0].at <= t + 1e-6) js.push(events.shift().js);
    const cam = toView(camFn(t));
    const res = await page.evaluate(({ js, cam, dt, noShadow }) => {
      for (const c of js) new Function(c)();
      window.__camFrame = cam; window.__noShadowUpd = noShadow;
      window.__vt.advance(dt);
      const img = document.getElementById('gl').toDataURL('image/webp', 0.92);
      const lb = [...document.querySelectorAll('#labels .lb.on')].map(el => {
        const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform) || [0, 0, 0];
        return { t: el.lastChild.textContent, x: +(+m[1]).toFixed(1), y: +(+m[2]).toFixed(1), go: el.classList.contains('go') ? 1 : 0, flip: el.classList.contains('flip') ? 1 : 0 };
      });
      return { img, lb };
    }, { js, cam, dt, noShadow: !!shot.staticShadow && f >= 3 });
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.webp`), Buffer.from(res.img.split(',')[1], 'base64'));
    labels.push(res.lb);
    if (f % 30 === 29) console.log(`  ${shot.name} ${f + 1}/${N}  ${((Date.now() - t0) / (f + 1) / 1000).toFixed(2)} s/帧`);
  }
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ name: shot.name, fps: FPS, frames: N, width: W, height: H, steps, labels }));
  await ctx.close();
}

// ---------- 界面截图：真实页面（含面板、字幕、目录）；不用虚拟时钟，?fast 让相机和状态瞬间到位 ----------
const UI_STILLS = [
  { name: 'ui-home', js: [] },
  {
    name: 'ui-tour', js: [
      `window.__app.go('bracket')`, `document.querySelector('#tools [data-a="0"]').click()`,
      `(()=>{const $=id=>document.getElementById(id);$('tsub').hidden=false;$('tpos').textContent='导览 12 / 19 · 斗拱';
        $('ttxt').textContent=window.__app.PAGES.bracket.say[2].s;$('tPause').textContent='暂停';
        const b=$('tourBtn');b.textContent='❚❚ 导览';b.setAttribute('aria-pressed','true');$('hint').classList.add('gone');})()`,
    ],
  },
  { name: 'ui-toc', js: [`window.__app.go('dark')`, `document.getElementById('hint').classList.add('gone')`], after: `document.getElementById('tocBtn').click()` },
  { name: 'ui-build', js: [`window.__app.go('build',true,true)`, `document.querySelector('#blist [data-b="20"]').click()`, `document.getElementById('hint').classList.add('gone')`] },
];
async function captureUI(browser, port) {
  fs.mkdirSync(UI_OUT, { recursive: true });
  const { ctx, page } = await newPage(browser, { viewport: { width: 1440, height: 900 }, dsf: 1.5, fonts: true, url: 'index.html?fast', vclock: false }, port);
  // 等网页字体（马善政、思源宋体）加载好；网络不通时退回系统字体
  // document.fonts.check() 在字体样式表生效前也会返回 true，所以先等样式表生效，再主动加载并确认字体真的到了
  const fontsOk = await page.waitForFunction(async () => {
    const link = document.querySelector('link[href*="fonts.googleapis"]');
    if (!link || link.media !== 'all') return false;
    const text = document.body.innerText.slice(0, 4000);
    await Promise.all([
      document.fonts.load('40px "Ma Shan Zheng"', '应县木塔封面'),
      document.fonts.load('16px "Noto Serif SC"', text), document.fonts.load('700 16px "Noto Serif SC"', text),
      document.fonts.load('14px "Noto Sans SC"', text), document.fonts.load('700 14px "Noto Sans SC"', text),
    ]);
    const loaded = name => [...document.fonts].some(f => f.family.replace(/["']/g, '') === name && f.status === 'loaded');
    return loaded('Ma Shan Zheng') && loaded('Noto Serif SC') && loaded('Noto Sans SC');
  }, null, { timeout: 180000, polling: 1000 }).then(() => true, () => false);
  if (!fontsOk) console.warn('  网页字体没有加载成功，界面截图将使用系统字体');
  await page.evaluate(() => document.fonts.ready);
  for (const s of UI_STILLS) {
    if (fs.existsSync(path.join(UI_OUT, `${s.name}.png`))) continue;
    await page.evaluate(js => { for (const c of js) new Function(c)(); }, s.js);
    if (s.after) await page.evaluate(c => new Function(c)(), s.after);
    await page.waitForTimeout(5000); // 软件渲染帧率低，等画面、翻页和标注淡入都到位
    const box = await page.evaluate(() => { const w = document.getElementById('win').getBoundingClientRect(); return { x: w.left - 16, y: 0, width: w.width + 32, height: w.bottom + 16 }; });
    await page.screenshot({ path: path.join(UI_OUT, `${s.name}.png`), clip: box, timeout: 600000 });
    console.log(`  界面截图 ${s.name}`);
  }
  await ctx.close();
}

// ---------- 封面素材：超采样渲染彩色木塔与墨线线稿（透明背景 PNG），由 Remotion 的 Cover 合成 ----------
const COVER_OUT = path.resolve(HERE, '../public/cover');
const COVER_RENDERS = [
  { name: 'tower', page: 'home', cam: { t: [0, 33, 0], w: 40, h: 74, th: 0.52, ph: 1.5 } },
  { name: 'elev-ink', page: 'home', ink: true, cam: { t: [0, 33, 0], w: 40, h: 72, th: 0, ph: 1.555 } },
  { name: 'section-ink', page: 'section', ink: true, cam: { t: [0, 33, 0], w: 36, h: 72, th: 0, ph: 1.555 } },
];
async function captureCover(browser, port) {
  fs.mkdirSync(COVER_OUT, { recursive: true });
  // 3840×2160 的页面按 1.5 倍像素比渲染，得到 5760×3240 的画布，合成时再缩小，边缘更干净
  const { ctx, page } = await newPage(browser, { viewport: { width: 3840, height: 2160 }, dsf: 1.5, url: 'index.html?fast' }, port);
  await page.addStyleTag({ content: CLEAN_CSS });
  for (const r of COVER_RENDERS) {
    const cam = toView(r.cam);
    await page.evaluate(id => window.__app.go(id), r.page);
    // 画布不保留绘图缓冲：最后一帧的渲染和读取必须在同一次调用里
    let url;
    for (let i = 0; i < 3; i++) url = await page.evaluate(({ cam, ink }) => { window.__camFrame = cam; window.__inkOnly = ink; window.__vt.advance(50); return document.getElementById('gl').toDataURL('image/png'); }, { cam, ink: !!r.ink });
    fs.writeFileSync(path.join(COVER_OUT, `${r.name}.png`), Buffer.from(url.split(',')[1], 'base64'));
    console.log(`  封面素材 ${r.name}`);
  }
  await ctx.close();
}

// ---------- 调度 ----------
const want = process.argv.slice(2);
const LAB = new Set(['bracket', 'fork', 'joint']);
const cost = s => s.seconds * (LAB.has(s.name) ? 0.15 : 1);
const done = s => { try { return JSON.parse(fs.readFileSync(path.join(OUT, s.name, 'meta.json'))).frames === Math.round(s.seconds * FPS); } catch { return false; } };
const jobs = SHOTS.filter(s => (!want.length || want.includes(s.name)) && !done(s))
  .sort((a, b) => cost(b) - cost(a)) // 先抓整塔镜头（贵），构件特写（塔身隐藏，很快）放最后
  .map(s => ({ label: s.name, run: (b, p) => captureShot(b, p, s) }));
if ((!want.length || want.includes('ui')) && !UI_STILLS.every(s => fs.existsSync(path.join(UI_OUT, `${s.name}.png`))))
  jobs.splice(Math.min(1, jobs.length), 0, { label: 'ui', run: captureUI });
if (want.includes('cover')) jobs.push({ label: 'cover', run: captureCover });

const srv = await serve();
const port = srv.address().port;
console.log(`抓取 ${jobs.length} 项：${jobs.map(j => j.label).join('、') || '（全部已完成）'}`);
const T0 = Date.now();
await Promise.all(Array.from({ length: Math.min(WORKERS, jobs.length) }, async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (let job; (job = jobs.shift());) {
    console.log(`开始 ${job.label}`);
    try { await job.run(browser, port); console.log(`完成 ${job.label}（累计 ${((Date.now() - T0) / 60000).toFixed(1)} 分钟）`); }
    catch (e) { console.error(`失败 ${job.label}:`, e); process.exitCode = 1; }
  }
  await browser.close();
}));
srv.close();
