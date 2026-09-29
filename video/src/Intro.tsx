import React from 'react';
import { AbsoluteFill, Html5Audio, interpolate, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { loadFonts } from './fonts';
import { Build, End, Hero, History, Section, Shot, Title, UIShowcase } from './scenes';
import timeline from './timeline.json';

loadFonts();

const T = timeline.transition;
// 相邻场景交叠 T 帧淡入淡出，总长要减去交叠部分
export const TOTAL_FRAMES = timeline.scenes.reduce((s, x) => s + x.frames, 0) - T * (timeline.scenes.length - 1);

function scene(id: string, frames: number) {
  switch (id) {
    case 'title': return <Title />;
    case 'hero': return <Hero frames={frames} />;
    case 'history': return <History />;
    case 'section': return <Section frames={frames} />;
    case 'build': return <Build frames={frames} />;
    case 'ui': return <UIShowcase frames={frames} />;
    case 'end': return <End />;
    default: return <Shot id={id} frames={frames} />;
  }
}

export const Intro: React.FC = () => (
  <AbsoluteFill style={{ background: '#eee8d9' }}>
    <TransitionSeries>
      {timeline.scenes.flatMap((s, i) => [
        ...(i ? [<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={linearTiming({ durationInFrames: T })} />] : []),
        <TransitionSeries.Sequence key={s.id} durationInFrames={s.frames}>{scene(s.id, s.frames)}</TransitionSeries.Sequence>,
      ])}
    </TransitionSeries>
    <Html5Audio src={staticFile('music.wav')} volume={f => interpolate(f, [0, 20, TOTAL_FRAMES - 75, TOTAL_FRAMES - 5], [0, 0.9, 0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
  </AbsoluteFill>
);
