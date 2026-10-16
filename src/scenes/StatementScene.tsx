import { AbsoluteFill } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Enter } from '../components/Enter';
import { STAGE, THEME } from '../config';
import { ARABIC_FONT } from '../lib/fonts';
import type { SceneOf } from '../types';

export const StatementScene = ({ text }: SceneOf<'statement'>) => {
  const fontSize = text.length > 70 ? 64 : text.length > 45 ? 80 : 104;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: `${STAGE.top}px 60px ${STAGE.reservedBottom}px` }}>
      <Enter>
        <div dir="rtl" style={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize, lineHeight: 1.35, direction: 'rtl', textAlign: 'center', color: THEME.text }}>
          <BidiText>{text}</BidiText>
        </div>
      </Enter>
    </AbsoluteFill>
  );
};
