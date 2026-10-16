import { AbsoluteFill } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Enter } from '../components/Enter';
import { STAGE } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';

export const StatementScene = ({ label, text }: SceneOf<'statement'>) => {
  const theme = useTheme();
  const fontSize = text.length > 70 ? 52 : text.length > 45 ? 60 : 70;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${STAGE.top}px ${STAGE.paddingX}px ${STAGE.reservedBottom}px`,
      }}
    >
      <Enter>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, maxWidth: 880 }}>
          {label && (
            <div
              style={{
                padding: '6px 18px',
                borderRadius: 999,
                border: `1px solid ${theme.borderStrong}`,
                background: theme.tint,
                color: theme.ink,
                fontFamily: CODE_FONT,
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}
            >
              {label}
            </div>
          )}
          <div
            dir="rtl"
            style={{
              fontFamily: ARABIC_FONT,
              fontWeight: 700,
              fontSize,
              lineHeight: 1.38,
              direction: 'rtl',
              textAlign: 'center',
              color: theme.text,
            }}
          >
            <BidiText>{text}</BidiText>
          </div>
          <div
            style={{
              width: 72,
              height: 3,
              borderRadius: 999,
              background: theme.ink,
              opacity: 0.75,
            }}
          />
        </div>
      </Enter>
    </AbsoluteFill>
  );
};

