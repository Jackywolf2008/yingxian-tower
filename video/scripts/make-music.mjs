// 生成配乐 public/music.wav：D 宫五声音阶的拨弦旋律（Karplus-Strong）+ 低音持续音 + 铁马风铃，全部程序合成
// 段落按 src/timeline.json 的场景时间安排：片头风铃 → 旋律 → 重建段加快 → 片尾收在宫音
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/timeline.json'), 'utf8'));
const SR = 44100;
const starts = {};
let acc = 0;
TL.scenes.forEach(s => { starts[s.id] = acc / TL.fps; acc += s.frames - TL.transition; });
const TOTAL = (acc + TL.transition) / TL.fps;
const N = Math.ceil((TOTAL + 1) * SR);
const L = new Float32Array(N), R = new Float32Array(N);

let seed = 20260929;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
// D 宫五声：宫 商 角 徵 羽 = D E F# A B；idx 0 = D3
const DEG = [0, 2, 4, 7, 9];
const note = idx => 50 + 12 * Math.floor(idx / 5) + DEG[((idx % 5) + 5) % 5];

function mix(i, v, pan) { if (i >= 0 && i < N) { L[i] += v * (1 - pan) ; R[i] += v * (1 + pan); } }

// 拨弦：两根略微走音的弦叠在一起，更温暖
function pluck(t0, midi, amp = 0.3, dur = 3.2, bright = 0.55, pan = 0) {
  for (const det of [-0.04, 0.04]) {
    const f = mtof(midi + det), P = Math.max(2, Math.round(SR / f));
    const buf = new Float32Array(P);
    let prev = 0;
    for (let i = 0; i < P; i++) { const w = rnd() * 2 - 1; prev = prev + bright * (w - prev); buf[i] = prev; }
    const i0 = Math.round(t0 * SR), n = Math.round(dur * SR), rel = Math.round(0.08 * SR);
    let p = 0;
    for (let i = 0; i < n; i++) {
      const y = buf[p], nx = buf[(p + 1) % P];
      buf[p] = 0.4985 * (y + nx) * 1.0;
      p = (p + 1) % P;
      const env = i > n - rel ? (n - i) / rel : 1;
      mix(i0 + i, y * amp * 0.5 * env, pan + det * 2);
    }
  }
}

// 钟 / 风铃：非谐分音，指数衰减
function bell(t0, f, amp = 0.2, decay = 3, pan = 0) {
  const R_ = [1, 2.76, 5.4, 8.93], A = [1, 0.55, 0.32, 0.16], D = [1, 0.6, 0.35, 0.2];
  const n = Math.round(decay * 5 * SR), i0 = Math.round(t0 * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR, att = Math.min(1, t / 0.004);
    let v = 0;
    for (let k = 0; k < 4; k++) v += A[k] * Math.sin(2 * Math.PI * f * R_[k] * t) * Math.exp(-t / (decay * D[k]));
    mix(i0 + i, v * amp * att, pan);
  }
}
function chimes(t0, count = 7, span = 1.8, amp = 0.07) {
  for (let i = 0; i < count; i++) bell(t0 + rnd() * span, mtof(note(15 + Math.floor(rnd() * 6)) ), amp * (0.6 + rnd() * 0.4), 1.2, rnd() * 1.2 - 0.6);
}

// 低音持续音：宫、徵
function drone(t0, t1, amp = 0.045) {
  const i0 = Math.round(t0 * SR), i1 = Math.round(t1 * SR), fadeN = 3 * SR;
  for (let i = i0; i < i1 && i < N; i++) {
    const t = i / SR, k = Math.min(1, (i - i0) / fadeN, (i1 - i) / fadeN);
    const lfo = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.11 * t);
    const v = Math.sin(2 * Math.PI * 73.42 * t) + 0.6 * Math.sin(2 * Math.PI * 110.0 * t + 1) + 0.25 * Math.sin(2 * Math.PI * 146.83 * t * 1.002);
    mix(i, v * amp * k * lfo, 0);
  }
}

// ---------------- 编排 ----------------
const BEAT = 60 / 72;
const PHRASES = [
  [[8, 1], [7, .5], [6, .5], [5, 2], [6, 1], [8, 1], [9, 2]],
  [[10, 1.5], [9, .5], [8, 1], [7, 1], [6, 1], [5, 1], [6, 2]],
  [[5, 1], [6, 1], [8, 1.5], [7, .5], [6, 1], [3, 1], [5, 2]],
  [[8, .5], [9, .5], [10, 1], [9, 1], [8, 1], [7, 1], [8, 1], [5, 2]],
  [[6, 1], [7, 1], [8, 2], [10, 1], [9, .5], [8, .5], [7, 2]],
  [[9, 1.5], [8, .5], [6, 1], [5, 1], [3, 1], [5, 1], [5, 2]],
];

drone(0.2, TOTAL + 0.5);
chimes(0.3, 9, 2.2, 0.08);
bell(1.75, mtof(50), 0.16, 3.5);            // 朱印落下：一声低钟
bell(starts.hero, mtof(62), 0.07, 2.5, -0.2);

// 主旋律：从 hero 开始，每两句之间留一拍呼吸
let t = starts.hero + BEAT, pi = 0;
const melodyEnd = starts.end - BEAT;
while (t < melodyEnd) {
  const ph = PHRASES[pi % PHRASES.length];
  for (const [idx, d] of ph) {
    if (t >= melodyEnd) break;
    pluck(t, note(idx), 0.34, Math.max(1.6, d * BEAT * 2.4), 0.5, 0.15);
    t += d * BEAT;
  }
  pi++;
  t += pi % 2 ? BEAT : 2 * BEAT;
}
// 低音：每小节一次，宫徵交替
for (let b = starts.hero, k = 0; b < starts.end + 4 * BEAT; b += 4 * BEAT, k++) pluck(b, k % 2 ? 45 : 38, 0.3, 3.4, 0.35, -0.25);

// 重建段：八分音符的琶音，一层层往上盖
const buildEnd = starts.build + (TL.scenes.find(s => s.id === 'build').frames - 30) / TL.fps;
const ARP = [0, 3, 5, 3, 1, 3, 6, 3];
for (let b = starts.build + 0.3, k = 0; b < buildEnd; b += BEAT / 2, k++) {
  const lift = Math.floor((b - starts.build) / ((buildEnd - starts.build) / 3));
  pluck(b, note(ARP[k % 8] + 5 + lift), 0.11 + 0.05 * (b - starts.build) / (buildEnd - starts.build), 1.3, 0.7, 0.35);
}
chimes(starts.build + 11.2, 6, 1.4, 0.07);   // 落成
// 片尾：一句收在宫音，风铃
[[8, 1], [7, 1], [6, 1], [5, 3]].reduce((tt, [idx, d]) => { pluck(tt, note(idx), 0.34, 4, 0.5, 0.1); return tt + d * BEAT; }, starts.end + 0.2);
pluck(starts.end + 0.2 + 3 * BEAT, 38, 0.32, 5, 0.35, 0);
chimes(starts.end + 1.2, 8, 2.4, 0.07);

// ---------------- 混响（Freeverb） ----------------
function reverb(inp, spread) {
  const out = new Float32Array(N);
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map(d => ({ b: new Float32Array(d + spread), p: 0, s: 0 }));
  const aps = [556, 441, 341, 225].map(d => ({ b: new Float32Array(d + spread), p: 0 }));
  for (let i = 0; i < N; i++) {
    const x = inp[i] * 0.015;
    let y = 0;
    for (const c of combs) { const o = c.b[c.p]; c.s = o * 0.8 + c.s * 0.2; c.b[c.p] = x + c.s * 0.86; c.p = (c.p + 1) % c.b.length; y += o; }
    for (const a of aps) { const o = a.b[a.p]; a.b[a.p] = y + o * 0.5; a.p = (a.p + 1) % a.b.length; y = o - y; }
    out[i] = y;
  }
  return out;
}
const wl = reverb(L, 0), wr = reverb(R, 23);
let peak = 0;
for (let i = 0; i < N; i++) { L[i] = L[i] * 0.8 + wl[i] * 0.9; R[i] = R[i] * 0.8 + wr[i] * 0.9; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
const g = 0.8 / peak;

// ---------------- 写 WAV ----------------
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * g * 32767))), i * 4);
  data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(R[i] * g * 32767))), i * 4 + 2);
}
const h = Buffer.alloc(44);
h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28);
h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
fs.mkdirSync(path.join(ROOT, 'public'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'public/music.wav'), Buffer.concat([h, data]));
console.log(`配乐 ${TOTAL.toFixed(1)} 秒 → public/music.wav`);
