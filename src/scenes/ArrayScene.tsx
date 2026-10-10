import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Enter } from '../components/Enter';
import { MOTION, SCAN, THEME } from '../config';
import { CODE_FONT } from '../lib/fonts';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const ArrayScene = ({ label, title, cells, target, mode }: SceneOf<'array'>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const jumped = spring({ frame: frame - SCAN.jumpDelayFrames, fps, config: MOTION.spring }) > 0.01;
  const activeIndex = mode === 'scan' ? Math.min(target, Math.floor(frame / SCAN.framesPerCell)) : jumped ? target : -1;
  const checks = mode === 'scan' ? activeIndex + 1 : 1;

  return (
    <SceneFrame label={label} title={title}>
      <Enter>
        <div style={{ display: 'flex', gap: 10, direction: 'ltr' }}>
          {cells.map((cell, i) => {
            const active = i === activeIndex;
            const visited = mode === 'scan' && i < activeIndex;
            return (
              <div
                key={`${cell}-${i}`}
                style={{
                  flex: 1,
                  aspectRatio: '1',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 34,
                  border: `2px solid ${active ? THEME.ink : THEME.border}`,
                  borderRadius: 12,
                  background: active ? THEME.ink : visited ? THEME.tint : THEME.paper,
                  color: active ? THEME.onInk : THEME.text,
                  transform: active ? 'scale(1.12)' : undefined,
                }}
              >
                {cell}
              </div>
            );
          })}
        </div>
      </Enter>
      <div style={{ marginTop: 40, direction: 'ltr', fontSize: 40, letterSpacing: 4, fontFamily: CODE_FONT }}>
        CHECKS: {checks}
      </div>
    </SceneFrame>
  );
};
