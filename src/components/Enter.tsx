import type { CSSProperties, ReactNode } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MOTION } from '../config';

type Props = { delay?: number; children: ReactNode; style?: CSSProperties };

/** Slide-up + fade-in wrapper. `delay` is in frames (use index * MOTION.stagger for lists). */
export const Enter = ({ delay = 0, children, style }: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: MOTION.spring });

  return (
    <div style={{ opacity: Math.min(1, progress * 2), transform: `translateY(${(1 - progress) * MOTION.distance}px)`, unicodeBidi: 'plaintext', ...style }}>
      {children}
    </div>
  );
};
