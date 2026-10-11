import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION, THEME } from '../config';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const DiagramScene = ({ label, title, nodes, highlight }: SceneOf<'diagram'>) => (
  <SceneFrame label={label} title={title}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, direction: 'rtl' }}>
      {nodes.map((node, i) => (
        <Enter key={i} delay={i * MOTION.stagger * 2} style={{ width: '100%', textAlign: 'center' }}>
          {i > 0 && <div style={{ fontSize: 56, lineHeight: 1, color: THEME.ink, marginBottom: 8 }}>↓</div>}
          <Box tone={i === highlight ? 'ink' : 'paper'} style={{ fontSize: 46 }}>
            {node}
          </Box>
        </Enter>
      ))}
    </div>
  </SceneFrame>
);
