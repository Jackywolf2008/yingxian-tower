# 应县木塔

一本可以一层层点进去的应县木塔（佛宫寺释迦塔）立体书：三维模型的结构按梁思成的测绘图与记述搭建，可以点图下钻、看自动导览，最后从空地把木塔重新盖起来。

在线访问：https://jackywolf2008.github.io/yingxian-tower/

介绍视频（约 90 秒，单独一页）：https://jackywolf2008.github.io/yingxian-tower/video/

- `index.html`：页面源码
- `build.sh`：把 `index.html` 包成完整网页，连同图片输出到 `docs/`（GitHub Pages 从 `docs/` 发布）；三维引擎 [three.js](https://threejs.org/)（0.186.1，ES 模块）也打包成 `docs/three.module.min.js` 随站点发布，升级时改 `index.html` 里 importmap 的版本号再运行一次即可（需要 Node.js）
- `video/`：用 Remotion 做的约 90 秒介绍视频，画面从立体书里逐帧抓取；`npm run page` 把它发布成独立页面 `docs/video/`（见 `video/README.md`）

## 许可

- **代码**：[MIT](LICENSE)。包括 `index.html` 里的 HTML、CSS、JavaScript（含生成三维模型的代码）、`build.sh`，以及 `video/` 下的源代码与脚本。
- **内容**：[CC BY 4.0](LICENSE-CONTENT)。包括立体书里的讲解文字与导览词（虽然写在 `index.html` 里，也按这一条授权）、立体书的画面、项目封面（`video/out/cover.jpg`），以及介绍视频（`video/out/`、`docs/video/`）和它的配乐。可以转载、改编，也可以商用，但要署名并注明出处，例如：

  > 应县木塔，Jackywolf2008，https://github.com/Jackywolf2008/yingxian-tower ，CC BY 4.0

- **不在上述授权范围内**：
  - 历史照片与测绘图（`ta-1933.jpg`、`liang-*.jpg`，它们在 `docs/` 里的副本，以及介绍视频里出现的这些画面）出自梁思成《中国建筑史》和《图像中国建筑史》（中国营造学社测绘），版权归原作者所有。
  - `docs/three.module.min.js` 是 [three.js](https://github.com/mrdoob/three.js)，MIT 许可，版权归 three.js 作者。
  - 页面和视频用到的马善政、思源宋体、思源黑体来自 Google Fonts，按 SIL Open Font License 1.1 授权；仓库里不含字体文件。
