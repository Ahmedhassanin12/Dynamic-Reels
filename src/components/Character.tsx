import { Img, staticFile, useCurrentFrame } from 'remotion';
import { CHARACTER, THEME } from '../config';

export const Character = () => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 6) * 6;
  const style = { position: 'absolute', left: 30, bottom: 20 , width: CHARACTER.width, height: CHARACTER.height } as const;

  if (CHARACTER.src) return <div style={{width:"320px",height:"320px", borderRadius:"50%"}}><Img src={staticFile(CHARACTER.src)} style={{ ...style, borderRadius:"50%" , objectFit:"fill"  }} /></div>;

  return (
    <div
      style={{
        ...style,
        border: `4px dashed ${THEME.ink}`,
        color: THEME.ink,
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
