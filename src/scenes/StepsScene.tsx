import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const StepsScene = ({ label, title, steps }: SceneOf<'steps'>) => (
  <SceneFrame label={label} title={title}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, direction: 'rtl' }}>
      {steps.map((step, i) => (
        <Enter key={i} delay={i * MOTION.stagger}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 46 }}>
            <Box tone="ink" style={{ boxShadow: 'none', padding: 0, width: 72, height: 72, display: 'grid', placeItems: 'center', fontSize: 40, flexShrink: 0 }}>
              {i + 1}
            </Box>
            <BidiText as="span">{step}</BidiText>
          </Box>
        </Enter>
      ))}
    </div>
  </SceneFrame>
);
