import { Img, staticFile, useCurrentFrame } from 'remotion';
import { CHARACTER } from '../config';
import { useTheme } from '../lib/theme';

export const Character = () => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 18) * 3;
  const style = {
    position: 'absolute',
    left: 6,
    bottom: 12,
    width: CHARACTER.width,
    height: CHARACTER.height,
    transform: `translateY(${bob.toFixed(2)}px)`,
    pointerEvents: 'none',
  } as const;

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

  return (
    <div
      style={{
        ...style,
        border: `4px dashed ${theme.ink}`,
        color: theme.ink,
        display: 'grid',
        placeItems: 'center',
        fontSize: 40,
        textAlign: 'center',
      }}
    >
      Character PNG
    </div>
  );
};
