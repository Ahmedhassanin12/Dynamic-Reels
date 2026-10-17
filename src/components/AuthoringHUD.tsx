import { useCurrentFrame, useVideoConfig } from 'remotion';
import { STAGE } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import { getMinSceneFrames, type TimelineItem } from '../lib/timeline';
import type { Episode } from '../types';

type Props = {
  episode: Episode;
  timeline: TimelineItem[];
  showDevHUD?: boolean;
  showSafeGuides?: boolean;
};

export const AuthoringHUD = ({
  episode,
  timeline,
  showDevHUD = false,
  showSafeGuides = false,
}: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();

  if (!showDevHUD && !showSafeGuides) return null;

  const t = frame / fps;
  const activeIndex = timeline.findIndex(
    (item) => frame >= item.from && frame < item.from + item.durationInFrames,
  );
  const activeItem = timeline[activeIndex !== -1 ? activeIndex : timeline.length - 1];
  const activeWord = episode.words.find((w) => w.start <= t && w.end >= t);
  const minFrames = activeItem ? getMinSceneFrames(activeItem.scene) : 0;
  const isRushed = activeItem ? activeItem.durationInFrames < minFrames : false;

  const stageTop = STAGE.top;
  const stageBottom = 1920 - STAGE.reservedBottom; // 1340px
  const stageLeft = STAGE.paddingX; // 84px
  const stageRight = 1080 - STAGE.paddingX; // 996px

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        fontFamily: CODE_FONT,
        direction: 'ltr',
      }}
    >
      {/* 1. Safe Zone Visual Guidelines */}
      {showSafeGuides && (
        <>
          {/* Top Safe Margin Line */}
          <div
            style={{
              position: 'absolute',
              top: stageTop,
              left: 0,
              right: 0,
              borderTop: '1px dashed rgba(245, 158, 11, 0.45)',
              display: 'flex',
              justifyContent: 'flex-start',
              padding: '2px 12px',
            }}
          >
            <span style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(0,0,0,0.6)', padding: '1px 6px', borderRadius: 4 }}>
              TOP SAFE MARGIN: 170px
            </span>
          </div>

          {/* Bottom Reserved Boundary Line */}
          <div
            style={{
              position: 'absolute',
              top: stageBottom,
              left: 0,
              right: 0,
              borderTop: '1px dashed rgba(244, 63, 94, 0.45)',
              display: 'flex',
              justifyContent: 'flex-start',
              padding: '2px 12px',
            }}
          >
            <span style={{ fontSize: 11, color: '#f43f5e', background: 'rgba(0,0,0,0.6)', padding: '1px 6px', borderRadius: 4 }}>
              RESERVED BOTTOM: 1340px (AVATAR & CAPTIONS)
            </span>
          </div>

          {/* Left Stage Margin Line */}
          <div
            style={{
              position: 'absolute',
              left: stageLeft,
              top: stageTop,
              bottom: STAGE.reservedBottom,
              borderLeft: '1px dashed rgba(255, 255, 255, 0.15)',
            }}
          />

          {/* Right Stage Margin Line */}
          <div
            style={{
              position: 'absolute',
              left: stageRight,
              top: stageTop,
              bottom: STAGE.reservedBottom,
              borderRight: '1px dashed rgba(255, 255, 255, 0.15)',
            }}
          />
        </>
      )}

      {/* 2. Interactive Developer HUD Badge */}
      {showDevHUD && activeItem && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            maxWidth: 420,
            background: 'rgba(8, 9, 13, 0.92)',
            border: `1px solid ${isRushed ? theme.badBorder : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: 12,
            padding: '12px 16px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontSize: 13,
            color: '#e4e4e7',
          }}
        >
          {/* Top row: Frame & Time */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: theme.ink }}>
              FRAME {frame} <span style={{ color: '#a1a1aa' }}>({t.toFixed(2)}s)</span>
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: isRushed ? theme.bad : theme.good,
                background: isRushed ? theme.badTint : theme.goodTint,
                padding: '2px 8px',
                borderRadius: 4,
                border: `1px solid ${isRushed ? theme.badBorder : theme.goodBorder}`,
              }}
            >
              {isRushed ? '⚠ RUSHED' : '✓ OPTIMAL'}
            </span>
          </div>

          {/* Scene details */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#a1a1aa' }}>Scene:</span>
              <span style={{ fontWeight: 600, color: '#f4f4f5' }}>
                [{activeIndex + 1}/{timeline.length}] {activeItem.scene.id} ({activeItem.scene.kind})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ color: '#a1a1aa' }}>Duration:</span>
              <span style={{ color: isRushed ? theme.bad : '#d4d4d8' }}>
                {activeItem.durationInFrames}f ({(activeItem.durationInFrames / fps).toFixed(1)}s) · min {minFrames}f
              </span>
            </div>
          </div>

          {/* Anchor & Spoken Word */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#a1a1aa' }}>Anchor:</span>
              <span style={{ color: theme.ink, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeItem.match ? `"${activeItem.match.text}" @ ${activeItem.match.startSeconds.toFixed(2)}s` : String(activeItem.scene.at)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ color: '#a1a1aa' }}>Voice Word:</span>
              <span style={{ color: activeWord ? '#fcd34d' : '#71717a' }}>
                {activeWord ? `"${activeWord.text}" (${activeWord.start}s)` : 'silence / pause'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
