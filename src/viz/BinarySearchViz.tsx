import { useCurrentFrame } from 'remotion';
import { Box } from '../components/Box';
import { BINARY_SEARCH } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import { computeBinarySearchSteps } from '../lib/timeline';
import type { VizProps } from '../types';
import { ResultBadge } from './ResultBadge';

/**
 * Panel 7 — Binary Search Visualizer.
 * Shows step counter pills, L/M/R pointers, dimmed eliminated halves, and O(log n) callout.
 */
export const BinarySearchViz = ({ viz, result }: VizProps<'binarySearch'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const framesPerStep = viz.framesPerStep ?? BINARY_SEARCH.framesPerStep;
  const steps = computeBinarySearchSteps(viz.cells, viz.targetIndex);
  const stepIndex = Math.min(steps.length - 1, Math.floor(frame / framesPerStep));
  const current = steps[stepIndex];

  return (
    <Box
      tone={current.found ? 'good' : 'paper'}
      style={{
        direction: 'ltr',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        fontFamily: CODE_FONT,
      }}
    >
      {/* Top header + step number pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 18, color: current.found ? theme.good : theme.ink }}>
          binary search · target: {String(viz.cells[viz.targetIndex])}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {steps.map((_, idx) => {
            const active = idx === stepIndex;
            const done = idx < stepIndex;
            return (
              <span
                key={idx}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  border: `1px solid ${active ? theme.goodBorder : done ? theme.borderStrong : theme.border}`,
                  background: active ? theme.goodTint : done ? theme.tint : theme.paperElevated,
                  color: active ? theme.good : done ? theme.ink : theme.muted,
                }}
              >
                {idx + 1}
              </span>
            );
          })}
        </div>
      </div>

      {/* L / M / R Pointers + Cells + Index Row */}
      <div style={{ display: 'flex', gap: 8 }}>
        {viz.cells.map((cell, i) => {
          const inWindow = i >= current.low && i <= current.high;
          const isMid = i === current.mid;
          const isLow = i === current.low;
          const isHigh = i === current.high;
          const isHit = isMid && current.found;

          const pointerTags: string[] = [];
          if (isLow) pointerTags.push('L');
          if (isMid) pointerTags.push('M');
          if (isHigh) pointerTags.push('R');

          return (
            <div
              key={`${cell}-${i}`}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                opacity: inWindow ? 1 : 0.25,
              }}
            >
              {/* Pointer badge above cell */}
              <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pointerTags.length > 0 && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 700,
                      background: isHit ? theme.goodTint : isMid ? theme.tint : theme.paperElevated,
                      border: `1px solid ${isHit ? theme.goodBorder : isMid ? theme.ink : theme.borderStrong}`,
                      color: isHit ? theme.good : isMid ? theme.ink : theme.muted,
                    }}
                  >
                    {pointerTags.join('/')}↓
                  </span>
                )}
              </div>

              {/* Cell box */}
              <div
                style={{
                  width: '100%',
                  textAlign: 'center',
                  padding: '14px 0',
                  borderRadius: 10,
                  border: `1px solid ${
                    isHit
                      ? theme.goodBorder
                      : isMid
                        ? theme.ink
                        : inWindow
                          ? theme.borderStrong
                          : theme.border
                  }`,
                  background: isHit
                    ? theme.goodTint
                    : isMid
                      ? theme.tint
                      : theme.paperElevated,
                  color: isHit ? theme.good : isMid ? theme.ink : theme.text,
                  fontSize: 22,
                  fontWeight: isMid ? 700 : 500,
                }}
              >
                {String(cell)}
              </div>

              {/* 0-based index below cell */}
              <span style={{ fontSize: 14, color: theme.muted }}>{i}</span>
            </div>
          );
        })}
      </div>

      {/* Bottom complexity callout */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingTop: 12,
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: 48, fontWeight: 700, color: theme.good }}>{result ?? 'O(log n)'}</span>
          <span style={{ fontSize: 19, color: theme.muted }}>halves search space each step</span>
        </div>
        <ResultBadge text={`${stepIndex + 1} steps`} delay={0} tone="good" />
      </div>
    </Box>
  );
};
