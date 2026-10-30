import { Img, staticFile, useCurrentFrame } from 'remotion';
import { CHARACTER } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import { BidiText } from './BidiText';

export const Character = () => {
  const theme = useTheme();
  const frame = useCurrentFrame();

  if (CHARACTER.mode === 'none') {
    return null;
  }

  // Modern Top Profile Header Pill
  if (CHARACTER.mode === 'header') {
    const pulse = 0.6 + 0.4 * Math.sin(frame * 0.18);

    return (
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: 48,
          right: 84,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '8px 20px 8px 12px',
          borderRadius: 999,
          background: theme.paperElevated,
          border: `1.5px solid ${theme.borderStrong}`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.35)`,
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        {/* Avatar Ring */}
        <div
          style={{
            position: 'relative',
            width: 64,
            height: 64,
            borderRadius: '50%',
            padding: 3,
            background: `linear-gradient(135deg, ${theme.good}, ${theme.ink})`,
            boxShadow: `0 0 16px ${theme.good}44`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: theme.bg,
            }}
          >
            {CHARACTER.src ? (
              <Img
                src={staticFile(CHARACTER.src)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top 15% center',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 26,
                }}
              >
                👤
              </div>
            )}
          </div>

          {/* Active status dot */}
          <div
            style={{
              position: 'absolute',
              bottom: 2,
              left: 2,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: theme.good,
              border: `2px solid ${theme.paperElevated}`,
              opacity: pulse,
            }}
          />
        </div>

        {/* Creator Identity info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            style={{
              fontFamily: ARABIC_FONT,
              fontWeight: 800,
              fontSize: 24,
              color: theme.text,
              lineHeight: 1.15,
            }}
          >
            <BidiText>{CHARACTER.name}</BidiText>
          </div>
          <div
            dir="ltr"
            style={{
              fontFamily: CODE_FONT,
              fontWeight: 600,
              fontSize: 18,
              color: theme.good,
              letterSpacing: 0.5,
              lineHeight: 1,
            }}
          >
            {CHARACTER.handle}
          </div>
        </div>
      </div>
    );
  }

  // Classic bottom-left full mascot (if someone explicitly sets mode: 'bottom')
  const bob = Math.sin(frame / 18) * 3;
  const style = {
    position: 'absolute' as const,
    left: 6,
    bottom: 12,
    width: CHARACTER.width,
    height: CHARACTER.height,
    transform: `translateY(${bob.toFixed(2)}px)`,
    pointerEvents: 'none' as const,
  };

  if (CHARACTER.src) {
    return (
      <Img
        src={staticFile(CHARACTER.src)}
        style={{
          ...style,
          objectFit: 'contain',
          objectPosition: 'bottom left',
          backgroundColor: 'transparent',
        }}
      />
    );
  }

  return null;
};
