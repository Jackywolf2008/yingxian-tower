// 与立体书页面同一套颜色：纸、墨、青绿、朱、黄
export const C = {
  paper: '#e9e3d3',
  sheet: '#f5f1e6',
  stage: '#eee8d9',
  ink: '#29231c',
  mute: '#675e51',
  line: '#d4c9b0',
  line2: '#b7aa8d',
  qing: '#2b5876',
  lu: '#37705a',
  zhu: '#b13d28',
  huang: '#ad802b',
  on: '#f7f3e9',
};

export const F = {
  disp: '"Ma Shan Zheng", "STKaiti", "KaiTi", serif',
  serif: '"Noto Serif SC", "Songti SC", "STSong", serif',
  sans: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
};

// 页面顶部那条青绿—朱—黄的色带
export const BAND = `linear-gradient(90deg,${C.qing} 0 18%,${C.lu} 18% 33%,${C.huang} 33% 43%,${C.zhu} 43% 57%,${C.huang} 57% 67%,${C.lu} 67% 82%,${C.qing} 82%)`;

// 纸面噪点，与页面舞台背景相同
export const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .28 0 0 0 0 .18 0 0 0 .1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const SITE_URL = 'jackywolf2008.github.io/yingxian-tower';
