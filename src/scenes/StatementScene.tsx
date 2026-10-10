import { AbsoluteFill } from 'remotion';
import { Enter } from '../components/Enter';
import { STAGE, THEME } from '../config';
import { ARABIC_FONT } from '../lib/fonts';
import type { SceneOf } from '../types';

export const StatementScene = ({ text }: SceneOf<'statement'>) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: `${STAGE.top}px 60px ${STAGE.reservedBottom}px` }}>
    <Enter>
      <div style={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: 104, lineHeight: 1.35, direction: 'rtl', textAlign: 'center', color: THEME.text, unicodeBidi: 'plaintext' }}>
        {text}
      </div>
    </Enter>
  </AbsoluteFill>
);
