import { useCurrentFrame, useVideoConfig } from 'remotion';
import { CODE_FONT } from '../lib/fonts';
import { scalePop } from '../lib/motion';
import { useTheme } from '../lib/theme';

/** Pops in at `delay` (frames, relative to the surrounding Sequence) with perceptual scale + opacity. */
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
  const { opacity, transform } = scalePop(frame, fps, {
    delay,
    from: 0.84,
    preset: 'emphasis',
  });

  if (!text) return null;

  const color = tone === 'good' ? theme.good : tone === 'bad' ? theme.bad : theme.ink;
  const bg = tone === 'good' ? theme.goodTint : tone === 'bad' ? theme.badTint : theme.tint;
  const border = tone === 'good' ? theme.goodBorder : tone === 'bad' ? theme.badBorder : theme.borderStrong;

  return (
    <div
      style={{
        opacity,
        transform,
        background: bg,
        color,
        border: `1px solid ${border}`,
        padding: '7px 18px',
        borderRadius: 999,
        fontFamily: CODE_FONT,
        fontWeight: 600,
        fontSize: 19,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      • {text}
    </div>
  );
};
