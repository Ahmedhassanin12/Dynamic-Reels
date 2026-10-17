import { useCurrentFrame } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { AsyncLane, AsyncState, AsyncStep, VizProps } from '../types';
import { ResultBadge } from './ResultBadge';

export const AsyncFlowViz = ({ viz, result }: VizProps<'asyncFlow'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  const fpsStep = viz.framesPerStep ?? 25;
  const hasSteps = Boolean(viz.steps && viz.steps.length > 0);
  const stepIndex = hasSteps ? Math.min(viz.steps!.length - 1, Math.floor(frame / fpsStep)) : 0;
  const currentStep: AsyncStep | undefined = hasSteps ? viz.steps![stepIndex] : undefined;

  const mode = viz.mode ?? (viz.lanes && viz.lanes.length > 0 ? 'waterfall' : 'promise');

  // Promise state resolution
  const promiseState: AsyncState = currentStep ? currentStep.status : (viz.promise?.state ?? 'fulfilled');
  const promiseName = viz.promise?.name ?? 'asyncOperation()';
  const settledValue = currentStep?.value ?? viz.promise?.settledValue ?? '{ data: 200 OK }';
  const durationMs = viz.promise?.durationMs;

  return (
    <Box
      tone="paper"
      style={{
        direction: 'ltr',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        fontFamily: CODE_FONT,
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, color: theme.ink, fontWeight: 700 }}>
            {mode === 'waterfall' ? 'async waterfall · concurrency lanes' : 'promise lifecycle · state machine'}
          </span>
          <span
            style={{
              fontSize: 13,
              color: theme.muted,
              background: theme.paperElevated,
              padding: '2px 8px',
              borderRadius: 6,
              border: `1px solid ${theme.border}`,
            }}
          >
            {mode === 'waterfall' ? `${viz.lanes?.length ?? 3} lanes` : promiseName}
          </span>
        </div>

        {hasSteps && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {viz.steps!.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  background: idx === stepIndex ? theme.goodTint : theme.paperElevated,
                  border: `1px solid ${idx === stepIndex ? theme.goodBorder : theme.border}`,
                  color: idx === stepIndex ? theme.good : theme.muted,
                }}
              >
                {idx + 1}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* MODE 1: Promise Lifecycle State Machine */}
      {mode === 'promise' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* 3 Lifecycle States (Pending -> Fulfilled / Rejected) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr auto 1.5fr',
              alignItems: 'center',
              gap: 14,
              padding: '16px 20px',
              borderRadius: 14,
              background: theme.paperElevated,
              border: `1px solid ${theme.border}`,
            }}
          >
            {/* PENDING State */}
            <div
              style={{
                borderRadius: 12,
                padding: '14px 18px',
                border: `1.5px solid ${promiseState === 'pending' || promiseState === 'running' ? theme.warnBorder : theme.border}`,
                background: promiseState === 'pending' || promiseState === 'running' ? theme.warnTint : 'rgba(255,255,255,0.02)',
                boxShadow: promiseState === 'pending' || promiseState === 'running' ? theme.warnShadow : undefined,
                opacity: promiseState === 'pending' || promiseState === 'running' ? 1 : 0.45,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: theme.warn, fontWeight: 700 }}>INITIAL STATE</span>
                <span style={{ fontSize: 11, color: theme.muted }}>in flight</span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>
                ⏳ PENDING
              </span>
            </div>

            {/* Transition Fork Arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: theme.muted, gap: 4 }}>
              <svg width="42" height="52" viewBox="0 0 42 52" fill="none">
                <path
                  d="M2 26 H 18 V 12 H 34"
                  stroke={promiseState === 'fulfilled' ? theme.good : theme.borderStrong}
                  strokeWidth="2"
                  fill="none"
                />
                <polygon
                  points="34,8 42,12 34,16"
                  fill={promiseState === 'fulfilled' ? theme.good : theme.borderStrong}
                />
                <path
                  d="M18 26 V 40 H 34"
                  stroke={promiseState === 'rejected' ? theme.bad : theme.borderStrong}
                  strokeWidth="2"
                  fill="none"
                />
                <polygon
                  points="34,36 42,40 34,44"
                  fill={promiseState === 'rejected' ? theme.bad : theme.borderStrong}
                />
              </svg>
            </div>

            {/* Resolved Destination States (Fulfilled vs Rejected) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* FULFILLED State */}
              <div
                style={{
                  borderRadius: 10,
                  padding: '10px 14px',
                  border: `1.5px solid ${promiseState === 'fulfilled' ? theme.goodBorder : theme.border}`,
                  background: promiseState === 'fulfilled' ? theme.goodTint : 'rgba(255,255,255,0.02)',
                  boxShadow: promiseState === 'fulfilled' ? theme.goodShadow : undefined,
                  opacity: promiseState === 'fulfilled' ? 1 : 0.4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: theme.good }}>
                  ✓ FULFILLED
                </span>
                <span style={{ fontSize: 12, color: theme.muted, fontFamily: CODE_FONT }}>
                  .then(res =&gt;)
                </span>
              </div>

              {/* REJECTED State */}
              <div
                style={{
                  borderRadius: 10,
                  padding: '10px 14px',
                  border: `1.5px solid ${promiseState === 'rejected' ? theme.badBorder : theme.border}`,
                  background: promiseState === 'rejected' ? theme.badTint : 'rgba(255,255,255,0.02)',
                  boxShadow: promiseState === 'rejected' ? theme.badShadow : undefined,
                  opacity: promiseState === 'rejected' ? 1 : 0.4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: theme.bad }}>
                  ✗ REJECTED
                </span>
                <span style={{ fontSize: 12, color: theme.muted, fontFamily: CODE_FONT }}>
                  .catch(err =&gt;)
                </span>
              </div>
            </div>
          </div>

          {/* Settled Payload Box */}
          <div
            style={{
              borderRadius: 12,
              padding: '12px 18px',
              background: theme.paper,
              border: `1px solid ${theme.borderStrong}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: theme.muted }}>payload:</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: promiseState === 'rejected' ? theme.bad : theme.good }}>
                {settledValue}
              </span>
            </div>
            {durationMs !== undefined && (
              <span
                style={{
                  fontSize: 12,
                  color: theme.ink,
                  background: theme.tint,
                  border: `1px solid ${theme.borderStrong}`,
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                ⏱ {durationMs}ms
              </span>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: Concurrency Waterfall Lanes */}
      {mode === 'waterfall' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(viz.lanes ?? [
            { name: 'Main Thread', operation: 'Executing sync code', status: 'running', progress: 100 },
            { name: 'Background I/O', operation: 'fetch("/api/users")', status: 'running', progress: 65 },
            { name: 'Microtask Queue', operation: 'await callback queued', status: 'idle' },
          ]).map((lane: AsyncLane, idx: number) => {
            const isRunning = lane.status === 'running';
            const isDone = lane.status === 'done';
            const isError = lane.status === 'error';

            const statusColor = isDone ? theme.good : isRunning ? theme.ink : isError ? theme.bad : theme.muted;
            const statusTint = isDone ? theme.goodTint : isRunning ? theme.tint : isError ? theme.badTint : theme.paperElevated;
            const statusBorder = isDone ? theme.goodBorder : isRunning ? theme.borderStrong : isError ? theme.badBorder : theme.border;

            return (
              <div
                key={idx}
                style={{
                  borderRadius: 12,
                  padding: '12px 16px',
                  background: theme.paperElevated,
                  border: `1px solid ${statusBorder}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: statusColor,
                        boxShadow: isRunning ? `0 0 8px ${statusColor}` : undefined,
                      }}
                    />
                    <span style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>
                      {lane.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: statusColor,
                      background: statusTint,
                      border: `1px solid ${statusBorder}`,
                      padding: '2px 8px',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                    }}
                  >
                    {lane.status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: theme.muted }}>
                    {lane.operation}
                  </span>
                  {lane.progress !== undefined && (
                    <span style={{ fontSize: 12, color: theme.muted }}>
                      {lane.progress}%
                    </span>
                  )}
                </div>

                {lane.progress !== undefined && (
                  <div style={{ height: 4, borderRadius: 999, background: theme.border, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${lane.progress}%`,
                        height: '100%',
                        background: statusColor,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Step note or educational takeaway */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <div style={{ direction: 'rtl', fontSize: 16, color: theme.muted }}>
          <BidiText>
            {currentStep?.note ?? viz.note ?? 'Non-blocking I/O · Main thread continues while async tasks resolve'}
          </BidiText>
        </div>
        {result && <ResultBadge text={result} delay={0} tone="good" />}
      </div>
    </Box>
  );
};
