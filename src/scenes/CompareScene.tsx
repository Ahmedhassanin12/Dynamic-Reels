import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const CompareScene = ({ label, title, sides }: SceneOf<'compare'>) => (
  <SceneFrame label={label} title={title}>
    <div style={{ display: 'flex', gap: 28, direction: 'rtl' }}>
      {sides.map((side, sideIndex) => (
        <Enter key={side.title} delay={sideIndex * MOTION.stagger} style={{ flex: 1 }}>
          <Box style={{ padding: 0, height: '100%' }}>
            <Box tone="ink" style={{ boxShadow: 'none', border: 'none', borderRadius: 0, textAlign: 'center', fontSize: 50 }}>
              {side.title}
            </Box>
            <div style={{ padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: 22, fontSize: 40, lineHeight: 1.4 }}>
              {side.items.map((item, i) => (
                <Enter key={item} delay={(sideIndex + 1) * MOTION.stagger + (i + 1) * MOTION.stagger}>
                  {item}
                </Enter>
              ))}
            </div>
          </Box>
        </Enter>
      ))}
    </div>
  </SceneFrame>
);
