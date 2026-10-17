import { useCurrentFrame } from 'remotion';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { LOOKUP } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { VizProps } from '../types';
import { Labeled } from './Labeled';
import { ResultBadge } from './ResultBadge';

const COLUMNS = 6;

const Arrow = ({ color }: { color: string }) => <div style={{ fontSize: 32, color, lineHeight: 1 }}>→</div>;

/**
 * Panel 5 — Hash Map Lookup Visualizer.
 * Key -> Hash Function -> Bucket index -> Zoomed key/value bucket entry.
 */
export const LookupViz = ({ viz, result }: VizProps<'lookup'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const hitOn = frame >= LOOKUP.hitDelayFrames;
  const payloadText = viz.valuePreview ?? `{ key: "${viz.key}", value: user }`;
  const subtitle = viz.subtitle ?? 'avg O(1) · direct bucket access';

  return (
    <Box tone="good" style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 18, fontFamily: CODE_FONT }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 18, color: theme.good, letterSpacing: 1 }}>
          direct hash lookup · get(&quot;{viz.key}&quot;)
        </span>
        <span style={{ fontSize: 18, color: theme.muted }}>1 of {viz.buckets} buckets touched</span>
      </div>

      {/* Instant 1-step green progress bar */}
      <div style={{ height: 8, borderRadius: 999, background: theme.border, overflow: 'hidden' }}>
        <div style={{ width: '18%', height: '100%', background: theme.good, borderRadius: 999 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Enter style={{ flex: 0.9 }}>
          <Labeled label="KEY">
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                border: `1px solid ${theme.borderStrong}`,
                background: theme.paperElevated,
                fontSize: 22,
                color: theme.code.syntax.string,
              }}
            >
              &quot;{viz.key}&quot;
            </div>
          </Labeled>
        </Enter>
        <Enter delay={8}>
          <Arrow color={theme.good} />
        </Enter>
        <Enter delay={14} style={{ flex: 1.1 }}>
          <Labeled label="HASH FUNCTION">
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                border: `1px solid ${theme.goodBorder}`,
                background: theme.goodTint,
                fontSize: 21,
                color: theme.good,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>⚙ hash(&quot;{viz.key}&quot;)</span>
              <span style={{ fontWeight: 700 }}>→ #{viz.hit}</span>
            </div>
          </Labeled>
        </Enter>
      </div>

      <Enter delay={22}>
        <Labeled label="HASH BUCKETS">
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`, gap: 8 }}>
            {Array.from({ length: viz.buckets }, (_, i) => {
              const hit = hitOn && i === viz.hit;
              return (
                <div
                  key={i}
                  style={{
                    textAlign: 'center',
                    padding: '8px 0',
                    fontSize: 18,
                    borderRadius: 8,
                    border: `1px solid ${hit ? theme.goodBorder : theme.border}`,
                    background: hit ? theme.goodTint : theme.paperElevated,
                    color: hit ? theme.good : theme.muted,
                    fontWeight: hit ? 700 : 400,
                  }}
                >
                  #{i} {hit ? '✓' : ''}
                </div>
              );
            })}
          </div>
        </Labeled>
      </Enter>

      {/* Zoomed Bucket Payload Callout (Panel 5) */}
      {hitOn && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderRadius: 10,
            border: `1px solid ${theme.goodBorder}`,
            background: theme.paperElevated,
            fontSize: 19,
          }}
        >
          <span style={{ color: theme.good, fontWeight: 600 }}>↓ bucket[{viz.hit}]</span>
          <span style={{ color: theme.text }}>{payloadText}</span>
        </div>
      )}

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
          {result && <span style={{ fontSize: 52, fontWeight: 700, color: theme.good }}>{result}</span>}
          <span style={{ fontSize: 20, color: theme.muted }}>{subtitle}</span>
        </div>
        <ResultBadge text="1 lookup · direct" delay={LOOKUP.resultDelayFrames} tone="good" />
      </div>
    </Box>
  );
};


