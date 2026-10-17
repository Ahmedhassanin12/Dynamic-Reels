import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThemeProvider, useTheme } from '../lib/theme';
import { SCENE_REGISTRY } from '../scenes';
import type { Episode, SceneConfig } from '../types';
import { AuthoringHUD } from './AuthoringHUD';
import { Captions } from './Captions';
import { Character } from './Character';

type Props = {
  episode: Episode;
  sceneIndex: number;
  showDevHUD?: boolean;
  showSafeGuides?: boolean;
};

const SingleSceneStage = ({
  episode,
  sceneIndex,
  showDevHUD = false,
  showSafeGuides = false,
}: Props) => {
  const theme = useTheme();
  const scene = episode.scenes[sceneIndex];

  if (!scene) {
    return (
      <AbsoluteFill style={{ background: '#0a0a0c', color: '#ef4444', display: 'grid', placeItems: 'center', fontSize: 32 }}>
        Scene index {sceneIndex} not found in episode "{episode.id}".
      </AbsoluteFill>
    );
  }

  const SceneComponent = SCENE_REGISTRY[scene.kind] as FC<SceneConfig>;

  // Filter words that belong to this scene if timestamps exist
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        backgroundImage: theme.bgGlow,
      }}
    >
      <SceneComponent {...scene} />
      <Character />
      <Captions words={episode.words} />
      <AuthoringHUD
        episode={episode}
        timeline={[
          {
            scene,
            from: 0,
            durationInFrames: 300,
            match: {
              rawIndex: 0,
              rawEndIndex: 0,
              wordIndex: 0,
              text: typeof scene.at === 'object' ? scene.at.text : String(scene.at),
              rawText: typeof scene.at === 'object' ? scene.at.text : String(scene.at),
              startSeconds: 0,
            },
          },
        ]}
        showDevHUD={showDevHUD}
        showSafeGuides={showSafeGuides}
      />
    </AbsoluteFill>
  );
};

export const SingleScenePreview = (props: Props) => (
  <ThemeProvider theme={props.episode.theme}>
    <SingleSceneStage {...props} />
  </ThemeProvider>
);
