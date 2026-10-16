import { Img, staticFile, useCurrentFrame } from 'remotion';
import { CHARACTER } from '../config';
import { useTheme } from '../lib/theme';

export const Character = () => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 6) * 6;
  const style = { position: 'absolute', left: 1, bottom: 20 , width: CHARACTER.width, height: CHARACTER.height } as const;

  if (CHARACTER.src) return <div style={{width:"320px",height:"320px", borderRadius:"50%"}}><Img src={staticFile(CHARACTER.src)} style={{ ...style, objectFit:"fill" , backgroundColor:"transparent" }} /></div>;

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
