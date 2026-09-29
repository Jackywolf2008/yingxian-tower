// 每个镜头：打开立体书 → 按时间点执行动作（翻页 / 点按钮）→ 按关键帧运镜，逐帧抓取三维画面
// 相机参数与页面里的 PRE 预设同义：t 目标点，w/h 取景宽高（米），th 方位角，ph 俯仰角；sx 让塔在画面中横向偏移（占画面宽度的比例，正数偏右）
export const FPS = 30;

const go = (id, byTour = false) => `window.__app.go(${JSON.stringify(id)},true,${byTour})`;
const act = i => `document.querySelector('#tools [data-a="${i}"]').click()`;

export const SHOTS = [
  {
    name: 'hero', seconds: 6.5, staticShadow: true,
    events: [],
    cam: [
      { at: 0, t: [0, 30, 0], w: 40, h: 80, th: -0.3, ph: 1.5, sx: 0.12 },
      { at: 6.5, t: [0, 33, 0], w: 40, h: 75, th: 0.45, ph: 1.44, sx: 0.12 },
    ],
  },
  {
    name: 'eaves', seconds: 4, staticShadow: true,
    events: [{ at: 0, js: go('eaves') }],
    cam: [
      { at: 0, t: [0, 24, 0], w: 40, h: 52, th: -1.0, ph: 1.52, sx: 0.1 },
      { at: 4, t: [0, 25, 0], w: 40, h: 50, th: -0.6, ph: 1.47, sx: 0.1 },
    ],
  },
  {
    name: 'spire', seconds: 4, staticShadow: true,
    events: [{ at: 0, js: go('spire') }],
    cam: [
      { at: 0, t: [0, 60.5, 0], w: 11, h: 17, th: 0.1, ph: 1.37, sx: 0.1 },
      { at: 4, t: [0, 61, 0], w: 11, h: 16, th: 0.8, ph: 1.3, sx: 0.1 },
    ],
  },
  {
    name: 'levels', seconds: 6,
    events: [{ at: 0.5, js: go('levels') }],
    cam: [
      { at: 0, t: [0, 33, 0], w: 40, h: 80, th: 0.2, ph: 1.46, sx: 0.12 },
      { at: 0.5, t: [0, 33, 0], w: 40, h: 80, th: 0.22, ph: 1.46, sx: 0.12 },
      { at: 3.2, t: [0, 57, 0], w: 40, h: 124, th: 0.55, ph: 1.46, sx: 0.12 },
      { at: 6, t: [0, 57, 0], w: 40, h: 122, th: 0.8, ph: 1.46, sx: 0.12 },
    ],
  },
  {
    name: 'dark', seconds: 5.5, staticShadow: true,
    events: [{ at: 0.3, js: go('dark') }, { at: 3.0, js: act(0) }],
    cam: [
      { at: 0, t: [0, 16, 2], w: 30, h: 13, th: 0.2, ph: 1.42, sx: 0.12 },
      { at: 3.0, t: [0, 16, 2], w: 30, h: 13, th: 0.55, ph: 1.41, sx: 0.12 },
      { at: 4.6, t: [0, 33, 0], w: 40, h: 78, th: 0.75, ph: 1.45, sx: 0.12 },
      { at: 5.5, t: [0, 33, 0], w: 40, h: 77, th: 0.85, ph: 1.45, sx: 0.12 },
    ],
  },
  {
    name: 'section', seconds: 6,
    events: [{ at: 0.4, js: go('section') }],
    cam: [
      { at: 0, t: [0, 33, 0], w: 36, h: 78, th: -0.35, ph: 1.52, sx: -0.14 },
      { at: 6, t: [0, 33, 0], w: 36, h: 76, th: 0.3, ph: 1.5, sx: -0.14 },
    ],
  },
  {
    name: 'bracket', seconds: 8,
    events: [{ at: 0, js: go('bracket') }, { at: 3.5, js: act(0) }],
    cam: [
      { at: 0, t: [1.4, 4.7, 0], w: 7.8, h: 7.6, th: 0.2, ph: 1.32, sx: 0.1 },
      { at: 3.5, t: [1.4, 4.7, 0], w: 7.8, h: 7.6, th: 0.75, ph: 1.31, sx: 0.1 },
      { at: 5.5, t: [1.3, 5.9, 0], w: 8, h: 13.6, th: 0.95, ph: 1.3, sx: 0.1 },
      { at: 8, t: [1.3, 5.9, 0], w: 8, h: 13.4, th: 1.25, ph: 1.3, sx: 0.1 },
    ],
  },
  {
    name: 'fork', seconds: 4,
    events: [{ at: 0, js: go('fork') }, { at: 1.0, js: act(0) }],
    cam: [
      { at: 0, t: [0, 3.6, 0], w: 3.8, h: 7.4, th: 0.4, ph: 1.3, sx: 0.1 },
      { at: 1.0, t: [0, 3.7, 0], w: 3.9, h: 7.5, th: 0.55, ph: 1.3, sx: 0.1 },
      { at: 2.6, t: [0, 4.3, 0], w: 4.2, h: 8.2, th: 0.8, ph: 1.36, sx: 0.1 },
      { at: 4, t: [0, 4.3, 0], w: 4.2, h: 8.2, th: 1.0, ph: 1.36, sx: 0.1 },
    ],
  },
  {
    name: 'joint', seconds: 3.5,
    events: [{ at: 0, js: go('joint') }, { at: 0.8, js: act(0) }],
    cam: [
      { at: 0, t: [-0.1, 2.1, 0], w: 5.8, h: 4.8, th: 0.3, ph: 0.85, sx: 0.08 },
      { at: 3.5, t: [-0.3, 2.4, 0], w: 6.2, h: 5.2, th: 0.6, ph: 0.92, sx: 0.08 },
    ],
  },
  {
    name: 'quake', seconds: 4.5,
    events: [{ at: 0, js: go('quake') }],
    cam: [
      { at: 0, t: [0, 34, 0], w: 40, h: 76, th: -0.8, ph: 1.44, sx: 0.12 },
      { at: 4.5, t: [0, 34, 0], w: 40, h: 74, th: -0.55, ph: 1.44, sx: 0.12 },
    ],
  },
  {
    name: 'today', seconds: 4,
    events: [{ at: 0.3, js: go('today') }],
    cam: [
      { at: 0, t: [0, 33, 0], w: 40, h: 78, th: 0.3, ph: 1.5, sx: 0.12 },
      { at: 4, t: [0, 33, 0], w: 40, h: 76, th: 0.1, ph: 1.5, sx: 0.12 },
    ],
  },
  // 重建：页面按工序逐步长出木塔；虚拟时间 2 倍速，每 0.33 秒推进一步，相机按已盖到的高度升起并绕塔一周
  { name: 'build', seconds: 12.5, speed: 2, build: { start: 0.9, every: 0.33 } },
];
