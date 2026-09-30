import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { loadFonts } from './fonts';
import { F, NOISE } from './theme';

loadFonts();

// 宣纸上大块的深浅不匀
const MOTTLE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.0035 .006' numOctaves='3' seed='11'/%3E%3CfeColorMatrix values='0 0 0 0 .42 0 0 0 0 .33 0 0 0 0 .2 0 0 0 .16 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E")`;

const INK = '#2b241d', MUTE = '#6f6452', SEAL = '#a8432e';

// 项目封面：宣纸底、竖排题名与朱印，剖面线稿衬底，前景是调柔和的彩色木塔（素材由 capture/capture.mjs cover 渲染）
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 62% 45%,transparent 45%,rgba(96,72,40,.16)),${MOTTLE},${NOISE},#ede5d3` }}>
    {/* 剖面线稿：像测绘图一样淡淡地衬在后面 */}
    <Img src={staticFile('cover/section-ink.png')} style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'translate(-200px,-6px) scale(.96)', transformOrigin: '50% 55%', opacity: 0.3, filter: 'sepia(.6)' }} />
    {/* 彩色木塔：降一点饱和度、偏一点暖，和纸色融在一起 */}
    <Img src={staticFile('cover/tower.png')} style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'translate(352px,-22px) scale(.9)', filter: 'saturate(.72) sepia(.16) contrast(.96) brightness(1.03)', maskImage: 'linear-gradient(to right,#000 70%,transparent 80%)', WebkitMaskImage: 'linear-gradient(to right,#000 70%,transparent 80%)' }} />

    {/* 双线边框 */}
    <div style={{ position: 'absolute', inset: 34, border: `1.5px solid rgba(43,36,29,.5)` }} />
    <div style={{ position: 'absolute', inset: 41, border: `.75px solid rgba(43,36,29,.35)` }} />

    {/* 竖排题名 + 印章 + 小字 */}
    <div style={{ position: 'absolute', left: 150, top: 150, display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 26 }}>
      <div style={{ writingMode: 'vertical-rl', fontFamily: F.disp, fontSize: 168, lineHeight: 1, letterSpacing: '.06em', color: INK }}>应县木塔</div>
      <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 14, marginTop: 20 }}>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(43,36,29,.35)', marginRight: 4 }} />
        <div style={{ writingMode: 'vertical-rl', fontFamily: F.serif, fontWeight: 500, fontSize: 30, letterSpacing: '.3em', color: INK }}>佛宫寺释迦塔</div>
        <div style={{ writingMode: 'vertical-rl', fontFamily: F.serif, fontSize: 21, letterSpacing: '.28em', color: MUTE, marginTop: 6 }}>辽清宁二年　公元一〇五六年</div>
      </div>
    </div>
    <div style={{
      position: 'absolute', left: 206, top: 890, width: 98, height: 98, padding: 7, borderRadius: 5, background: SEAL, color: '#f4ebdc',
      writingMode: 'vertical-rl', fontFamily: F.disp, fontSize: 41, lineHeight: 1, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center',
      boxShadow: 'inset 0 0 0 3px rgba(244,235,220,.18)', transform: 'rotate(-3deg)',
    }}>千年木构</div>

    {/* 副题 */}
    <div style={{ position: 'absolute', left: 360, bottom: 92, fontFamily: F.serif, color: MUTE }}>
      <div style={{ fontSize: 25, letterSpacing: '.18em', color: INK }}>一本可以一层层点进去的三维立体书</div>
      <div style={{ fontFamily: F.sans, fontSize: 13.5, letterSpacing: '.26em', marginTop: 10 }}>YINGXIAN WOODEN PAGODA · AN INTERACTIVE 3D POP-UP BOOK</div>
    </div>
  </AbsoluteFill>
);
