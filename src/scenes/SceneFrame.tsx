import type { ReactNode } from 'react';
import { BidiText } from '../components/BidiText';
import { STAGE } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';

type Props = {
  label?: string;
  title?: string;
  pill?: string;
  pillTone?: 'good' | 'bad' | 'neutral';
  children: ReactNode;
};

export const SceneFrame = ({ label, title, pill, pillTone = 'neutral', children }: Props) => {
  const theme = useTheme();
  const pillColor = pillTone === 'good' ? theme.good : pillTone === 'bad' ? theme.bad : theme.ink;
  const pillBg = pillTone === 'good' ? theme.goodTint : pillTone === 'bad' ? theme.badTint : theme.tint;
  const pillBorder = pillTone === 'good' ? theme.goodBorder : pillTone === 'bad' ? theme.badBorder : theme.borderStrong;
  const hasHeader = Boolean(label || title || pill);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${STAGE.top}px ${STAGE.paddingX}px ${STAGE.reservedBottom}px`,
        display: 'flex',
        flexDirection: 'column',
        color: theme.text,
        fontFamily: ARABIC_FONT,
        fontWeight: 700,
      }}
    >
      {hasHeader && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, marginBottom: 32 }}>
        {label && (
          <div
            style={{
              fontSize: 18,
              letterSpacing: 6,
              color: theme.muted,
              fontFamily: CODE_FONT,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>
        )}
        {title && (
          <div
            dir="rtl"
            style={{
              fontSize: 58,
              lineHeight: 1.2,
              textAlign: 'center',
              direction: 'rtl',
              color: theme.text,
            }}
          >
            <BidiText>{title}</BidiText>
          </div>
        )}
        {pill && (
          <div
            style={{
              marginTop: 4,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 18px',
              borderRadius: 999,
              border: `1px solid ${pillBorder}`,
              background: pillBg,
              color: pillColor,
              fontFamily: CODE_FONT,
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 2,
            }}
          >
            <span style={{ fontSize: 14 }}>•</span>
            <span>{pill}</span>
          </div>
        )}
      </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{children}</div>
    </div>
  );
};

