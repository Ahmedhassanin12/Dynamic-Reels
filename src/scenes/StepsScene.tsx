import { useCurrentFrame } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf, StepItem } from '../types';
import { SceneFrame } from './SceneFrame';

export const StepsScene = ({ label, title, pill = 'STEP BY STEP', steps, showStack }: SceneOf<'steps'>) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const normalizedSteps: StepItem[] = steps.map((s) => (typeof s === 'string' ? { text: s } : s));
  const visibleCount = Math.min(normalizedSteps.length, Math.floor(frame / MOTION.stagger) + 1);
  const activeBadges = normalizedSteps
    .slice(0, visibleCount)
    .map((s) => s.badge ?? s.code)
    .filter((b): b is string => Boolean(b));

  return (
    <SceneFrame label={label} title={title} pill={pill} pillTone="neutral">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, direction: 'rtl', position: 'relative' }}>
        {normalizedSteps.map((step, i) => {
          const isGood = step.tone === 'good';
          const isBad = step.tone === 'bad';
          const isWarn = step.tone === 'warn';
          const accent = isGood ? theme.good : isBad ? theme.bad : isWarn ? theme.warn : theme.ink;
          const tint = isGood ? theme.goodTint : isBad ? theme.badTint : isWarn ? theme.warnTint : theme.tint;
          const border = isGood
            ? theme.goodBorder
            : isBad
              ? theme.badBorder
              : isWarn
                ? theme.warnBorder
                : theme.borderStrong;
          const isLast = i === normalizedSteps.length - 1;

          return (
            <Enter key={i} delay={i * MOTION.stagger}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch', gap: 18 }}>
                {/* Numbered Node + Vertical Connector */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                    paddingTop: 14,
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      border: `1px solid ${border}`,
                      background: tint,
                      color: accent,
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: CODE_FONT,
                      fontSize: 22,
                      fontWeight: 700,
                      boxShadow: theme.shadowSm,
                      zIndex: 2,
                    }}
                  >
                    {i + 1}
                  </div>
                  {!isLast && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 22,
                        marginTop: 6,
                        marginBottom: -20,
                        background: `linear-gradient(180deg, ${border}, ${theme.border})`,
                      }}
                    />
                  )}
                </div>

                {/* Step Card */}
                <Box
                  style={{
                    flex: 1,
                    padding: '22px 26px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 20,
                    borderColor: step.tone ? border : undefined,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div style={{ fontSize: 33, lineHeight: 1.4, color: theme.text, fontWeight: 600 }}>
                      <BidiText>{step.text}</BidiText>
                    </div>
                    {step.code && (
                      <div
                        style={{
                          direction: 'ltr',
                          textAlign: 'left',
                          alignSelf: 'flex-start',
                          fontFamily: CODE_FONT,
                          fontSize: 20,
                          color: theme.ink,
                          background: theme.code.chrome.editor,
                          border: `1px solid ${theme.border}`,
                          borderRadius: 8,
                          padding: '4px 12px',
                        }}
                      >
                        {step.code}
                      </div>
                    )}
                  </div>

                  {step.badge && (
                    <span
                      style={{
                        direction: 'ltr',
                        padding: '6px 16px',
                        borderRadius: 999,
                        background: tint,
                        border: `1px solid ${border}`,
                        color: accent,
                        fontFamily: CODE_FONT,
                        fontSize: 20,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {step.badge}
                    </span>
                  )}
                </Box>
              </div>
            </Enter>
          );
        })}

        {showStack && activeBadges.length > 0 && (
          <Enter delay={normalizedSteps.length * MOTION.stagger}>
            <Box
              style={{
                direction: 'ltr',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 14,
                fontFamily: CODE_FONT,
                background: theme.paperElevated,
              }}
            >
              <span style={{ fontSize: 16, color: theme.muted, letterSpacing: '0.08em' }}>STATE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {activeBadges.map((b, idx) => (
                  <div key={`${b}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {idx > 0 && <span style={{ color: theme.muted, fontSize: 18 }}>→</span>}
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 8,
                        background: idx === activeBadges.length - 1 ? theme.tint : theme.paper,
                        border: `1px solid ${idx === activeBadges.length - 1 ? theme.borderStrong : theme.border}`,
                        color: idx === activeBadges.length - 1 ? theme.ink : theme.text,
                        fontSize: 18,
                        fontWeight: 600,
                      }}
                    >
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </Box>
          </Enter>
        )}
      </div>
    </SceneFrame>
  );
};


