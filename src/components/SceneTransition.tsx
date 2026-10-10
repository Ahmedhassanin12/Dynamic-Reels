import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TRANSITION } from '../config';

type Props = { durationInFrames: number; exits: boolean; children: ReactNode };

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Slide-up + fade in; if another scene follows, fade out over the overlap so the two cross-fade. */
export const SceneTransition = ({ durationInFrames, exits, children }: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: TRANSITION.enterSpring });
  const exit = exits ? interpolate(frame, [durationInFrames - TRANSITION.overlapFrames, durationInFrames], [0, 1], clamp) : 0;
  const y = (1 - enter) * TRANSITION.distance - exit * TRANSITION.distance * 0.5;

  return (
    <AbsoluteFill style={{ transform: `translateY(${y}px)`, opacity: Math.min(enter, 1 - exit) }}>{children}</AbsoluteFill>
  );
};
