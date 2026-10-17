import { useCurrentFrame } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MEMORY } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { VizProps } from '../types';
import { ResultBadge } from './ResultBadge';

/**
 * Panel 13 — Memory & Reference Visualizer (Stack Primitives vs Heap Objects).
 * Shows why primitive assignment copies by value while object assignment copies a Heap reference.
 */
export const MemoryViz = ({ viz, result }: VizProps<'memory'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const stagger = MEMORY.stepStaggerFrames;

  return (
    <Box
      style={{
        direction: 'ltr',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        fontFamily: CODE_FONT,
      }}
    >
      {/* Top header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: theme.tint,
              border: `1px solid ${theme.borderStrong}`,
              color: theme.ink,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            JS MEMORY MODEL
          </span>
          <span style={{ fontSize: 17, color: theme.muted }}>Stack (Value/Ref) → Heap (Objects)</span>
        </div>
        <span style={{ fontSize: 16, color: theme.warn }}>shared ref = shared mutation</span>
      </div>

      {/* Two-Column Memory Grid: Stack (Left) + Heap (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 16 }}>
        {/* Left: STACK */}
        <div
          style={{
            borderRadius: 14,
            border: `1px solid ${theme.borderStrong}`,
            background: theme.paperElevated,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, color: theme.ink, fontWeight: 700, letterSpacing: '0.08em' }}>
              STACK
            </span>
            <span style={{ fontSize: 14, color: theme.muted }}>primitives & refs</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {viz.stack.map((slot, i) => {
              const isRef = Boolean(slot.ref);
              const isChanged = Boolean(slot.changed);
              const border = isChanged
                ? theme.warnBorder
                : isRef
                  ? theme.goodBorder
                  : theme.border;
              const bg = isChanged
                ? theme.warnTint
                : isRef
                  ? theme.goodTint
                  : theme.paper;

              return (
                <Enter key={slot.name} delay={i * stagger}>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: bg,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>{slot.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: 6,
                          background: theme.paper,
                          border: `1px solid ${border}`,
                          color: isChanged ? theme.warn : isRef ? theme.good : theme.ink,
                          fontSize: 18,
                          fontWeight: 600,
                        }}
                      >
                        {slot.ref ? `→ ${slot.ref}` : slot.value}
                      </span>
                    </div>
                  </div>
                </Enter>
              );
            })}
          </div>
        </div>

        {/* Right: HEAP */}
        <div
          style={{
            borderRadius: 14,
            border: `1px solid ${theme.goodBorder}`,
            background: theme.paperElevated,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, color: theme.good, fontWeight: 700, letterSpacing: '0.08em' }}>
              HEAP
            </span>
            <span style={{ fontSize: 14, color: theme.muted }}>allocated objects</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {viz.heap.map((obj, idx) => (
              <Enter key={obj.id} delay={(idx + 1) * stagger}>
                <div
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${obj.mutatedKey ? theme.warnBorder : theme.goodBorder}`,
                    background: theme.paper,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: `1px solid ${theme.border}`,
                      paddingBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700, color: theme.good }}>@{obj.id}</span>
                    <span style={{ fontSize: 15, color: theme.muted }}>{obj.label}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(obj.entries).map(([k, v]) => {
                      const isMutated = obj.mutatedKey === k;
                      return (
                        <div
                          key={k}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            background: isMutated ? theme.warnTint : 'transparent',
                            border: `1px solid ${isMutated ? theme.warnBorder : 'transparent'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: 18, color: theme.muted }}>{k}:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                fontSize: 19,
                                fontWeight: 700,
                                color: isMutated ? theme.warn : theme.text,
                              }}
                            >
                              {v}
                            </span>
                            {isMutated && (
                              <span
                                style={{
                                  fontSize: 13,
                                  padding: '1px 7px',
                                  borderRadius: 999,
                                  background: theme.paper,
                                  border: `1px solid ${theme.warnBorder}`,
                                  color: theme.warn,
                                  fontWeight: 700,
                                }}
                              >
                                mutated!
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Enter>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Note or Result */}
      {(viz.note || result) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            paddingTop: 10,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          {viz.note ? (
            <div
              style={{
                direction: 'rtl',
                fontFamily: ARABIC_FONT,
                fontSize: 22,
                fontWeight: 600,
                color: theme.text,
              }}
            >
              <BidiText>{viz.note}</BidiText>
            </div>
          ) : (
            <span style={{ fontSize: 17, color: theme.muted }}>MEMORY REFERENCE</span>
          )}
          {result && <ResultBadge text={result} delay={Math.min(frame, stagger * 2)} tone="good" />}
        </div>
      )}
    </Box>
  );
};
