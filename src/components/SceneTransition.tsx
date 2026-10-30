import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TRANSITION } from '../config';
import { CLAMP, EASINGS } from '../lib/motion';

type Props = { durationInFrames: number; exits: boolean; children: ReactNode };

/** Slide-up + perceptual scale + clean cross-fade between consecutive scenes without mid-overlap ghosting. */
export const SceneTransition = ({ durationInFrames, exits, children }: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: TRANSITION.enterSpring });
  const enterOpacity = interpolate(frame, [0, TRANSITION.overlapFrames], [0, 1], {
    ...CLAMP,
    easing: EASINGS.inOutCubic,
  });
  const exit = exits
    ? interpolate(frame, [durationInFrames - TRANSITION.overlapFrames, durationInFrames - 1], [0, 1], {
        ...CLAMP,
        easing: EASINGS.outCubic,
      })
    : 0;
  const y = (1 - enter) * TRANSITION.distance - exit * TRANSITION.distance * 0.35;
  const scale = interpolate(enter, [0, 1], [0.985, 1]) - exit * 0.01;

  return (
    <AbsoluteFill
      style={{
        transform: `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(4)})`,
        opacity: Math.min(enterOpacity, 1 - exit),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
