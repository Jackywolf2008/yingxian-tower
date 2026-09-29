import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Band, Captions, Labels, Mounted, Paper, Plate, ShotFrames, fade, rise, useShotMeta } from './components';
import { HERO_STATS, LEVELNAME, SHOT_TEXT, UI_FEATURES, stepEn } from './script';
import { C, F, SITE_URL } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ---------------- 片头 ----------------
export const Title: React.FC = () => {
  const f = useCurrentFrame();
  const chars = [...'拆开应县木塔'];
  return (
    <Paper tone={C.paper}>
      <Band progress={rise(f, 0, 26)} top={0} height={12} />
      <Band progress={rise(f, 0, 26)} top={1068} height={12} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 36 }}>
          <div style={{ display: 'flex' }}>
            {chars.map((ch, i) => {
              const k = rise(f, 10 + i * 6, 16);
              return (
                <span key={i} style={{ fontFamily: F.disp, fontSize: 196, lineHeight: 1, color: C.ink, letterSpacing: '.04em', opacity: k, filter: `blur(${(1 - k) * 8}px)`, transform: `translateY(${(1 - k) * 18}px) scale(${1.06 - 0.06 * k})`, display: 'inline-block' }}>{ch}</span>
              );
            })}
          </div>
          {/* 印章“千年木构”：竖排，从右往左读 */}
          <div style={{
            marginTop: 26, width: 112, height: 112, background: C.zhu, color: C.on, borderRadius: 6, padding: 8,
            writingMode: 'vertical-rl', fontFamily: F.disp, fontSize: 46, lineHeight: 1, letterSpacing: 0, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center',
            opacity: rise(f, 52, 10), transform: `scale(${1.4 - 0.4 * rise(f, 52, 10)}) rotate(-4deg)`,
          }}>千年木构</div>
        </div>
        <div style={{ marginTop: 34, fontFamily: F.serif, fontWeight: 500, fontSize: 40, color: C.ink, opacity: rise(f, 58, 18), letterSpacing: '.02em' }}>
          Taking Apart the Yingxian Wooden Pagoda
        </div>
        <div style={{ marginTop: 18, fontFamily: F.serif, fontSize: 28, color: C.mute, opacity: rise(f, 70, 18) }}>
          一本可以一层层点进去的三维立体书 · An interactive 3D pop-up book
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// ---------------- 通用三维镜头 ----------------
export const Shot: React.FC<{ id: string; frames: number; children?: React.ReactNode }> = ({ id, frames, children }) => {
  const meta = useShotMeta(id);
  const txt = SHOT_TEXT[id];
  return (
    <Paper>
      <ShotFrames name={id} frames={frames} />
      {txt?.labels !== false && <Labels meta={meta} />}
      {children}
      {txt && <Plate {...txt.plate} />}
      {txt && <Captions items={txt.caps} side={txt.side} />}
    </Paper>
  );
};

export const Hero: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <Shot id="hero" frames={frames}>
      <div style={{ position: 'absolute', left: 80, top: 340, display: 'grid', gap: 26 }}>
        {HERO_STATS.map((s, i) => {
          const k = rise(f, 26 + i * 16, 20);
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '250px 1fr', alignItems: 'baseline', gap: 20, borderTop: `1.5px dashed ${C.line2}`, paddingTop: 16, width: 720, opacity: k, transform: `translateX(${(1 - k) * -24}px)` }}>
              <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 60, color: C.qing, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{s.b}</div>
              <div>
                <div style={{ fontFamily: F.serif, fontSize: 28, color: C.ink, lineHeight: 1.4 }}>{s.zh}</div>
                <div style={{ fontFamily: F.serif, fontSize: 19, color: C.mute, lineHeight: 1.4 }}>{s.en}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Shot>
  );
};

export const Section: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  const k = rise(f, 70, 22);
  return (
    <Shot id="section" frames={frames}>
      <Mounted src="img/liang-sect.jpg" height={560} caption="中国营造学社测绘的剖面图" sub="梁思成《图像中国建筑史》手绘图"
        style={{ right: 150, top: 96, opacity: k, transform: `translateY(${(1 - k) * 30}px)` }} zoom={interpolate(f, [70, 180], [1, 1.04], clamp)} />
    </Shot>
  );
};

// 重建：左下角显示当前工序与进度
export const Build: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  const meta = useShotMeta('build');
  const steps = meta?.steps || [];
  const n = steps.length || 32;
  const cur = [...steps].reverse().find(s => s.frame <= f);
  const k = cur ? cur.k : 0;
  const done = k >= n && f > (steps[n - 1]?.frame ?? 1e9) + 10;
  const intro = fade(f, 4, 44, 10);
  return (
    <Paper>
      <ShotFrames name="build" frames={frames} />
      <Plate kicker="建造 · BUILD" title="重建木塔" sub="从一块空地开始" />
      <div style={{ position: 'absolute', left: 72, bottom: 72, width: 780, padding: '18px 28px 22px', background: 'rgba(245,241,230,.95)', border: `1.5px solid ${C.ink}`, display: 'grid' }}>
        <div style={{ gridArea: '1/1', opacity: intro }}>
          <div style={{ fontFamily: F.serif, fontWeight: 500, fontSize: 34, lineHeight: 1.55, color: C.ink }}>像辽代工匠一样，从一块空地把木塔重新盖一遍</div>
          <div style={{ fontFamily: F.serif, fontSize: 21, color: C.mute, marginTop: 6 }}>Rebuild it from bare ground, the way Liao-dynasty carpenters did</div>
        </div>
        <div style={{ gridArea: '1/1', opacity: 1 - intro }}>
          <div style={{ fontFamily: F.sans, fontSize: 19, letterSpacing: '.14em', color: C.zhu, fontWeight: 700 }}>
            {done ? `全部 ${n} 步 · 落成` : cur ? `第 ${k} / ${n} 步 · ${LEVELNAME[cur.level]}` : ''}
          </div>
          <div style={{ fontFamily: F.disp, fontSize: 60, lineHeight: 1.2, color: C.ink, marginTop: 4 }}>{done ? '一座木构的佛国' : cur?.name}</div>
          <div style={{ fontFamily: F.serif, fontSize: 21, color: C.mute }}>{done ? 'A timber Buddhist paradise, complete' : cur ? stepEn(cur.name) : ''}</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
            {Array.from({ length: n }, (_, i) => (
              <div key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i < k - 1 ? C.lu : i === k - 1 ? C.zhu : C.line }} />
            ))}
          </div>
        </div>
      </div>
    </Paper>
  );
};

// ---------------- 梁思成的测绘 ----------------
const Story: React.FC<{ kicker: string; title: string; zh: string; en: string; at: number }> = ({ kicker, title, zh, en, at }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 900, top: 250, width: 860 }}>
      <div style={{ fontFamily: F.sans, fontSize: 20, letterSpacing: '.22em', color: C.zhu, fontWeight: 700, opacity: rise(f, at, 14) }}>{kicker}</div>
      <div style={{ fontFamily: F.disp, fontSize: 104, lineHeight: 1.15, color: C.ink, marginTop: 8, opacity: rise(f, at + 4, 18) }}>{title}</div>
      <div style={{ width: 120, height: 3, background: C.huang, margin: '26px 0 28px', transform: `scaleX(${rise(f, at + 8, 18)})`, transformOrigin: 'left' }} />
      <div style={{ fontFamily: F.serif, fontWeight: 500, fontSize: 36, lineHeight: 1.7, color: C.ink, opacity: rise(f, at + 12, 18), textWrap: 'pretty' } as React.CSSProperties}>{zh}</div>
      <div style={{ fontFamily: F.serif, fontSize: 23, lineHeight: 1.6, color: C.mute, marginTop: 16, opacity: rise(f, at + 18, 18) }}>{en}</div>
    </div>
  );
};

export const History: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [96, 112], [1, 0], clamp), b = 1 - a;
  return (
    <Paper tone={C.paper}>
      <AbsoluteFill style={{ opacity: a }}>
        <Mounted src="img/ta-1933.jpg" height={690} caption="1933 年中国营造学社考察时拍摄的应县木塔" sub="梁思成《中国建筑史》图 64"
          style={{ left: 230, top: 110, opacity: rise(f, 0, 16) }} zoom={interpolate(f, [0, 112], [1, 1.07], clamp)} />
        <Story at={6} kicker="年表 · 1933" title="梁思成的一块钱"
          zh="1933 年，梁思成给应县的照相馆寄去一块钱，求一张木塔照片；随后与中国营造学社的同人赶来实测。"
          en="In 1933, Liang Sicheng mailed one yuan to a photo studio in Yingxian for a picture of the pagoda — then came with his colleagues to survey it by hand." />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: b }}>
        <Mounted src="img/liang-elev.jpg" height={720} caption="中国营造学社测绘的立面图" sub="梁思成《图像中国建筑史》手绘图"
          style={{ left: 240, top: 96 }} zoom={interpolate(f, [96, 210], [1.06, 1], clamp)} />
        <Story at={104} kicker="测绘 · SURVEY" title="按图搭建"
          zh="三维模型的结构，按他们的测绘图和记述搭建：八角平面，明五暗四，塔高 67.31 米。"
          en="The 3D model follows their drawings and notes: an octagonal plan, five storeys outside and nine inside, 67.31 metres tall." />
      </AbsoluteFill>
    </Paper>
  );
};

// ---------------- 真实界面 ----------------
export const UIShowcase: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  const per = frames / UI_FEATURES.length;
  const idx = Math.min(UI_FEATURES.length - 1, Math.floor(f / per));
  const win = rise(f, 0, 22);
  return (
    <Paper tone={C.paper}>
      <div style={{ position: 'absolute', left: 72, top: 150, width: 500 }}>
        <div style={{ fontFamily: F.sans, fontSize: 20, letterSpacing: '.22em', color: C.zhu, fontWeight: 700 }}>操作 · HOW IT WORKS</div>
        <div style={{ fontFamily: F.disp, fontSize: 84, lineHeight: 1.15, color: C.ink, marginTop: 6, whiteSpace: 'nowrap' }}>一本能点的书</div>
        <div style={{ marginTop: 34, borderTop: `1.5px solid ${C.ink}` }}>
          {UI_FEATURES.map((u, i) => {
            const on = i === idx;
            const k = rise(f, 10 + i * 8, 16);
            return (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '18px 6px', borderBottom: `1.5px solid ${C.line2}`, opacity: k * (on ? 1 : 0.45), background: on ? 'rgba(177,61,40,.07)' : 'transparent' }}>
                <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 26, color: on ? C.zhu : C.line2, width: 34 }}>{i + 1}</div>
                <div>
                  <div style={{ fontFamily: F.serif, fontWeight: on ? 700 : 500, fontSize: 27, lineHeight: 1.45, color: C.ink }}>{u.zh}</div>
                  <div style={{ fontFamily: F.serif, fontSize: 18, color: C.mute, marginTop: 2 }}>{u.en}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* 浏览器窗口 */}
      <div style={{ position: 'absolute', right: 72, top: 96, width: 1220, borderRadius: 14, overflow: 'hidden', background: C.sheet, border: `1.5px solid ${C.line2}`, boxShadow: '0 40px 80px -40px rgba(40,28,10,.6)', opacity: win, transform: `translateY(${(1 - win) * 40}px)` }}>
        <div style={{ height: 50, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', background: '#e2dac6', borderBottom: `1px solid ${C.line2}` }}>
          {['#d9695a', '#dfb04c', '#76a95e'].map(c => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
          <div style={{ marginLeft: 16, flex: 1, height: 32, borderRadius: 16, background: C.sheet, display: 'flex', alignItems: 'center', padding: '0 18px', fontFamily: F.sans, fontSize: 17, color: C.mute }}>
            <span style={{ color: C.lu, marginRight: 8 }}>🔒</span>{SITE_URL}
          </div>
        </div>
        <div style={{ position: 'relative', height: 820, overflow: 'hidden' }}>
          {UI_FEATURES.map((u, i) => {
            // 截图不透明：后一张淡入盖住前一张即可
            const op = i === 0 ? 1 : interpolate(f, [i * per - 8, i * per + 8], [0, 1], clamp);
            if (op <= 0 || i < idx - 1) return null;
            const z = interpolate(f, [i * per - 8, (i + 1) * per], [1, 1.035], clamp);
            return <Img key={i} src={staticFile(u.img)} style={{ position: 'absolute', left: 0, top: 0, width: '100%', opacity: op, transform: `scale(${z})`, transformOrigin: '60% 40%' }} />;
          })}
        </div>
      </div>
    </Paper>
  );
};

// ---------------- 片尾 ----------------
export const End: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Paper>
      <Img src={staticFile('shots/build/f0374.webp')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: rise(f, 0, 30) }} />
      <Band progress={rise(f, 6, 26)} top={0} height={12} />
      <div style={{ position: 'absolute', left: 96, top: 230, width: 860 }}>
        <div style={{ fontFamily: F.disp, fontSize: 150, lineHeight: 1.05, color: C.ink, opacity: rise(f, 8, 20) }}>拆开应县木塔</div>
        <div style={{ fontFamily: F.serif, fontWeight: 500, fontSize: 40, color: C.ink, marginTop: 36, opacity: rise(f, 20, 18) }}>打开网页，自己拆一遍</div>
        <div style={{ fontFamily: F.serif, fontSize: 26, color: C.mute, marginTop: 8, opacity: rise(f, 26, 18) }}>Open it — and take it apart yourself</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 40, padding: '16px 30px', borderRadius: 40, background: C.qing, color: C.on, fontFamily: F.sans, fontWeight: 700, fontSize: 32, opacity: rise(f, 34, 18), transform: `scale(${0.94 + 0.06 * rise(f, 34, 18)})` }}>
          {SITE_URL}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 96, bottom: 70, width: 1000, fontFamily: F.sans, fontSize: 18, lineHeight: 1.7, color: C.mute, opacity: rise(f, 44, 20) }}>
        历史照片与测绘图出自梁思成《中国建筑史》《图像中国建筑史》（中国营造学社测绘）· 三维：Three.js · 视频：Remotion
      </div>
    </Paper>
  );
};

