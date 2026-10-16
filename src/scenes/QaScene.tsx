import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const QaScene = ({ label, title, question, answer }: SceneOf<'qa'>) => (
  <SceneFrame label={label} title={title}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, direction: 'rtl' }}>
      <Enter>
        <Box style={{ fontSize: 50, lineHeight: 1.4 }}>
          <BidiText>{question}</BidiText>
        </Box>
      </Enter>
      <Enter delay={MOTION.answerDelayFrames}>
        <Box tone="ink" style={{ fontSize: 50, lineHeight: 1.4 }}>
          <BidiText>{answer}</BidiText>
        </Box>
      </Enter>
    </div>
  </SceneFrame>
);
