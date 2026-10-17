import { useCurrentFrame } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { EVENT_LOOP } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { VizProps } from '../types';
import { ResultBadge } from './ResultBadge';

/**
 * Panel 3 — Event Loop Runtime Visualizer.
 * Accurately visualizes the Call Stack, Microtask Queue, Task Queue, Event Loop tick, and Output.
 */
export const EventLoopViz = ({ viz, result }: VizProps<'eventLoop'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const framesPerStep = viz.framesPerStep ?? EVENT_LOOP.framesPerStep;
  const stepIndex = Math.min(viz.steps.length - 1, Math.floor(frame / framesPerStep));
  const step = viz.steps[stepIndex];
  const active = step?.activeZone ?? 'stack';

  return (
    <Box style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 18, fontFamily: CODE_FONT, padding: '22px 24px' }}>
      {/* Top status bar: step counter + educational note */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              background: theme.tint,
              border: `1px solid ${theme.borderStrong}`,
              color: theme.ink,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            TICK {stepIndex + 1}/{viz.steps.length}
          </span>
          {step?.line && <span style={{ fontSize: 16, color: theme.muted }}>Line {step.line}</span>}
        </div>
        {step?.note && (
          <div
            dir="rtl"
            style={{
              fontFamily: ARABIC_FONT,
              fontSize: 22,
              fontWeight: 700,
              color: theme.text,
              direction: 'rtl',
            }}
          >
            <BidiText>{step.note}</BidiText>
          </div>
        )}
      </div>

      {/* 3-Zone Runtime Diagram: Call Stack | Queues | Event Loop Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.35fr 0.75fr', gap: 14, alignItems: 'stretch' }}>
        {/* 1. CALL STACK */}
        <div
          style={{
            borderRadius: 14,
            border: `1px solid ${active === 'stack' ? theme.ink : theme.borderStrong}`,
            background: active === 'stack' ? theme.tint : theme.paperElevated,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: active === 'stack' ? theme.ink : theme.text }}>
              Call Stack
            </span>
            <span style={{ fontSize: 13, color: theme.muted }}>LIFO</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
            {step.stack.length === 0 ? (
              <div
                style={{
                  padding: '14px 8px',
                  borderRadius: 8,
                  border: `1px dashed ${theme.border}`,
                  textAlign: 'center',
                  fontSize: 15,
                  color: theme.dim,
                }}
              >
                empty (idle)
              </div>
            ) : (
              step.stack.map((item, i) => (
                <div
                  key={`${item}-${i}`}
                  style={{
                    padding: '9px 10px',
                    borderRadius: 8,
                    border: `1px solid ${theme.ink}`,
                    background: theme.paper,
                    color: theme.ink,
                    fontSize: 16,
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  {item}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. MICROTASK QUEUE & TASK QUEUE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Microtask Queue */}
          <div
            style={{
              flex: 1,
              borderRadius: 14,
              border: `1px solid ${active === 'microtask' ? theme.goodBorder : theme.borderStrong}`,
              background: active === 'microtask' ? theme.goodTint : theme.paperElevated,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: theme.good }}>⚡ Microtask Queue</span>
              <span style={{ fontSize: 12, color: theme.muted }}>HIGH PRIORITY</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {step.microtasks.length === 0 ? (
                <span style={{ fontSize: 14, color: theme.dim }}>empty</span>
              ) : (
                step.microtasks.map((m, i) => (
                  <span
                    key={`${m}-${i}`}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: `1px solid ${theme.goodBorder}`,
                      background: theme.paper,
                      color: theme.good,
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    {m}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Task Queue (Macrotask) */}
          <div
            style={{
              flex: 1,
              borderRadius: 14,
              border: `1px solid ${active === 'task' ? theme.warnBorder : theme.borderStrong}`,
              background: active === 'task' ? theme.warnTint : theme.paperElevated,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: theme.warn }}>⏱ Task Queue</span>
              <span style={{ fontSize: 12, color: theme.muted }}>TIMERS / IO</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {step.tasks.length === 0 ? (
                <span style={{ fontSize: 14, color: theme.dim }}>empty</span>
              ) : (
                step.tasks.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: `1px solid ${theme.warnBorder}`,
                      background: theme.paper,
                      color: theme.warn,
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 3. EVENT LOOP HUB */}
        <div
          style={{
            borderRadius: 14,
            border: `1px solid ${active === 'loop' ? theme.goodBorder : theme.borderStrong}`,
            background: active === 'loop' ? theme.goodTint : theme.paperElevated,
            padding: '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: active === 'loop' ? theme.good : theme.text }}>
            Event Loop
          </span>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              border: `2px solid ${active === 'loop' ? theme.good : theme.ink}`,
              display: 'grid',
              placeItems: 'center',
              fontSize: 30,
              color: active === 'loop' ? theme.good : theme.ink,
              transform: `rotate(${stepIndex * 60}deg)`,
            }}
          >
            ↻
          </div>
          <span style={{ fontSize: 13, color: theme.muted }}>
            {active === 'loop' ? 'pushing to stack' : 'watching stack'}
          </span>
        </div>
      </div>

      {/* Bottom Output Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 12,
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, color: theme.muted }}>OUTPUT:</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {(step.output ?? []).map((out, i) => (
              <span
                key={i}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  background: theme.goodTint,
                  border: `1px solid ${theme.goodBorder}`,
                  color: theme.good,
                  fontSize: 19,
                  fontWeight: 700,
                }}
              >
                {out}
              </span>
            ))}
          </div>
        </div>
        <ResultBadge text={result} delay={(viz.steps.length - 1) * framesPerStep} tone="good" />
      </div>
    </Box>
  );
};
