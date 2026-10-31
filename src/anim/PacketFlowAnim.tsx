import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { BidiText } from '../components/BidiText';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { packetArrivals } from '../lib/anim';
import { CLAMP, EASINGS, fadeSlide, scalePop } from '../lib/motion';
import { useTheme } from '../lib/theme';
import type { MotionAnim } from '../types';

const RAIL_W = 64;
const GAP = 56;
const DOT = 30;

/** Frame at which the packet arrives at each stop. */
export { packetArrivals };

/**
 * A request packet travels down a rail of stations; each station lights up and reveals its detail
 * when the packet arrives. Optionally a green response packet travels back up.
 */
export const PacketFlowAnim = ({ anim }: { anim: Extract<MotionAnim, { type: 'packetFlow' }> }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();

  const { stops } = anim;
  const n = stops.length;
  const hop = anim.hopFrames ?? 26;
  const arr = packetArrivals(n, anim.arriveAt, hop);
  const nodeH = Math.min(132, Math.floor((820 - (n - 1) * GAP) / n));
  const pitch = nodeH + GAP;
  const totalH = n * nodeH + (n - 1) * GAP;
  const yOf = (p: number) => nodeH / 2 + p * pitch;

  // Forward position (in stop units): 0..n-1
  let forward = 0;
  for (let i = 1; i < n; i++) {
    const travel = Math.max(6, Math.min(hop, arr[i] - arr[i - 1]));
    if (frame >= arr[i]) {
      forward = i;
      continue;
    }
    if (frame >= arr[i] - travel) {
      forward =
        i -
        1 +
        interpolate(frame, [arr[i] - travel, arr[i]], [0, 1], { ...CLAMP, easing: EASINGS.inOutCubic });
    }
    break;
  }

  // Return trip
  const retStart = arr[n - 1] + 18;
  const retDur = Math.max(20, Math.round((n - 1) * hop * 0.55));
  const returning = Boolean(anim.returnTrip) && frame >= retStart;
  const backT = anim.returnTrip
    ? interpolate(frame, [retStart, retStart + retDur], [0, 1], { ...CLAMP, easing: EASINGS.inOutCubic })
    : 0;
  const position = returning ? (n - 1) * (1 - backT) : forward;
  const packetColor = returning ? theme.good : theme.warn;
  const packetVisible = frame >= arr[0] - 6 && !(returning && backT >= 1);
  const packetOpacity = interpolate(frame, [arr[0] - 6, arr[0]], [0, 1], CLAMP);
  const trailTop = returning ? yOf(position) : yOf(0);
  const trailBottom = returning ? yOf(n - 1) : yOf(position);

  const toneColor = (tone?: string) =>
    tone === 'bad' ? theme.bad : tone === 'warn' ? theme.warn : tone === 'ink' ? theme.ink : theme.good;
  const toneBorder = (tone?: string) =>
    tone === 'bad'
      ? theme.badBorder
      : tone === 'warn'
        ? theme.warnBorder
        : tone === 'ink'
          ? theme.borderStrong
          : theme.goodBorder;
  const toneTint = (tone?: string) =>
    tone === 'bad'
      ? theme.badTint
      : tone === 'warn'
        ? theme.warnTint
        : tone === 'ink'
          ? theme.tint
          : theme.goodTint;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'relative', height: totalH, direction: 'rtl' }}>
        {/* rail */}
        <div
          style={{
            position: 'absolute',
            right: RAIL_W / 2 - 2,
            top: yOf(0),
            height: yOf(n - 1) - yOf(0),
            width: 4,
            borderRadius: 2,
            background: theme.border,
          }}
        />
        {/* trail */}
        <div
          style={{
            position: 'absolute',
            right: RAIL_W / 2 - 2,
            top: trailTop,
            height: Math.max(0, trailBottom - trailTop),
            width: 4,
            borderRadius: 2,
            background: packetColor,
            opacity: packetOpacity,
          }}
        />

        {stops.map((stop, i) => {
          const lit = frame >= arr[i];
          const pop = scalePop(frame, fps, { delay: arr[i], from: 0.94 });
          const enter = fadeSlide(frame, fps, { delay: i * 5, distance: 28, axis: 'x' });
          const litT = interpolate(frame, [arr[i], arr[i] + 8], [0, 1], {
            ...CLAMP,
            easing: EASINGS.outCubic,
          });
          const color = toneColor(stop.tone);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                right: 0,
                left: 0,
                top: i * pitch,
                height: nodeH,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: enter.opacity,
                transform: `translateX(${-(1 - enter.progress) * 28}px)`,
              }}
            >
              {/* rail dot */}
              <div style={{ width: RAIL_W, display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    width: DOT * 0.75,
                    height: DOT * 0.75,
                    borderRadius: 999,
                    border: `3px solid ${lit ? color : theme.borderStrong}`,
                    background: lit ? color : theme.bg,
                  }}
                />
              </div>
              {/* card */}
              <div
                style={{
                  flex: 1,
                  height: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  padding: '0 26px',
                  borderRadius: 22,
                  border: `1.5px solid ${lit ? toneBorder(stop.tone) : theme.border}`,
                  background: lit ? toneTint(stop.tone) : theme.paperElevated,
                  opacity: 0.5 + 0.5 * litT,
                  transform: lit ? pop.transform : undefined,
                  boxShadow: lit ? `0 0 ${24 * litT}px ${color}33` : undefined,
                }}
              >
                <div style={{ fontSize: Math.min(64, nodeH * 0.5), lineHeight: 1 }}>{stop.icon}</div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <div style={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: 40, color: theme.text }}>
                    <BidiText>{stop.label}</BidiText>
                  </div>
                  {stop.sub && (
                    <div
                      style={{
                        fontFamily: ARABIC_FONT,
                        fontWeight: 600,
                        fontSize: 28,
                        color: color,
                        opacity: litT,
                        transform: `translateY(${(1 - litT) * 8}px)`,
                      }}
                    >
                      <BidiText>{stop.sub}</BidiText>
                    </div>
                  )}
                </div>
                {stop.badge && (
                  <div
                    style={{
                      fontFamily: CODE_FONT,
                      fontSize: 20,
                      letterSpacing: 1,
                      padding: '5px 14px',
                      borderRadius: 999,
                      border: `1px solid ${lit ? toneBorder(stop.tone) : theme.border}`,
                      color: lit ? color : theme.muted,
                      direction: 'ltr',
                    }}
                  >
                    {stop.badge}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* packet */}
        {packetVisible && (
          <div
            style={{
              position: 'absolute',
              right: RAIL_W / 2 - DOT / 2,
              top: yOf(position) - DOT / 2,
              width: DOT,
              height: DOT,
              borderRadius: 999,
              background: packetColor,
              opacity: packetOpacity,
              boxShadow: `0 0 26px 8px ${packetColor}99`,
            }}
          />
        )}
      </div>
    </div>
  );
};
