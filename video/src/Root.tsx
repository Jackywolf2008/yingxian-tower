import React from 'react';
import { Composition } from 'remotion';
import { Intro, TOTAL_FRAMES } from './Intro';
import timeline from './timeline.json';

export const RemotionRoot: React.FC = () => (
  <Composition id="Intro" component={Intro} durationInFrames={TOTAL_FRAMES} fps={timeline.fps} width={1920} height={1080} />
);
