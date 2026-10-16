import { useMemo, type FC } from 'react';
import { AbsoluteFill, Html5Audio, Sequence, useVideoConfig } from 'remotion';
import { Captions } from './components/Captions';
import { Character } from './components/Character';
import { SceneTransition } from './components/SceneTransition';
import { TRANSITION } from './config';
import { ThemeProvider, useTheme } from './lib/theme';
import { resolveTimeline } from './lib/timeline';
import { SCENE_REGISTRY } from './scenes/registry';
import type { Episode, SceneConfig } from './types';

const ReelStage = ({ episode }: { episode: Episode }) => {
  const theme = useTheme();
  const { fps } = useVideoConfig();
  const timeline = useMemo(() => resolveTimeline(episode, fps), [episode, fps]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        backgroundImage: theme.bgGlow,
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

export const Reel = ({ episode }: { episode: Episode }) => (
  <ThemeProvider theme={episode.theme}>
    <ReelStage episode={episode} />
  </ThemeProvider>
);
