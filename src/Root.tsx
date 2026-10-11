import { Composition } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { FPS, SIZE, TIMELINE } from './config';
import { EPISODES } from './episodes';
import { getDurationInFrames } from './lib/timeline';
import { Reel } from './Reel';

export const Root = () => (
  <>
    {EPISODES.map((episode) => (
      <Composition
        key={episode.id}
        id={episode.id}
        component={Reel}
        defaultProps={{ episode }}
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
              durationInFrames: Math.ceil((audioSeconds + TIMELINE.tailSeconds) * FPS),
            };
          } catch {
            return { durationInFrames: getDurationInFrames(episode, FPS) };
          }
        }}
      />
    ))}
  </>
);
