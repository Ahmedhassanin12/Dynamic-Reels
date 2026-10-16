import type { ReactNode } from 'react';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';

/** Small uppercase caption above a piece of a diagram. */
export const Labeled = ({ label, children }: { label: string; children: ReactNode }) => {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: CODE_FONT }}>
      <div style={{ fontSize: 16, letterSpacing: 3, color: theme.muted, fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  );
};

