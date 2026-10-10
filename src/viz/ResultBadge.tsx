import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MOTION, THEME } from '../config';
import { CODE_FONT } from '../lib/fonts';

/** Pops in at `delay` (frames, relative to the surrounding Sequence). */
export const ResultBadge = ({ text, delay }: { text?: string; delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = Math.max(0, spring({ frame: frame - delay, fps, config: MOTION.spring }));

  if (!text) return null;

  return (
    <div
      style={{
        transform: `scale(${pop})`,
        background: THEME.ink,
        color: THEME.onInk,
        padding: '8px 30px',
        borderRadius: 14,
        fontFamily: CODE_FONT,
        fontWeight: 500,
        fontSize: 54,
      }}
    >
      {text}
    </div>
  );
};
