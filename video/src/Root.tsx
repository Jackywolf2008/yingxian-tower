import React from 'react';
import { Composition, Still } from 'remotion';
import { Cover } from './Cover';
import { Intro, TOTAL_FRAMES } from './Intro';
import timeline from './timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Intro" component={Intro} durationInFrames={TOTAL_FRAMES} fps={timeline.fps} width={1920} height={1080} />
    {/* 项目封面：按 1920×1080 排版，渲染时 --scale=2 输出 3840×2160 */}
    <Still id="Cover" component={Cover} width={1920} height={1080} />
  </>
);
