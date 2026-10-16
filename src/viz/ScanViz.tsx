import { useCurrentFrame } from 'remotion';
import { Box } from '../components/Box';
import { SCAN } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { VizProps } from '../types';
import { ResultBadge } from './ResultBadge';

/** Array scan: every item is checked one by one (✗) until the match (✓). */
export const ScanViz = ({ viz, result }: VizProps<'scan'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const scanIndex = Math.min(viz.target, Math.floor(frame / SCAN.framesPerCell));
  const done = scanIndex === viz.target;
  const progressPct = Math.round(((scanIndex + 1) / viz.cells.length) * 100);

  return (
    <Box tone="bad" style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 22, fontFamily: CODE_FONT }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 18, color: theme.bad, letterSpacing: 1 }}>linear scan · array.find()</span>
        <span style={{ fontSize: 18, color: theme.muted }}>
          {scanIndex + 1} of {viz.cells.length} items checked
        </span>
      </div>

      {/* Thin progress bar */}
      <div style={{ height: 8, borderRadius: 999, background: theme.border, overflow: 'hidden' }}>
        <div
          style={{
            width: `${progressPct}%`,
            height: '100%',
            background: theme.bad,
            borderRadius: 999,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {viz.cells.map((cell, i) => {
          const hit = done && i === viz.target;
          const visited = i < scanIndex;
          const current = i === scanIndex;
          return (
            <div
              key={`${cell}-${i}`}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px 0',
                borderRadius: 10,
                border: `1px solid ${hit ? theme.goodBorder : visited || current ? theme.badBorder : theme.border}`,
                background: hit ? theme.goodTint : visited ? theme.badTint : theme.paperElevated,
                color: hit ? theme.good : visited ? theme.bad : theme.text,
              }}
            >
              <div style={{ fontSize: 14, color: theme.muted }}>[{i}]</div>
              <div style={{ fontSize: 19, fontWeight: 600, marginTop: 4 }}>{cell}</div>
              <div style={{ fontSize: 22, height: 28, marginTop: 4 }}>
                {hit ? '✓' : visited ? '✗' : current ? '?' : '·'}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingTop: 14,
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          {result && <span style={{ fontSize: 52, fontWeight: 700, color: theme.bad }}>{result}</span>}
          <span style={{ fontSize: 20, color: theme.muted }}>slow · scans every element</span>
        </div>
        <ResultBadge text={`${scanIndex + 1} checks`} delay={0} tone="bad" />
      </div>
    </Box>
  );
};

