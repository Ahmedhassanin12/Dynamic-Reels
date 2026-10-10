import { Composition } from 'remotion';
import { FPS, SIZE } from './config';
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
      />
    ))}
  </>
);
