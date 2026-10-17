import { useMemo, type FC } from 'react';
import { AbsoluteFill, Html5Audio, Sequence, useVideoConfig } from 'remotion';
import { AuthoringHUD } from './components/AuthoringHUD';
import { Captions } from './components/Captions';
import { Character } from './components/Character';
import { SceneTransition } from './components/SceneTransition';
import { TRANSITION } from './config';
import { ThemeProvider, useTheme } from './lib/theme';
import { resolveTimeline } from './lib/timeline';
import { SCENE_REGISTRY } from './scenes';
import type { Episode, SceneConfig } from './types';

export type ReelProps = {
  episode: Episode;
  showDevHUD?: boolean;
  showSafeGuides?: boolean;
};

const ReelStage = ({
  episode,
  showDevHUD = false,
  showSafeGuides = false,
}: ReelProps) => {
  const theme = useTheme();
  const { fps, durationInFrames: compositionFrames } = useVideoConfig();
  const timeline = useMemo(() => resolveTimeline(episode, fps, compositionFrames), [episode, fps, compositionFrames]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        backgroundImage: theme.bgGlow,
      }}
    >
      {episode.voice && <Html5Audio src={episode.voice} />}

      {timeline.map((item, i) => {
        const { scene, from, durationInFrames, match } = item;
        // The registry is keyed by scene.kind, so the component always matches the scene it receives.
        const Scene = SCENE_REGISTRY[scene.kind] as FC<SceneConfig>;
        const isLast = i === timeline.length - 1;
        const total = durationInFrames + (isLast ? 0 : TRANSITION.overlapFrames);
        const sequenceName = `[${i + 1}] ${scene.id} (${scene.kind})${match ? ` · "${match.text}"` : ''}`;

        return (
          <Sequence key={scene.id} from={from} durationInFrames={total} name={sequenceName}>
            <SceneTransition durationInFrames={total} exits={!isLast}>
              <Scene {...scene} />
            </SceneTransition>
          </Sequence>
        );
      })}

      <Character />
      <Captions words={episode.words} />
      <AuthoringHUD
        episode={episode}
        timeline={timeline}
        showDevHUD={showDevHUD}
        showSafeGuides={showSafeGuides}
      />
    </AbsoluteFill>
  );
};

export const Reel = ({ episode, showDevHUD, showSafeGuides }: ReelProps) => (
  <ThemeProvider theme={episode.theme}>
    <ReelStage episode={episode} showDevHUD={showDevHUD} showSafeGuides={showSafeGuides} />
  </ThemeProvider>
);
