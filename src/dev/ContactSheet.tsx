import { AbsoluteFill, Freeze } from 'remotion';
import { FPS, SIZE } from '../config';
import { EPISODES } from '../episodes';
import { CODE_FONT } from '../lib/fonts';
import { Reel } from '../Reel';

/**
 * Dev-only contact sheet: renders one episode frozen at several frames, side by side,
 * labelled with the frame, the time, and the word being spoken at that moment.
 * Used for before/after motion reviews and voice-sync checks. Render with `npx remotion still`.
 */
export type ContactSheetProps = {
  episodeId: string;
  frames: number[];
  columns: number;
  scale: number;
  title?: string;
};

export const CONTACT_SHEET_LABEL_HEIGHT = 64;
export const CONTACT_SHEET_HEADER_HEIGHT = 72;
const GAP = 16;

export const getContactSheetSize = ({ frames, columns, scale }: ContactSheetProps) => {
  const cellWidth = Math.round(SIZE.width * scale);
  const cellHeight = Math.round(SIZE.height * scale) + CONTACT_SHEET_LABEL_HEIGHT;
  const rows = Math.ceil(frames.length / columns);
  return {
    width: columns * cellWidth + (columns + 1) * GAP,
    height: CONTACT_SHEET_HEADER_HEIGHT + rows * cellHeight + (rows + 1) * GAP,
    // <Sequence> clamps children to the host composition's duration, so the sheet must be at least
    // as long as the latest frozen frame, otherwise late scenes render empty.
    durationInFrames: Math.max(1, ...frames) + 1,
  };
};

export const ContactSheet = (props: ContactSheetProps) => {
  const { episodeId, frames, columns, scale, title } = props;
  const episode = EPISODES.find((e) => e.id === episodeId);
  if (!episode) {
    throw new Error(`ContactSheet: unknown episode "${episodeId}"`);
  }
  const cellWidth = Math.round(SIZE.width * scale);
  const cellHeight = Math.round(SIZE.height * scale);

  const spokenAt = (frame: number) => {
    const seconds = frame / FPS;
    const current = episode.words.find((w) => seconds >= w.start && seconds <= w.end);
    if (current) return `🔊 ${current.text}`;
    const previous = [...episode.words].reverse().find((w) => w.end < seconds);
    return previous ? `… after “${previous.text}”` : '—';
  };

  return (
    <AbsoluteFill style={{ background: '#1b1c20', fontFamily: CODE_FONT, color: '#e4e4e7' }}>
      <div
        style={{
          height: CONTACT_SHEET_HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${GAP}px`,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        {title ?? `${episode.id} · contact sheet`}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, ${cellWidth}px)`,
          gap: GAP,
          padding: `0 ${GAP}px ${GAP}px`,
        }}
      >
        {frames.map((frame) => (
          <div key={frame} style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                height: CONTACT_SHEET_LABEL_HEIGHT,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                fontSize: 17,
                lineHeight: 1.35,
              }}
            >
              <span style={{ fontWeight: 700 }}>
                f{frame} · {(frame / FPS).toFixed(2)}s
              </span>
              <span style={{ color: '#a1a1aa' }}>{spokenAt(frame)}</span>
            </div>
            <div
              style={{
                width: cellWidth,
                height: cellHeight,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 10,
                outline: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div
                style={{
                  width: SIZE.width,
                  height: SIZE.height,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  inset: 0,
                }}
              >
                <Freeze frame={frame}>
                  <Reel episode={episode} />
                </Freeze>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
