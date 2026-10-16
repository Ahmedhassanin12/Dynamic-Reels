import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MOTION } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';

/** Pops in at `delay` (frames, relative to the surrounding Sequence). */
export const ResultBadge = ({
  text,
  delay,
  tone = 'ink',
}: {
  text?: string;
  delay: number;
  tone?: 'good' | 'bad' | 'ink';
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const pop = Math.max(0, spring({ frame: frame - delay, fps, config: MOTION.spring }));

  if (!text) return null;

  const color = tone === 'good' ? theme.good : tone === 'bad' ? theme.bad : theme.ink;
  const bg = tone === 'good' ? theme.goodTint : tone === 'bad' ? theme.badTint : theme.tint;
  const border = tone === 'good' ? theme.goodBorder : tone === 'bad' ? theme.badBorder : theme.borderStrong;

  return (
    <div
      style={{
        transform: `scale(${pop})`,
        background: bg,
        color,
        border: `1px solid ${border}`,
        padding: '8px 20px',
        borderRadius: 999,
        fontFamily: CODE_FONT,
        fontWeight: 600,
        fontSize: 20,
      }}
    >
      • {text}
    </div>
  );
};

