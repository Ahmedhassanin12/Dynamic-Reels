import { interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from 'remotion';
import { BidiText } from '../components/BidiText';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { CLAMP, EASINGS, enterProgress } from '../lib/motion';
import { useTheme } from '../lib/theme';
import type { MotionAnim } from '../types';

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
const HEART_RED = '#ff3b5c';
const HEART_SIZE = 380;
const PARTICLES = 10;

/** A counter that rolls up (or down) whenever its value changes. */
const RollingNumber = ({ changes, initial }: { changes: { at: number; value: number }[]; initial: number }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const passed = changes.filter((c) => frame >= c.at);
  const current = passed.at(-1)?.value ?? initial;
  const previous = passed.length > 1 ? passed.at(-2)!.value : initial;
  const changeAt = passed.at(-1)?.at ?? 0;
  const t = passed.length
    ? interpolate(frame, [changeAt, changeAt + 10], [0, 1], { ...CLAMP, easing: EASINGS.outCubic })
    : 1;
  const dir = current >= previous ? 1 : -1;
  const style = {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: CODE_FONT,
    fontWeight: 700,
    fontSize: 64,
    color: theme.text,
  };

  return (
    <div style={{ position: 'relative', width: 230, height: 84, direction: 'ltr' }}>
      <div style={{ ...style, opacity: 1 - t, transform: `translateY(${-dir * 34 * t}px)` }}>
        {previous.toLocaleString('en-US')}
      </div>
      <div style={{ ...style, opacity: t, transform: `translateY(${dir * 34 * (1 - t)}px)` }}>
        {current.toLocaleString('en-US')}
      </div>
    </div>
  );
};

/**
 * Tap → the heart pops and fills red with a particle burst, the counter rolls +1, and a status chip
 * says the server hasn't heard about it yet (optimistic UI). With `revertAt` the request "fails":
 * the heart shakes and turns back to empty, and the counter rolls back.
 */
export const LikeHeartAnim = ({ anim }: { anim: Extract<MotionAnim, { type: 'likeHeart' }> }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();

  const likes = anim.likes ?? 1203;
  const tapAt = anim.tapAt ?? 12;
  const revertAt = anim.revertAt;
  const reverted = revertAt !== undefined && frame >= revertAt;

  // Entrance
  const enter = enterProgress(frame, fps, 0, 'enter');
  const enterScale = interpolate(enter, [0, 1], [0.7, 1]);
  const enterOpacity = interpolate(frame, [0, 10], [0, 1], CLAMP);

  // Press & pop
  const pressScale = interpolate(frame, [tapAt, tapAt + 4, tapAt + 12, tapAt + 22], [1, 0.82, 1.28, 1], {
    ...CLAMP,
    easing: EASINGS.outCubic,
  });

  // Fill: 0 → 1 on tap; back to 0 on revert
  const fillIn = interpolate(frame, [tapAt + 2, tapAt + 10], [0, 1], CLAMP);
  const fillOut = revertAt === undefined ? 0 : interpolate(frame, [revertAt, revertAt + 12], [0, 1], CLAMP);
  const fill = fillIn * (1 - fillOut);
  const heartColor = interpolateColors(fill, [0, 1], [theme.paperElevated, HEART_RED]);
  const strokeColor = interpolateColors(fill, [0, 1], [theme.borderStrong, HEART_RED]);

  // Shake on failure
  const shake =
    revertAt === undefined
      ? 0
      : interpolate(frame, [revertAt, revertAt + 16], [1, 0], CLAMP) * Math.sin((frame - revertAt) * 1.9) * 16;

  // Tap ripple
  const rippleT = interpolate(frame, [tapAt, tapAt + 16], [0, 1], { ...CLAMP, easing: EASINGS.outCubic });
  // Burst ring
  const ringT = interpolate(frame, [tapAt + 4, tapAt + 24], [0, 1], { ...CLAMP, easing: EASINGS.outExpo });

  // Status chip
  const chipAt = tapAt + 14;
  const chipT = interpolate(frame, [chipAt, chipAt + 10], [0, 1], { ...CLAMP, easing: EASINGS.outCubic });
  const pulse = 0.55 + 0.45 * Math.sin(frame * 0.35);
  const chipTone = reverted ? 'bad' : 'warn';
  const chipColor = reverted ? theme.bad : theme.warn;
  const chipBg = reverted ? theme.badTint : theme.warnTint;
  const chipBorder = reverted ? theme.badBorder : theme.warnBorder;
  const chipText = reverted
    ? (anim.failText ?? 'فشل الإرسال')
    : (anim.statusText ?? 'السيرفر: لسه ماعرفش');

  const changes = [{ at: tapAt + 8, value: likes + 1 }];
  if (revertAt !== undefined) changes.push({ at: revertAt + 4, value: likes });

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 36,
        opacity: enterOpacity,
        transform: `scale(${enterScale})`,
      }}
    >
      <div style={{ position: 'relative', width: HEART_SIZE, height: HEART_SIZE, transform: `translateX(${shake}px)` }}>
        {/* tap ripple */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: HEART_SIZE * 0.55,
            height: HEART_SIZE * 0.55,
            marginLeft: -HEART_SIZE * 0.275,
            marginTop: -HEART_SIZE * 0.275,
            borderRadius: 999,
            background: theme.text,
            opacity: frame < tapAt ? 0 : 0.28 * (1 - rippleT),
            transform: `scale(${0.3 + rippleT * 1.5})`,
          }}
        />
        {/* burst ring */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: HEART_SIZE,
            height: HEART_SIZE,
            marginLeft: -HEART_SIZE / 2,
            marginTop: -HEART_SIZE / 2,
            borderRadius: 999,
            border: `5px solid ${HEART_RED}`,
            opacity: frame < tapAt + 4 || reverted ? 0 : 0.7 * (1 - ringT),
            transform: `scale(${0.55 + ringT * 0.9})`,
          }}
        />
        {/* particles */}
        {Array.from({ length: PARTICLES }, (_, i) => {
          const angle = (i / PARTICLES) * Math.PI * 2 + 0.3;
          const reach = 215 + (i % 3) * 36;
          const t = interpolate(frame, [tapAt + 6, tapAt + 28], [0, 1], { ...CLAMP, easing: EASINGS.outExpo });
          const size = 22 + (i % 3) * 9;
          return (
            <svg
              key={i}
              viewBox="0 0 24 24"
              width={size}
              height={size}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: -size / 2,
                marginTop: -size / 2,
                opacity: frame < tapAt + 6 ? 0 : 1 - t,
                transform: `translate(${Math.cos(angle) * reach * t}px, ${Math.sin(angle) * reach * t}px) scale(${1 - t * 0.4})`,
              }}
            >
              <path d={HEART_PATH} fill={i % 2 ? HEART_RED : '#ff8fa3'} />
            </svg>
          );
        })}
        {/* the heart */}
        <svg
          viewBox="0 0 24 24"
          width={HEART_SIZE}
          height={HEART_SIZE}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'visible',
            transform: `scale(${pressScale})`,
            filter: fill > 0.05 ? `drop-shadow(0 0 ${28 * fill}px ${HEART_RED}88)` : undefined,
          }}
        >
          <path d={HEART_PATH} fill={heartColor} stroke={strokeColor} strokeWidth={0.7} strokeLinejoin="round" />
        </svg>
      </div>

      {/* likes counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, direction: 'ltr' }}>
        <svg viewBox="0 0 24 24" width={52} height={52}>
          <path d={HEART_PATH} fill={heartColor} stroke={strokeColor} strokeWidth={1} strokeLinejoin="round" />
        </svg>
        <RollingNumber changes={changes} initial={likes} />
      </div>

      {/* status chip */}
      <div
        style={{
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 28px',
          borderRadius: 999,
          border: `1.5px solid ${chipBorder}`,
          background: chipBg,
          color: chipColor,
          fontFamily: ARABIC_FONT,
          fontWeight: 700,
          fontSize: 34,
          direction: 'rtl',
          opacity: chipT,
          transform: `translateY(${(1 - chipT) * 16}px)`,
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            background: chipColor,
            opacity: chipTone === 'warn' ? pulse : 1,
          }}
        />
        <BidiText>{chipText}</BidiText>
      </div>
    </div>
  );
};
