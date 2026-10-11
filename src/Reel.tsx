import { useMemo, type FC } from 'react';
import { AbsoluteFill, Html5Audio, Sequence, useVideoConfig } from 'remotion';
import { Captions } from './components/Captions';
import { Character } from './components/Character';
import { SceneTransition } from './components/SceneTransition';
import { THEME, TRANSITION } from './config';
import { resolveTimeline } from './lib/timeline';
import { SCENE_REGISTRY } from './scenes/registry';
import type { Episode, SceneConfig } from './types';

export const Reel = ({ episode }: { episode: Episode }) => {
  const { fps } = useVideoConfig();
  const timeline = useMemo(() => resolveTimeline(episode, fps), [episode, fps]);

  return (
    <AbsoluteFill
      style={{
        background: THEME.bg,
        backgroundImage: `linear-gradient(${THEME.grid} 1px, transparent 1px), linear-gradient(90deg, ${THEME.grid} 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    >
      {episode.voice && <Html5Audio src={episode.voice} />}

      {timeline.map(({ scene, from, durationInFrames }, i) => {
        // The registry is keyed by scene.kind, so the component always matches the scene it receives.
        const Scene = SCENE_REGISTRY[scene.kind] as FC<SceneConfig>;
        const isLast = i === timeline.length - 1;
        const total = durationInFrames + (isLast ? 0 : TRANSITION.overlapFrames);
        return (
          <Sequence key={scene.id} from={from} durationInFrames={total}>
            <SceneTransition durationInFrames={total} exits={!isLast}>
              <Scene {...scene} />
            </SceneTransition>
          </Sequence>
        );
      })}

      <Character />
      <Captions words={episode.words} />
    </AbsoluteFill>
  );
};
