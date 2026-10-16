import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION, SCAN } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const ArrayScene = ({ label, title, cells, target, mode }: SceneOf<'array'>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();

  const jumped = spring({ frame: frame - SCAN.jumpDelayFrames, fps, config: MOTION.spring }) > 0.01;
  const activeIndex = mode === 'scan' ? Math.min(target, Math.floor(frame / SCAN.framesPerCell)) : jumped ? target : -1;
  const checks = mode === 'scan' ? activeIndex + 1 : 1;

  return (
    <SceneFrame label={label} title={title}>
      <Enter>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 22, direction: 'ltr', fontFamily: CODE_FONT }}>
          <div style={{ display: 'flex', gap: 10 }}>
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
                    fontSize: 24,
                    fontWeight: 600,
                    border: `1px solid ${active ? theme.ink : visited ? theme.borderStrong : theme.border}`,
                    borderRadius: 10,
                    background: active ? theme.ink : visited ? theme.tint : theme.paperElevated,
                    color: active ? theme.onInk : theme.text,
                    transform: active ? 'scale(1.06)' : undefined,
                  }}
                >
                  {cell}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 22, letterSpacing: 3, color: theme.muted }}>
            CHECKS: <span style={{ color: theme.text, fontWeight: 700 }}>{checks}</span>
          </div>
        </Box>
      </Enter>
    </SceneFrame>
  );
};

