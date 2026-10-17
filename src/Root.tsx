import { Composition, Folder } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { SingleScenePreview } from './components/SingleScenePreview';
import { FPS, SIZE, TIMELINE } from './config';
import { EPISODES } from './episodes';
import { getDurationInFrames, getMinSceneFrames } from './lib/timeline';
import { Reel } from './Reel';

export const Root = () => (
  <>
    <Folder name="Episodes">
      {EPISODES.map((episode) => (
        <Composition
          key={episode.id}
          id={episode.id}
          component={Reel}
          defaultProps={{ episode, showDevHUD: false, showSafeGuides: false }}
          durationInFrames={getDurationInFrames(episode, FPS)}
          fps={FPS}
          {...SIZE}
          calculateMetadata={async () => {
            if (!episode.voice) {
              return { durationInFrames: getDurationInFrames(episode, FPS) };
            }
            try {
              const audioSeconds = await getAudioDurationInSeconds(episode.voice);
              return {
                durationInFrames: Math.max(
                  Math.ceil((audioSeconds + TIMELINE.tailSeconds) * FPS),
                  getDurationInFrames(episode, FPS),
                ),
              };
            } catch {
              return { durationInFrames: getDurationInFrames(episode, FPS) };
            }
          }}
        />
      ))}
    </Folder>

    <Folder name="Scene-Previews">
      {EPISODES.map((episode) => (
        <Folder key={`preview-${episode.id}`} name={episode.id}>
          {episode.scenes.map((scene, idx) => {
            const minFrames = getMinSceneFrames(scene);
            const previewDuration = Math.max(60, minFrames + 30);
            return (
              <Composition
                key={`${episode.id}-${scene.id}`}
                id={`${episode.id}--${scene.id}`}
                component={SingleScenePreview}
                defaultProps={{
                  episode,
                  sceneIndex: idx,
                  showDevHUD: true,
                  showSafeGuides: true,
                }}
                durationInFrames={previewDuration}
                fps={FPS}
                {...SIZE}
              />
            );
          })}
        </Folder>
      ))}
    </Folder>
  </>
);
