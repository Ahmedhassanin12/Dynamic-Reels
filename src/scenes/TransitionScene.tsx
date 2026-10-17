import { useCurrentFrame } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

/**
 * Panel 16 — Concept-to-Concept Transition Bridge Scene.
 * Visually connects a completed concept (top card) to the next concept (bottom card) via an animated bridge pill.
 */
export const TransitionScene = ({
  label,
  title,
  pill = 'CONCEPT BRIDGE',
  fromTitle,
  fromBadge,
  fromSub,
  toTitle,
  toBadge,
  toSub,
  bridgeText = 'الخطوة الجاية ↓',
}: SceneOf<'transition'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const step2Active = frame >= MOTION.stagger * 2;

  return (
    <SceneFrame label={label} title={title} pill={pill} pillTone="neutral">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, direction: 'rtl' }}>
        {/* Top Card: Previous / Completed Concept */}
        <Enter style={{ width: '100%' }}>
          <Box
            tone="paper"
            style={{
              padding: '26px 32px',
              opacity: step2Active ? 0.68 : 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: theme.tint,
                    border: `1px solid ${theme.borderStrong}`,
                    color: theme.muted,
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: CODE_FONT,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  1
                </span>
                <span style={{ fontSize: 34, fontWeight: 700, color: theme.text }}>
                  <BidiText>{fromTitle}</BidiText>
                </span>
              </div>

              {fromBadge && (
                <span
                  style={{
                    direction: 'ltr',
                    padding: '6px 16px',
                    borderRadius: 999,
                    background: theme.paperElevated,
                    border: `1px solid ${theme.borderStrong}`,
                    color: theme.muted,
                    fontFamily: CODE_FONT,
                    fontSize: 19,
                    fontWeight: 600,
                  }}
                >
                  {fromBadge}
                </span>
              )}
            </div>

            {fromSub && (
              <div style={{ fontSize: 25, color: theme.muted, paddingRight: 50 }}>
                <BidiText>{fromSub}</BidiText>
              </div>
            )}
          </Box>
        </Enter>

        {/* Center Bridge Connector */}
        <Enter delay={MOTION.stagger}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 2, height: 18, background: theme.borderStrong }} />
            <div
              style={{
                padding: '8px 22px',
                borderRadius: 999,
                background: theme.tint,
                border: `1px solid ${theme.borderStrong}`,
                color: theme.ink,
                fontSize: 24,
                fontWeight: 700,
                boxShadow: theme.shadowSm,
              }}
            >
              <BidiText>{bridgeText}</BidiText>
            </div>
            <div style={{ fontSize: 28, lineHeight: 1, color: theme.ink }}>↓</div>
          </div>
        </Enter>

        {/* Bottom Card: Next / Upgraded Concept */}
        <Enter delay={MOTION.stagger * 2} style={{ width: '100%' }}>
          <Box
            tone="good"
            style={{
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: theme.goodTint,
                    border: `1px solid ${theme.goodBorder}`,
                    color: theme.good,
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: CODE_FONT,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  2
                </span>
                <span style={{ fontSize: 36, fontWeight: 700, color: theme.text }}>
                  <BidiText>{toTitle}</BidiText>
                </span>
              </div>

              {toBadge && (
                <span
                  style={{
                    direction: 'ltr',
                    padding: '6px 16px',
                    borderRadius: 999,
                    background: theme.goodTint,
                    border: `1px solid ${theme.goodBorder}`,
                    color: theme.good,
                    fontFamily: CODE_FONT,
                    fontSize: 19,
                    fontWeight: 700,
                  }}
                >
                  {toBadge}
                </span>
              )}
            </div>

            {toSub && (
              <div style={{ fontSize: 26, color: theme.text, paddingRight: 50 }}>
                <BidiText>{toSub}</BidiText>
              </div>
            )}
          </Box>
        </Enter>
      </div>
    </SceneFrame>
  );
};
