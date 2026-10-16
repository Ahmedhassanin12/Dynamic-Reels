import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const DiagramScene = ({ label, title, nodes, highlight }: SceneOf<'diagram'>) => {
  const theme = useTheme();
  return (
    <SceneFrame label={label} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, direction: 'rtl' }}>
        {nodes.map((node, i) => (
          <Enter key={i} delay={i * MOTION.stagger * 2} style={{ width: '100%', textAlign: 'center' }}>
            {i > 0 && <div style={{ fontSize: 34, lineHeight: 1, color: theme.ink, marginBottom: 10 }}>↓</div>}
            <Box tone={i === highlight ? 'ink' : 'paper'} style={{ fontSize: 34 }}>
              <BidiText>{node}</BidiText>
            </Box>
          </Enter>
        ))}
      </div>
    </SceneFrame>
  );
};

