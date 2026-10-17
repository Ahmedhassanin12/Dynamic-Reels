import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../lib/theme';

export type BoxTone = 'paper' | 'ink' | 'good' | 'bad' | 'warn';

type Props = { tone?: BoxTone; children: ReactNode; style?: CSSProperties };

export const Box = ({ tone = 'paper', children, style }: Props) => {
  const theme = useTheme();
  const tones: Record<BoxTone, CSSProperties> = {
    paper: {
      background: theme.paper,
      color: theme.text,
      border: `1px solid ${theme.border}`,
      boxShadow: theme.shadowSm,
    },
    ink: {
      background: theme.paperElevated,
      color: theme.text,
      border: `1px solid ${theme.borderStrong}`,
      boxShadow: theme.shadowSm,
    },
    good: {
      background: theme.paper,
      color: theme.text,
      border: `1px solid ${theme.goodBorder}`,
      boxShadow: `${theme.goodShadow}, ${theme.shadowSm}`,
    },
    bad: {
      background: theme.paper,
      color: theme.text,
      border: `1px solid ${theme.badBorder}`,
      boxShadow: `${theme.badShadow}, ${theme.shadowSm}`,
    },
    warn: {
      background: theme.paper,
      color: theme.text,
      border: `1px solid ${theme.warnBorder}`,
      boxShadow: `${theme.warnShadow}, ${theme.shadowSm}`,
    },
  };

  return (
    <div
      dir="rtl"
      style={{
        ...tones[tone],
        borderRadius: 16,
        padding: '24px 28px',
        overflow: 'hidden',
        direction: 'rtl',
        unicodeBidi: 'isolate',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
