import type { CSSProperties, ReactNode } from 'react';
import { THEME } from '../config';

const TONES = {
  paper: { background: THEME.paper, color: THEME.text },
  ink: { background: THEME.ink, color: THEME.onInk },
} as const satisfies Record<string, CSSProperties>;

type Props = { tone?: keyof typeof TONES; children: ReactNode; style?: CSSProperties };

export const Box = ({ tone = 'paper', children, style }: Props) => (
  <div
    style={{
      ...TONES[tone],
      border: `2px solid ${THEME.border}`,
      borderRadius: 22,
      boxShadow: THEME.shadowSm,
      padding: '22px 28px',
      overflow: 'hidden',
      unicodeBidi: 'plaintext',
      ...style,
    }}
  >
    {children}
  </div>
);
