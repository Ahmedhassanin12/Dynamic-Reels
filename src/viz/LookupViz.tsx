import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { LOOKUP, THEME } from '../config';
import { CODE_FONT } from '../lib/fonts';
import type { VizProps } from '../types';
import { Labeled } from './Labeled';
import { ResultBadge } from './ResultBadge';
import { useCurrentFrame } from 'remotion';

const COLUMNS = 4;

const Arrow = () => <div style={{ fontSize: 52, color: THEME.ink, lineHeight: 1 }}>→</div>;

/** Hash map: key -> hash() -> the one bucket, no scanning. */
export const LookupViz = ({ viz, result }: VizProps<'lookup'>) => {
  const frame = useCurrentFrame();
  const hitOn = frame >= LOOKUP.hitDelayFrames;

  return (
    <Box style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 30, fontFamily: CODE_FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Enter style={{ flex: 1.3 }}>
          <Labeled label="KEY">
            <div style={{ border: `2px solid ${THEME.ink}`, borderRadius: 12, padding: '16px 12px', fontSize: 28, textAlign: 'center', color: '#ce9178' }}>
              &quot;{viz.key}&quot;
            </div>
          </Labeled>
        </Enter>
        <Enter delay={8}><Arrow /></Enter>
        <Enter delay={14} style={{ flex: 0.9 }}>
          <Labeled label="HASH">
            <div style={{ background: THEME.tint, borderRadius: 12, padding: '16px 12px', fontSize: 30, textAlign: 'center', color: '#dcdcaa' }}>hash()</div>
          </Labeled>
        </Enter>
        <Enter delay={22}><Arrow /></Enter>
        <Enter delay={28} style={{ flex: 1.4 }}>
          <Labeled label="BUCKETS">
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`, gap: 6 }}>
              {Array.from({ length: viz.buckets }, (_, i) => {
                const hit = hitOn && i === viz.hit;
                return (
                  <div
                    key={i}
                    style={{
                      textAlign: 'center',
                      padding: '8px 0',
                      fontSize: 22,
                      borderRadius: 8,
                      border: `2px solid ${hit ? THEME.ink : THEME.border}`,
                      background: hit ? THEME.ink : 'transparent',
                      color: hit ? THEME.onInk : THEME.muted,
                    }}
                  >
                    {i}
                  </div>
                );
              })}
            </div>
          </Labeled>
        </Enter>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 44, letterSpacing: 3 }}>LOOKUPS: 1</div>
        <ResultBadge text={result} delay={LOOKUP.resultDelayFrames} />
      </div>
    </Box>
  );
};
