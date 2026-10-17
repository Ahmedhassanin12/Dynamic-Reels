import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION, SCAN } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';
import { ResultBadge } from '../viz/ResultBadge';
import { SceneFrame } from './SceneFrame';

/**
 * Panel 6 — Array Traversal & Direct Index Scene.
 * Displays a floating Arabic pointer above the active cell and explicit 0..n-1 indices below.
 */
export const ArrayScene = ({ label, title, cells, target, mode, pointerLabel, result }: SceneOf<'array'>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();

  const jumped = spring({ frame: frame - SCAN.jumpDelayFrames, fps, config: MOTION.spring }) > 0.01;
  const activeIndex =
    mode === 'scan' ? Math.min(target, Math.floor(frame / SCAN.framesPerCell)) : jumped ? target : -1;
  const checks = mode === 'scan' ? Math.max(1, activeIndex + 1) : 1;
  const resolvedPointer = pointerLabel ?? (mode === 'scan' ? 'جاري البحث...' : 'وصول مباشر');

  return (
    <SceneFrame
      label={label}
      title={title}
      pill={mode === 'scan' ? 'ARRAY TRAVERSAL · SCAN' : 'ARRAY INDEX · JUMP'}
      pillTone={mode === 'scan' ? 'neutral' : 'good'}
    >
      <Enter>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 24, direction: 'ltr', fontFamily: CODE_FONT }}>
          {/* Floating pointer + Array cells + Index row */}
          <div style={{ display: 'flex', gap: 10 }}>
            {cells.map((cell, i) => {
              const active = i === activeIndex;
              const isTargetHit = active && i === target;
              const visited = mode === 'scan' && i < activeIndex;
              return (
                <div
                  key={`${cell}-${i}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  {/* Floating pointer above active cell */}
                  <div
                    style={{
                      height: 54,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    {active && (
                      <>
                        <div
                          dir="rtl"
                          style={{
                            fontFamily: ARABIC_FONT,
                            fontSize: 20,
                            fontWeight: 700,
                            color: isTargetHit ? theme.good : theme.ink,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <BidiText>{resolvedPointer}</BidiText>
                        </div>
                        <span style={{ fontSize: 22, lineHeight: 1, color: isTargetHit ? theme.good : theme.ink }}>
                          ↓
                        </span>
                      </>
                    )}
                  </div>

                  {/* Array Cell */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 26,
                      fontWeight: 700,
                      border: `1px solid ${
                        isTargetHit
                          ? theme.goodBorder
                          : active
                            ? theme.ink
                            : visited
                              ? theme.borderStrong
                              : theme.border
                      }`,
                      borderRadius: 12,
                      background: isTargetHit
                        ? theme.goodTint
                        : active
                          ? theme.tint
                          : visited
                            ? theme.paper
                            : theme.paperElevated,
                      color: isTargetHit ? theme.good : active ? theme.ink : visited ? theme.muted : theme.text,
                      transform: active ? 'scale(1.06)' : undefined,
                      boxShadow: active ? theme.shadowSm : undefined,
                    }}
                  >
                    {cell}
                  </div>

                  {/* 0-based index row */}
                  <span style={{ fontSize: 16, color: active ? theme.text : theme.muted, fontWeight: active ? 700 : 400 }}>
                    {i}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 14,
              borderTop: `1px solid ${theme.border}`,
            }}
          >
            <div style={{ fontSize: 22, letterSpacing: 2, color: theme.muted }}>
              CHECKS: <span style={{ color: theme.text, fontWeight: 700 }}>{checks}</span>
            </div>
            <ResultBadge
              text={result ?? (mode === 'scan' ? `${checks} checks` : 'O(1) jump')}
              delay={0}
              tone={mode === 'scan' ? 'ink' : 'good'}
            />
          </div>
        </Box>
      </Enter>
    </SceneFrame>
  );
};


