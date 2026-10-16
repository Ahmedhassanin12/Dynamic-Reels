import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const StepsScene = ({ label, title, steps }: SceneOf<'steps'>) => {
  const theme = useTheme();
  return (
    <SceneFrame label={label} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, direction: 'rtl' }}>
        {steps.map((step, i) => (
          <Enter key={i} delay={i * MOTION.stagger}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 34, lineHeight: 1.4 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  border: `1px solid ${theme.borderStrong}`,
                  background: theme.tint,
                  color: theme.ink,
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: CODE_FONT,
                  fontSize: 22,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <BidiText as="span">{step}</BidiText>
            </Box>
          </Enter>
        ))}
      </div>
    </SceneFrame>
  );
};

