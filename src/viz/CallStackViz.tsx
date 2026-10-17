import { useCurrentFrame } from 'remotion';
import { Box } from '../components/Box';
import { CALL_STACK } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { VizProps } from '../types';
import { ResultBadge } from './ResultBadge';

/**
 * Panel 4 — Recursion Call Stack & Stack/Queue Visualizer.
 * Pushes frames step-by-step and optionally unwinds with return values.
 */
export const CallStackViz = ({ viz, result }: VizProps<'callStack'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const isQueue = viz.mode === 'queue';
  const framesPerStep = viz.framesPerStep ?? CALL_STACK.framesPerStep;
  const pushSteps = viz.frames.length;
  const unwindSteps = viz.returns?.length ?? 0;
  const totalSteps = Math.max(1, pushSteps + unwindSteps);

  const stepIndex = Math.min(totalSteps - 1, Math.floor(frame / framesPerStep));
  const isUnwinding = stepIndex >= pushSteps;
  const visibleCount = isUnwinding ? pushSteps : stepIndex + 1;
  const unwindCount = isUnwinding ? stepIndex - pushSteps + 1 : 0;
  const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100);

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
      {/* Top status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: isUnwinding ? theme.goodTint : theme.tint,
              border: `1px solid ${isUnwinding ? theme.goodBorder : theme.borderStrong}`,
              color: isUnwinding ? theme.good : theme.ink,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {isQueue ? 'QUEUE · FIFO' : 'CALL STACK · LIFO'}
          </span>
          <span style={{ fontSize: 17, color: theme.muted }}>
            {isUnwinding ? `unwinding (${unwindCount}/${unwindSteps})` : `pushing (${visibleCount}/${pushSteps})`}
          </span>
        </div>
        <span style={{ fontSize: 17, color: theme.muted }}>depth: {visibleCount}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 999, background: theme.border, overflow: 'hidden' }}>
        <div
          style={{
            width: `${progressPct}%`,
            height: '100%',
            background: isUnwinding ? theme.good : theme.ink,
            borderRadius: 999,
          }}
        />
      </div>

      {/* Stack / Queue Frames Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: isQueue ? 'row' : 'column-reverse',
          gap: 10,
          padding: '14px 16px',
          borderRadius: 14,
          border: `1px solid ${theme.borderStrong}`,
          background: theme.paperElevated,
        }}
      >
        {viz.frames.slice(0, visibleCount).map((frameLabel, i) => {
          // Unwind happens from top of stack (pushSteps - 1) down to 0
          const unwindOrder = pushSteps - 1 - i;
          const hasReturned = isUnwinding && unwindOrder < unwindCount;
          const isCurrentTop = !isUnwinding && i === visibleCount - 1;
          const isCurrentUnwind = isUnwinding && unwindOrder === unwindCount - 1;
          const returnVal = viz.returns?.[unwindOrder];

          const borderColor =
            hasReturned || isCurrentUnwind
              ? theme.goodBorder
              : isCurrentTop
                ? theme.ink
                : theme.border;
          const bgColor =
            hasReturned || isCurrentUnwind
              ? theme.goodTint
              : isCurrentTop
                ? theme.tint
                : theme.paper;
          const textColor =
            hasReturned || isCurrentUnwind ? theme.good : isCurrentTop ? theme.ink : theme.text;

          return (
            <div
              key={`${frameLabel}-${i}`}
              style={{
                flex: isQueue ? 1 : undefined,
                padding: '12px 18px',
                borderRadius: 10,
                border: `1px solid ${borderColor}`,
                background: bgColor,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 15, color: theme.muted }}>#{i + 1}</span>
                <span style={{ fontSize: 22, fontWeight: 600, color: textColor }}>{frameLabel}</span>
              </div>
              {hasReturned && returnVal !== undefined ? (
                <span
                  style={{
                    padding: '3px 12px',
                    borderRadius: 999,
                    background: theme.paper,
                    border: `1px solid ${theme.goodBorder}`,
                    color: theme.good,
                    fontSize: 17,
                    fontWeight: 700,
                  }}
                >
                  return {returnVal}
                </span>
              ) : isCurrentTop ? (
                <span style={{ fontSize: 15, color: theme.ink }}>active frame</span>
              ) : null}
            </div>
          );
        })}
      </div>

      {result && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 10,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <span style={{ fontSize: 18, color: theme.muted }}>
            {isQueue ? 'FIFO ORDER' : 'FINAL RETURN'}
          </span>
          <ResultBadge text={result} delay={(totalSteps - 1) * framesPerStep} tone="good" />
        </div>
      )}
    </Box>
  );
};
