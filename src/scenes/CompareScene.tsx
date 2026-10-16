import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const CompareScene = ({ label, title, sides }: SceneOf<'compare'>) => {
  const theme = useTheme();

  return (
    <SceneFrame label={label} title={title} pill="PERFORMANCE BENCHMARK" pillTone="neutral">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, direction: 'rtl' }}>
        {sides.map((side, sideIndex) => {
          const isWinner = sideIndex === 1;
          const accent = isWinner ? theme.good : theme.bad;
          const tint = isWinner ? theme.goodTint : theme.badTint;
          const border = isWinner ? theme.goodBorder : theme.badBorder;

          return (
            <Enter key={sideIndex} delay={sideIndex * MOTION.stagger}>
              <Box
                tone={isWinner ? 'good' : 'bad'}
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
                      {isWinner ? '✓' : '✗'}
                    </span>
                    <span style={{ fontSize: 38, fontWeight: 700, color: theme.text }}>
                      <BidiText>{side.title}</BidiText>
                    </span>
                  </div>
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
                    {isWinner ? 'O(1) · instant lookup' : 'O(n) · full scan'}
                  </span>
                </div>

                {/* Speed bar comparison */}
                <div style={{ height: 8, borderRadius: 999, background: theme.border, overflow: 'hidden', direction: 'ltr' }}>
                  <div
                    style={{
                      width: isWinner ? '16%' : '92%',
                      height: '100%',
                      background: accent,
                      borderRadius: 999,
                    }}
                  />
                </div>

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

