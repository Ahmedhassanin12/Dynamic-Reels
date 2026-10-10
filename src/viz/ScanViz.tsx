import { useCurrentFrame } from 'remotion';
import { Box } from '../components/Box';
import { SCAN, THEME } from '../config';
import { CODE_FONT } from '../lib/fonts';
import type { VizProps } from '../types';
import { Labeled } from './Labeled';
import { ResultBadge } from './ResultBadge';

/** Array scan: every item is checked one by one (✗) until the match (✓). */
export const ScanViz = ({ viz, result }: VizProps<'scan'>) => {
  const frame = useCurrentFrame();
  const scanIndex = Math.min(viz.target, Math.floor(frame / SCAN.framesPerCell));
  const done = scanIndex === viz.target;

  return (
    <Box style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 30, fontFamily: CODE_FONT }}>
      <Labeled label="ARRAY: CHECK EACH ITEM">
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
                  padding: '14px 0',
                  borderRadius: 12,
                  border: `2px solid ${current || hit ? THEME.ink : THEME.border}`,
                  background: hit ? THEME.ink : visited ? THEME.tint : 'transparent',
                  color: hit ? THEME.onInk : THEME.text,
                }}
              >
                <div style={{ fontSize: 22, color: hit ? THEME.onInk : THEME.muted }}>{cell}</div>
                <div style={{ fontSize: 44, height: 56 }}>{hit ? '✓' : visited ? '✗' : current ? '?' : ''}</div>
              </div>
            );
          })}
        </div>
      </Labeled>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 44, letterSpacing: 3 }}>CHECKS: {scanIndex + 1}</div>
        <ResultBadge text={result} delay={viz.target * SCAN.framesPerCell} />
      </div>
    </Box>
  );
};
