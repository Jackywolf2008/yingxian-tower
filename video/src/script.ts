import type { Cap } from './components';

// 每个三维镜头的牌子和字幕；中文取自立体书里导览的讲解词
type ShotText = { plate: { kicker: string; title: string; sub: string }; caps: Cap[]; side?: 'left' | 'right'; labels?: boolean };

export const SHOT_TEXT: Record<string, ShotText> = {
  hero: {
    plate: { kicker: '封面 · COVER', title: '应县木塔', sub: '佛宫寺释迦塔 · 辽清宁二年（1056）' },
    caps: [{ from: 95, to: 195, zh: '世界上现存最高、最古老的木结构楼阁式塔', en: 'The tallest and oldest surviving timber pagoda on Earth' }],
    labels: false,
  },
  eaves: {
    plate: { kicker: '外观 · EXTERIOR', title: '六重屋檐', sub: '五层六檐，檐角起翘' },
    caps: [{ from: 12, to: 120, zh: '五层塔身，加上首层副阶的一重，一共六重屋檐', en: 'Five storeys plus a ground-floor veranda: six tiers of eaves' }],
  },
  spire: {
    plate: { kicker: '塔顶 · FINIAL', title: '塔刹', sub: '塔顶上一座缩小的窣堵坡' },
    caps: [{ from: 12, to: 120, zh: '覆钵、相轮、宝盖、圆光，顶上是仰月和宝珠', en: 'A miniature stupa: bowl, rings, canopy, halo, crescent and jewel' }],
  },
  levels: {
    plate: { kicker: '结构 · STRUCTURE', title: '明五暗四', sub: '外看五层，里面九层' },
    caps: [
      { from: 10, to: 85, zh: '把塔一层层拉开……', en: 'Pull it apart, floor by floor…' },
      { from: 85, to: 180, zh: '五个明层之间，各夹着一个暗层，一共九层', en: 'Four hidden mezzanines between five floors: nine levels in all' },
    ],
  },
  dark: {
    plate: { kicker: '结构 · STRUCTURE', title: '暗层斜撑', sub: '四道刚性的腰箍' },
    caps: [
      { from: 10, to: 92, zh: '把墙变透明：斜撑连成一个个三角形', en: 'Make the walls transparent: diagonal braces form rigid triangles' },
      { from: 92, to: 165, zh: '四个暗层像四道腰箍，把内外两圈柱子箍在一起', en: 'Four hidden levels act as belts binding both rings of columns' },
    ],
  },
  section: {
    plate: { kicker: '内部 · INSIDE', title: '剖开看', sub: '沿中轴线一刀剖开' },
    caps: [{ from: 20, to: 180, zh: '两圈柱子套成筒中筒：里面供佛，外面走人', en: 'A tube within a tube: Buddhas inside, visitors outside' }],
    side: 'right',
  },
  bracket: {
    plate: { kicker: '构造 · BRACKETS', title: '斗拱', sub: '柱头上层层出挑的木构件' },
    caps: [
      { from: 10, to: 108, zh: '屋檐为什么能挑这么远？秘密在柱头上的斗拱', en: 'How do the eaves reach so far? The dougong brackets' },
      { from: 108, to: 240, zh: '几十个构件咬合成一组，点一下就知道名字', en: 'Dozens of interlocking pieces — click any one to see its name' },
    ],
  },
  fork: {
    plate: { kicker: '构造 · JOINERY', title: '叉柱造', sub: '上层柱怎么接到下层' },
    caps: [{ from: 10, to: 120, zh: '上层柱脚开十字口，像叉子一样骑在下层斗拱上', en: 'Upper columns straddle the brackets below, like a fork' }],
  },
  joint: {
    plate: { kicker: '构造 · JOINERY', title: '榫卯', sub: '不靠钉子，靠咬合' },
    caps: [{ from: 10, to: 105, zh: '燕尾榫头大颈小，越拉越紧', en: 'Dovetail tenons lock tighter as they are pulled — no nails needed' }],
  },
  quake: {
    plate: { kicker: '抗震 · EARTHQUAKES', title: '为什么震不倒', sub: '刚柔相济' },
    caps: [{ from: 10, to: 135, zh: '斗拱像减震垫，暗层像腰箍，榫卯在转动中耗能', en: 'Brackets cushion, mezzanines brace, joints absorb the shock' }],
  },
  today: {
    plate: { kicker: '现状 · TODAY', title: '今天的木塔', sub: '歪了，怎么修' },
    caps: [{ from: 10, to: 120, zh: '近千年后，二层柱子明显倾斜（模型里夸大了）', en: 'After 1,000 years the second floor leans (exaggerated here)' }],
  },
};

export const HERO_STATS = [
  { b: '1056', zh: '辽清宁二年起建', en: 'Built in the Liao dynasty' },
  { b: '67.31 m', zh: '塔高，约合二十多层楼', en: 'Tall as a 20-storey building' },
  { b: '5 + 4', zh: '明五暗四：外看五层，里面九层', en: '5 floors outside, 9 inside' },
];

// 重建步骤的英文名，按中文步骤名的规律生成
const NUM: Record<string, string> = { 一: '1', 二: '2', 三: '3', 四: '4', 五: '5' };
const FIXED: Record<string, string> = {
  夯基筑台: 'Ram the earth, build the platform',
  放线定柱网: 'Lay out the column grid',
  立首层柱: 'Raise the ground-floor columns',
  阑额普拍枋: 'Tie the column heads together',
  安斗拱: 'Set the bracket sets',
  铺椽盖瓦: 'Rafters and roof tiles',
  立铁刹: 'Raise the iron finial',
};
export function stepEn(name: string): string {
  if (FIXED[name]) return FIXED[name];
  const m = /^([一二三四五])层(.*)$/.exec(name);
  if (!m) return name;
  const n = NUM[m[1]];
  const rest: Record<string, string> = {
    暗层斜撑: `Mezzanine ${n}: diagonal bracing`, 平坐: `Floor ${n}: balcony platform`, 立柱: `Floor ${n}: columns`,
    斗拱: `Floor ${n}: bracket sets`, 墙与屋檐: `Floor ${n}: walls and eaves`, 塑像: `Floor ${n}: statues`,
  };
  return rest[m[2]] || name;
}
export const LEVELNAME = ['台基', '一层', '一层暗层', '二层', '二层暗层', '三层', '三层暗层', '四层', '四层暗层', '五层', '塔刹'];

export const UI_FEATURES = [
  { img: 'ui/ui-home.png', zh: '点红点、点构件，一层层往下钻', en: 'Click hotspots and parts to drill down' },
  { img: 'ui/ui-tour.png', zh: '点导览，字幕带你一路看下来', en: 'A guided tour with subtitles, 19 stops' },
  { img: 'ui/ui-toc.png', zh: '目录、前进后退，像翻一本书', en: 'Contents, breadcrumbs, back and forward' },
  { img: 'ui/ui-build.png', zh: '重建木塔：32 道工序', en: 'Rebuild the pagoda in 32 steps' },
];
