import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const CompareScene = ({ label, title, pill = 'COMPARISON', sides }: SceneOf<'compare'>) => {
  const theme = useTheme();

  return (
    <SceneFrame label={label} title={title} pill={pill} pillTone="neutral">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, direction: 'rtl' }}>
        {sides.map((side, sideIndex) => {
          const inferredTone =
            side.tone ??
            (side.title.toLowerCase().includes('map')
              ? 'good'
              : side.title.toLowerCase().includes('array')
                ? 'bad'
                : sideIndex === 0
                  ? 'good'
                  : 'ink');

          const isGood = inferredTone === 'good';
          const isBad = inferredTone === 'bad';
          const accent = isGood ? theme.good : isBad ? theme.bad : theme.ink;
          const tint = isGood ? theme.goodTint : isBad ? theme.badTint : theme.tint;
          const border = isGood ? theme.goodBorder : isBad ? theme.badBorder : theme.borderStrong;

          const badgeText =
            side.badge ??
            (side.title.toLowerCase().includes('map')
              ? 'O(1) · instant lookup'
              : side.title.toLowerCase().includes('array')
                ? 'O(n) · full scan'
                : undefined);

          const progressWidth =
            side.progress !== undefined
              ? `${side.progress}%`
              : side.title.toLowerCase().includes('map')
                ? '16%'
                : side.title.toLowerCase().includes('array')
                  ? '92%'
                  : undefined;

          return (
            <Enter key={sideIndex} delay={sideIndex * MOTION.stagger}>
              <Box
                tone={isGood ? 'good' : isBad ? 'bad' : 'paper'}
                style={{
                  padding: '26px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: `1px solid ${theme.border}`,
                    paddingBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        background: tint,
                        border: `1px solid ${border}`,
                        color: accent,
                        display: 'grid',
                        placeItems: 'center',
                        fontFamily: CODE_FONT,
                        fontSize: 20,
                      }}
                    >
                      {isBad ? '✗' : isGood ? '✓' : String(sideIndex + 1)}
                    </span>
                    <span style={{ fontSize: 38, fontWeight: 700, color: theme.text }}>
                      <BidiText>{side.title}</BidiText>
                    </span>
                  </div>
                  {badgeText && (
                    <span
                      style={{
                        padding: '6px 16px',
                        borderRadius: 999,
                        background: tint,
                        border: `1px solid ${border}`,
                        color: accent,
                        fontFamily: CODE_FONT,
                        fontSize: 20,
                        fontWeight: 600,
                        direction: 'ltr',
                      }}
                    >
                      {badgeText}
                    </span>
                  )}
                </div>

                {progressWidth && (
                  <div style={{ height: 8, borderRadius: 999, background: theme.border, overflow: 'hidden', direction: 'ltr' }}>
                    <div
                      style={{
                        width: progressWidth,
                        height: '100%',
                        background: accent,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 32, lineHeight: 1.45, color: theme.text }}>
                  {side.items.map((item, i) => (
                    <Enter key={i} delay={(sideIndex + 1) * MOTION.stagger + (i + 1) * MOTION.stagger}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ color: accent, fontFamily: CODE_FONT, fontSize: 22 }}>•</span>
                        <BidiText>{item}</BidiText>
                      </div>
                    </Enter>
                  ))}
                </div>
              </Box>
            </Enter>
          );
        })}
      </div>
    </SceneFrame>
  );
};


