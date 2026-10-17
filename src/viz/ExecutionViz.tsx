import { useCurrentFrame } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { EXECUTION } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { VizProps } from '../types';
import { Labeled } from './Labeled';
import { ResultBadge } from './ResultBadge';

/**
 * Panel 2 — Code Execution, Console Output & Variable State Visualizer.
 * Reveals console outputs and variable mutations step-by-step in exact execution order.
 */
export const ExecutionViz = ({ viz, result }: VizProps<'execution'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const framesPerStep = viz.framesPerStep ?? EXECUTION.framesPerStep;
  const stepIndex = Math.min(viz.steps.length - 1, Math.floor(frame / framesPerStep));
  const currentStep = viz.steps[stepIndex];

  const outputs = viz.steps
    .slice(0, stepIndex + 1)
    .map((s, idx) => (s.output !== undefined ? { text: s.output, step: idx, line: s.line } : null))
    .filter((item): item is { text: string; step: number; line: number } => item !== null);

  const hasVars = viz.steps.some((s) => s.vars && Object.keys(s.vars).length > 0);
  const currentVars = currentStep?.vars ?? {};
  const progressPct = Math.round(((stepIndex + 1) / viz.steps.length) * 100);

  return (
    <Box style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: CODE_FONT }}>
      {/* Header + active line indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            LINE {currentStep?.line ?? 1}
          </span>
          <span style={{ fontSize: 18, color: theme.muted }}>
            step {stepIndex + 1} of {viz.steps.length}
          </span>
        </div>
        {currentStep?.note && (
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
            <BidiText>{currentStep.note}</BidiText>
          </div>
        )}
      </div>

      {/* Execution progress bar */}
      <div style={{ height: 6, borderRadius: 999, background: theme.border, overflow: 'hidden' }}>
        <div
          style={{
            width: `${progressPct}%`,
            height: '100%',
            background: theme.ink,
            borderRadius: 999,
          }}
        />
      </div>

      {/* Main content: Console Output + Optional Variables */}
      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{ flex: 1.2 }}>
          <Labeled label="CONSOLE OUTPUT">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {outputs.map((out, idx) => {
                const isLatest = out.step === stepIndex;
                return (
                  <div
                    key={`${out.step}-${idx}`}
                    style={{
                      flex: 1,
                      minWidth: 110,
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: `1px solid ${isLatest ? theme.goodBorder : theme.borderStrong}`,
                      background: isLatest ? theme.goodTint : theme.paperElevated,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 15, color: theme.muted }}>#{idx + 1}</span>
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: isLatest ? theme.good : theme.text,
                      }}
                    >
                      {out.text}
                    </span>
                    <span style={{ fontSize: 14, color: theme.dim }}>L{out.line}</span>
                  </div>
                );
              })}
            </div>
          </Labeled>
        </div>

        {hasVars && (
          <div style={{ flex: 1 }}>
            <Labeled label="VARIABLES">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(currentVars).map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `1px solid ${theme.borderStrong}`,
                      background: theme.paperElevated,
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 20,
                    }}
                  >
                    <span style={{ color: theme.code.syntax.variable }}>{k}</span>
                    <span style={{ color: theme.ink, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </Labeled>
          </div>
        )}
      </div>

      {result && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <span style={{ fontSize: 18, color: theme.muted }}>EXECUTION ORDER</span>
          <ResultBadge text={result} delay={(viz.steps.length - 1) * framesPerStep} tone="good" />
        </div>
      )}
    </Box>
  );
};
