import type { CSSProperties, ReactNode } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { MOTION } from '../config';
import { fadeSlide, type SpringPreset } from '../lib/motion';

type Props = {
  delay?: number;
  distance?: number;
  axis?: 'x' | 'y';
  preset?: SpringPreset;
  children: ReactNode;
  style?: CSSProperties;
};

/** Slide + fade-in wrapper driven by standardized motion primitives. */
export const Enter = ({
  delay = 0,
  distance = MOTION.distance,
  axis = 'y',
  preset = 'enter',
  children,
  style,
}: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, transform } = fadeSlide(frame, fps, {
    delay,
    distance,
    axis,
    preset,
  });

  return <div style={{ opacity, transform, ...style }}>{children}</div>;
};
