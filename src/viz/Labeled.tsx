import type { ReactNode } from 'react';
import { THEME } from '../config';
import { CODE_FONT } from '../lib/fonts';

/** Small uppercase caption above a piece of a diagram. */
export const Labeled = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: CODE_FONT }}>
    <div style={{ fontSize: 22, letterSpacing: 5, color: THEME.muted }}>{label}</div>
    {children}
  </div>
);
