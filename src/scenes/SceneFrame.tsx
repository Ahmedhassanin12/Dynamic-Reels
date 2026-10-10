import type { ReactNode } from 'react';
import { STAGE, THEME } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';

type Props = { label?: string; title?: string; children: ReactNode };

export const SceneFrame = ({ label, title, children }: Props) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      padding: `${STAGE.top}px 60px ${STAGE.reservedBottom}px`,
      display: 'flex',
      flexDirection: 'column',
      color: THEME.text,
      fontFamily: ARABIC_FONT,
      fontWeight: 700,
    }}
  >
    {label && <div style={{ fontSize: 28, letterSpacing: 6, color: THEME.ink, fontFamily: CODE_FONT }}>{label}</div>}
    {title && <div style={{ fontSize: 84, marginTop: 10, textAlign: 'start', unicodeBidi: 'plaintext' }}>{title}</div>}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{children}</div>
  </div>
);
