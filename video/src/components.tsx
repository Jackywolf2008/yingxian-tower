import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { BAND, C, F, NOISE } from './theme';

export type Label = { t: string; x: number; y: number; go: 0 | 1; flip: 0 | 1 };
export type ShotMeta = { name: string; frames: number; labels: Label[][]; steps: { k: number; frame: number; name: string; level: number }[] };

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const fade = (f: number, a: number, b: number, len = 12) =>
  interpolate(f, [a, a + len, b - len, b], [0, 1, 1, 0], clamp);
export const rise = (f: number, at: number, len = 18) =>
  interpolate(f, [at, at + len], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

// 舞台：纸色 + 噪点 + 暗角，与立体书页面的舞台一致
export const Paper: React.FC<{ children?: React.ReactNode; tone?: string }> = ({ children, tone = C.stage }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%,transparent 55%,rgba(90,70,40,.12)),${NOISE},${tone}` }}>
    {children}
  </AbsoluteFill>
);

export const Band: React.FC<{ progress?: number; top?: number; height?: number }> = ({ progress = 1, top = 0, height = 10 }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top, height, background: BAND, clipPath: `inset(0 ${50 - progress * 50}% 0 ${50 - progress * 50}%)` }} />
);

// 页面左上角的“书签牌”：小字类别 + 书法标题 + 副题，带翻页动画
export const Plate: React.FC<{ kicker: string; title: string; sub?: string; at?: number; x?: number; y?: number }> = ({ kicker, title, sub, at = 6, x = 72, y = 64 }) => {
  const f = useCurrentFrame();
  const k = rise(f, at, 20);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, maxWidth: 520, padding: '14px 26px 18px',
      background: 'rgba(245,241,230,.9)', border: `1.5px solid ${C.ink}`, outline: `1.5px solid ${C.ink}`, outlineOffset: 5,
      opacity: k, transform: `perspective(900px) rotateY(${(1 - k) * -14}deg) translateX(${(1 - k) * -10}px)`, transformOrigin: 'left center',
    }}>
      <div style={{ fontFamily: F.sans, fontSize: 19, letterSpacing: '.22em', color: C.zhu, fontWeight: 700 }}>{kicker}</div>
      <div style={{ fontFamily: F.disp, fontSize: 72, lineHeight: 1.1, marginTop: 4, color: C.ink }}>{title}</div>
      {sub && <div style={{ fontFamily: F.serif, fontSize: 23, color: C.mute, marginTop: 4, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
};

// 字幕框：中文一行 + 英文一行；多条字幕在同一个框里交替
export type Cap = { from: number; to: number; zh: string; en: string };
export const Captions: React.FC<{ items: Cap[]; side?: 'left' | 'right'; width?: number; bottom?: number }> = ({ items, side = 'left', width = 780, bottom = 72 }) => {
  const f = useCurrentFrame();
  if (!items.length) return null;
  const first = items[0].from, last = items[items.length - 1].to;
  const box = fade(f, first, last, 12);
  if (box <= 0) return null;
  return (
    <div style={{
      position: 'absolute', bottom, [side]: 72, width, padding: '18px 28px 20px',
      background: 'rgba(245,241,230,.95)', border: `1.5px solid ${C.ink}`, display: 'grid',
      opacity: box, transform: `translateY(${(1 - box) * 12}px)`,
    }}>
      {items.map((c, i) => {
        const o = items.length === 1 ? 1 : fade(f, c.from, c.to, 10);
        return (
          <div key={i} style={{ gridArea: '1 / 1', opacity: o }}>
            <div style={{ fontFamily: F.serif, fontWeight: 500, fontSize: 34, lineHeight: 1.55, color: C.ink, textWrap: 'balance' } as React.CSSProperties}>{c.zh}</div>
            <div style={{ fontFamily: F.serif, fontSize: 21, lineHeight: 1.5, color: C.mute, marginTop: 6, textWrap: 'balance' } as React.CSSProperties}>{c.en}</div>
          </div>
        );
      })}
    </div>
  );
};

// 抓取时记下的每帧元数据（标注位置、重建步骤）
export function useShotMeta(name: string): ShotMeta | null {
  const [meta, setMeta] = useState<ShotMeta | null>(null);
  const [handle] = useState(() => delayRender(`镜头数据 ${name}`));
  useEffect(() => {
    fetch(staticFile(`shots/${name}/meta.json`))
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(m => { setMeta(m); continueRender(handle); })
      .catch(() => { console.warn(`缺少镜头 ${name}，先运行 npm run capture`); continueRender(handle); });
  }, [handle, name]);
  return meta;
}

// 逐帧的三维画面（透明背景）
export const ShotFrames: React.FC<{ name: string; frames: number; style?: React.CSSProperties }> = ({ name, frames, style }) => {
  const f = Math.max(0, Math.min(frames - 1, useCurrentFrame()));
  return <Img src={staticFile(`shots/${name}/f${String(f).padStart(4, '0')}.webp`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }} />;
};

// 标注：黑点 + 白底黑框小字；可点的“红点”用朱色，并有向外扩散的波纹
const S = 1.55;
export const Labels: React.FC<{ meta: ShotMeta | null; hide?: (t: string) => boolean }> = ({ meta, hide }) => {
  const frame = useCurrentFrame();
  if (!meta) return null;
  const f = Math.max(0, Math.min(meta.frames - 1, frame));
  const cur = meta.labels[f] || [];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {cur.filter(l => !hide || !hide(l.t)).map(l => {
        let age = 0;
        while (age < 9 && f - age - 1 >= 0 && meta.labels[f - age - 1].some(q => q.t === l.t)) age++;
        const o = Math.min(1, (age + 1) / 9);
        const d = l.go ? 12 * S : 8 * S, ping = ((frame + 7) % 54) / 54;
        return (
          <div key={l.t} style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${l.x}px,${l.y}px)`, opacity: o, fontFamily: F.sans }}>
            {l.go ? <div style={{ position: 'absolute', left: -d, top: -d, width: d * 2, height: d * 2, borderRadius: '50%', border: `${2 * S}px solid ${C.zhu}`, transform: `scale(${0.5 + ping * 1.1})`, opacity: 0.9 * (1 - ping) }} /> : null}
            <div style={{ position: 'absolute', left: -d / 2, top: -d / 2, width: d, height: d, borderRadius: '50%', background: l.go ? C.zhu : C.ink, boxShadow: `0 0 0 ${2 * S}px ${C.sheet}` }} />
            <div style={{
              position: 'absolute', [l.flip ? 'right' : 'left']: 11 * S, top: 0, transform: 'translateY(-50%)', whiteSpace: 'nowrap',
              background: C.sheet, color: l.go ? C.zhu : C.ink, fontWeight: l.go ? 700 : 400, fontSize: 12.5 * S, lineHeight: 1.3,
              padding: `${3 * S}px ${8 * S}px ${4 * S}px`, border: `${S}px solid ${l.go ? C.zhu : C.ink}`, borderRadius: 3 * S,
            }}>{l.t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 装裱起来的老照片 / 测绘图
export const Mounted: React.FC<{ src: string; height: number; caption?: string; sub?: string; style?: React.CSSProperties; zoom?: number }> = ({ src, height, caption, sub, style, zoom = 1 }) => (
  <div style={{ position: 'absolute', ...style }}>
    <div style={{ height, overflow: 'hidden', border: `1.5px solid ${C.ink}`, outline: `1.5px solid ${C.ink}`, outlineOffset: 6, background: C.paper, boxShadow: '0 30px 60px -30px rgba(40,28,10,.55)' }}>
      <Img src={staticFile(src)} style={{ height: '100%', display: 'block', transform: `scale(${zoom})`, transformOrigin: '50% 40%' }} />
    </div>
    {caption && <div style={{ marginTop: 22, fontFamily: F.serif, fontSize: 21, color: C.ink, lineHeight: 1.5 }}>{caption}</div>}
    {sub && <div style={{ fontFamily: F.sans, fontSize: 16, color: C.mute, lineHeight: 1.5 }}>{sub}</div>}
  </div>
);
