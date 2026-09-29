# 《拆开应县木塔》介绍视频

用 [Remotion](https://www.remotion.dev/) 做的一段约 90 秒的介绍视频（1920×1080，30fps），成片在 `out/yingxian-tower-intro.mp4`，封面图在 `out/intro-poster.jpg`。

在线观看：https://jackywolf2008.github.io/yingxian-tower/yingxian-tower-intro.mp4 （立体书页面底部也嵌了播放器）。根目录的 `build.sh` 会把成片和封面一起复制到 `docs/` 发布。

画面里的木塔不是另外建模，而是从线上这本立体书（`../docs/`）里逐帧抓下来的真实三维画面，标注、字幕、配乐再由 Remotion 合成。

## 结构

| 段落 | 内容 |
| --- | --- |
| 片头 | 书法标题、印章、中英文副题 |
| 封面 | 木塔环绕镜头，1056 / 67.31 m / 明五暗四 |
| 梁思成的一块钱 | 1933 年照片与营造学社立面图 |
| 六重屋檐、塔刹 | 外观 |
| 明五暗四、暗层斜撑、剖开看 | 结构：分层拉开、透视斜撑、沿中轴剖开（配营造学社剖面图） |
| 斗拱、叉柱造、榫卯 | 构件实验室：拆开看 |
| 为什么震不倒、今天的木塔 | 地震摇晃、二层倾斜 |
| 重建木塔 | 32 道工序，从空地盖起来 |
| 一本能点的书 | 真实界面：红点下钻、字幕导览、目录、重建面板 |
| 片尾 | 网址与出处 |

## 制作

```sh
npm install
npm run prepare-assets   # 抓三维画面和界面截图 → 复制图片 → 下载子集字体 → 生成配乐
npm run studio           # 在浏览器里预览、调整
npm run render           # 输出 out/yingxian-tower-intro.mp4
npm run poster           # 输出播放器封面 out/intro-poster.jpg
```

- `capture/capture.mjs`：本地发布 `../docs/`，用虚拟时钟接管页面的 `performance.now`、`requestAnimationFrame` 和 `setTimeout`，每推进 1/30 秒从 WebGL 画布读一帧（透明背景 WebP），同时记下每帧标注的位置。运镜和动作在 `capture/shots.mjs` 里按时间点编排。只在本地服务时给页面打三个小补丁（逐帧指定相机、强制重绘、跳过不必要的阴影重算），不改仓库里的页面。已抓完的镜头会跳过，删掉 `public/shots/<镜头>` 可以重抓。没有显卡时靠软件渲染，整套大约要一小时。
- `scripts/fetch-fonts.mjs`：扫描视频里用到的字，从 Google Fonts 下载马善政、思源宋体、思源黑体的子集。
- `scripts/make-music.mjs`：程序合成配乐，D 宫五声音阶的拨弦旋律加铁马风铃，段落按 `src/timeline.json` 的场景时间安排。
- `src/`：Remotion 合成。场景时长在 `src/timeline.json`，文字在 `src/script.ts`。改了三维镜头的时长，要同时改 `capture/shots.mjs` 并重抓。

在无法下载 Chrome 的环境里渲染，可以指定本机的 Chromium：`npx remotion render src/index.ts Intro out/yingxian-tower-intro.mp4 --browser-executable=<chromium 路径>`。

历史照片与测绘图出自梁思成《中国建筑史》和《图像中国建筑史》（中国营造学社测绘），版权归原作者所有。
