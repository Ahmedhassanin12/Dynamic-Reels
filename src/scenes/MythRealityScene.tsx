import { useCurrentFrame } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { CodeSnap } from '../components/CodeSnap';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { MythRealitySide, SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

const normalizeSide = (side: string | MythRealitySide, defaultTone: 'bad' | 'good'): MythRealitySide => {
  if (typeof side === 'string') {
    return { text: side, tone: defaultTone };
  }
  return { ...side, tone: side.tone ?? defaultTone };
};

export const MythRealityScene = ({
  label,
  title,
  pill,
  myth,
  reality,
  revealDelayFrames,
}: SceneOf<'mythReality'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  const mythSide = normalizeSide(myth, 'bad');
  const realitySide = normalizeSide(reality, 'good');

  const revealAt = revealDelayFrames ?? MOTION.stagger * 2;
  const isRevealed = frame >= revealAt;

  const resolvedPill = pill ?? 'MYTH VS REALITY';
  const hasCode = Boolean(mythSide.code || realitySide.code);

  return (
    <SceneFrame label={label} title={title} pill={resolvedPill} pillTone={isRevealed ? 'good' : 'neutral'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, direction: 'rtl' }}>
        {/* Top: The Myth Card */}
        <Enter delay={0}>
          <Box
            tone="bad"
            style={{
              padding: hasCode ? '20px 24px' : '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* Header bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${theme.badBorder}`,
                paddingBottom: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: theme.badTint,
                    border: `1px solid ${theme.badBorder}`,
                    color: theme.bad,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  ✗
                </span>
                <span style={{ fontSize: 20, fontWeight: 700, color: theme.bad }}>
                  {mythSide.label ?? 'الخرافة الشائعة'}
                </span>
              </div>
              <span
                style={{
                  fontFamily: CODE_FONT,
                  fontSize: 14,
                  fontWeight: 700,
                  color: theme.bad,
                  background: theme.badTint,
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: `1px solid ${theme.badBorder}`,
                  direction: 'ltr',
                }}
              >
                {mythSide.badge ?? '✗ MYTH'}
              </span>
            </div>

            {/* Main Text */}
            <div
              style={{
                fontSize: hasCode ? 28 : 32,
                lineHeight: 1.45,
                fontWeight: 600,
                color: theme.text,
              }}
            >
              <BidiText>{mythSide.text}</BidiText>
            </div>

            {/* Optional Code */}
            {mythSide.code && (
              <div style={{ marginTop: 2 }}>
                <CodeSnap
                  code={mythSide.code}
                  language={mythSide.language}
                  filename={mythSide.filename}
                  skipTyping
                />
              </div>
            )}

            {/* Optional Bullets */}
            {mythSide.bullets && mythSide.bullets.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {mythSide.bullets.map((b, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 22, color: theme.muted }}>
                    <span style={{ color: theme.bad, fontSize: 16 }}>✗</span>
                    <BidiText>{b}</BidiText>
                  </div>
                ))}
              </div>
            )}
          </Box>
        </Enter>

        {/* Bottom: The Reality Card */}
        {isRevealed ? (
          <Enter delay={revealDelayFrames !== undefined ? 0 : MOTION.stagger}>
            <Box
              tone="good"
              style={{
                padding: hasCode ? '20px 24px' : '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Header bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px solid ${theme.goodBorder}`,
                  paddingBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: theme.goodTint,
                      border: `1px solid ${theme.goodBorder}`,
                      color: theme.good,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: theme.good }}>
                    {realitySide.label ?? 'الحقيقة والمثبت'}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: CODE_FONT,
                    fontSize: 14,
                    fontWeight: 700,
                    color: theme.good,
                    background: theme.goodTint,
                    padding: '4px 10px',
                    borderRadius: 8,
                    border: `1px solid ${theme.goodBorder}`,
                    direction: 'ltr',
                  }}
                >
                  {realitySide.badge ?? '✓ REALITY'}
                </span>
              </div>

              {/* Main Text */}
              <div
                style={{
                  fontSize: hasCode ? 28 : 32,
                  lineHeight: 1.45,
                  fontWeight: 600,
                  color: theme.text,
                }}
              >
                <BidiText>{realitySide.text}</BidiText>
              </div>

              {/* Optional Code */}
              {realitySide.code && (
                <div style={{ marginTop: 2 }}>
                  <CodeSnap
                    code={realitySide.code}
                    language={realitySide.language}
                    filename={realitySide.filename}
                    skipTyping
                  />
                </div>
              )}

              {/* Optional Bullets */}
              {realitySide.bullets && realitySide.bullets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {realitySide.bullets.map((b, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 22, color: theme.muted }}>
                      <span style={{ color: theme.good, fontSize: 16 }}>✓</span>
                      <BidiText>{b}</BidiText>
                    </div>
                  ))}
                </div>
              )}
            </Box>
          </Enter>
        ) : (
          <Enter delay={MOTION.stagger}>
            <div
              style={{
                borderRadius: 16,
                border: `1px dashed ${theme.borderStrong}`,
                background: theme.paper,
                padding: '24px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: theme.muted,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22, color: theme.warn }}>?</span>
                <span style={{ fontSize: 24, fontWeight: 600, color: theme.muted }}>
                  إيه الحقيقة في رأيك؟
                </span>
              </div>
              <span
                style={{
                  fontFamily: CODE_FONT,
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.warn,
                  background: theme.warnTint,
                  padding: '4px 12px',
                  borderRadius: 999,
                  border: `1px solid ${theme.warnBorder}`,
                  direction: 'ltr',
                }}
              >
                THINK · REVEALING...
              </span>
            </div>
          </Enter>
        )}
      </div>
    </SceneFrame>
  );
};
