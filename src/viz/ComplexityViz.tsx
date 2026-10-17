import { interpolate, useCurrentFrame } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { COMPLEXITY } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { ComplexityCurve, VizProps } from '../types';

const DEFAULT_CURVES: ComplexityCurve[] = ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'];

/**
 * Panel 15 — Animated SVG Big-O Complexity Graph Visualizer.
 * Plots O(1), O(log n), O(n), and O(n²) growth curves with progressive stroke-dashoffset animation.
 */
export const ComplexityViz = ({ viz }: VizProps<'complexity'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const curves = viz.curves ?? DEFAULT_CURVES;
  const drawProgress = interpolate(frame, [0, COMPLEXITY.drawFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const curveMeta: Record<
    ComplexityCurve,
    { path: string; color: string; endX: number; endY: number; rating: string }
  > = {
    'O(1)': {
      path: 'M 60 198 L 620 198',
      color: theme.good,
      endX: 628,
      endY: 198,
      rating: 'Instant',
    },
    'O(log n)': {
      path: 'M 60 198 Q 160 155, 620 144',
      color: theme.ink,
      endX: 628,
      endY: 144,
      rating: 'Fast',
    },
    'O(n)': {
      path: 'M 60 198 L 560 54',
      color: theme.warn,
      endX: 568,
      endY: 54,
      rating: 'Linear',
    },
    'O(n²)': {
      path: 'M 60 198 Q 210 190, 310 26',
      color: theme.bad,
      endX: 320,
      endY: 28,
      rating: 'Slow',
    },
  };

  return (
    <Box
      style={{
        direction: 'ltr',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: CODE_FONT,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: theme.tint,
              border: `1px solid ${theme.borderStrong}`,
              color: theme.ink,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            TIME COMPLEXITY · BIG-O
          </span>
          {viz.highlight && (
            <span style={{ fontSize: 17, color: theme.good, fontWeight: 600 }}>
              focus: {viz.highlight}
            </span>
          )}
        </div>
        <span style={{ fontSize: 16, color: theme.muted }}>Operations vs Input Size (n)</span>
      </div>

      {/* SVG Coordinate Chart */}
      <div
        style={{
          borderRadius: 14,
          border: `1px solid ${theme.borderStrong}`,
          background: theme.paperElevated,
          padding: '12px 16px 8px',
        }}
      >
        <svg viewBox="0 0 760 235" style={{ width: '100%', height: 225, overflow: 'visible' }}>
          {/* Horizontal grid lines */}
          {[45, 95, 145, 198].map((y) => (
            <line
              key={y}
              x1={60}
              y1={y}
              x2={640}
              y2={y}
              stroke={theme.border}
              strokeWidth={1}
              strokeDasharray={y === 198 ? undefined : '5 5'}
            />
          ))}
          {/* Vertical Y-axis */}
          <line x1={60} y1={20} x2={60} y2={198} stroke={theme.borderStrong} strokeWidth={2} />
          {/* Horizontal X-axis */}
          <line x1={60} y1={198} x2={650} y2={198} stroke={theme.borderStrong} strokeWidth={2} />

          {/* Axis Labels */}
          <text x={20} y={32} fill={theme.muted} fontSize={14} fontFamily={CODE_FONT}>
            Time ↑
          </text>
          <text x={535} y={224} fill={theme.muted} fontSize={14} fontFamily={CODE_FONT}>
            Input Size (n) →
          </text>

          {/* Animated Curves */}
          {curves.map((curveName) => {
            const meta = curveMeta[curveName];
            const isHighlighted = !viz.highlight || viz.highlight === curveName;
            const pathLength = 700;
            const dashOffset = pathLength * (1 - drawProgress);

            return (
              <g key={curveName} opacity={isHighlighted ? 1 : 0.35}>
                <path
                  d={meta.path}
                  fill="none"
                  stroke={meta.color}
                  strokeWidth={viz.highlight === curveName ? 5 : 3.5}
                  strokeLinecap="round"
                  strokeDasharray={pathLength}
                  strokeDashoffset={dashOffset}
                />
                {drawProgress > 0.75 && (
                  <g opacity={interpolate(drawProgress, [0.75, 1], [0, 1])}>
                    <rect
                      x={meta.endX}
                      y={meta.endY - 16}
                      width={112}
                      height={28}
                      rx={8}
                      fill={theme.paper}
                      stroke={meta.color}
                      strokeWidth={viz.highlight === curveName ? 2 : 1}
                    />
                    <text
                      x={meta.endX + 56}
                      y={meta.endY + 3}
                      textAnchor="middle"
                      fill={meta.color}
                      fontSize={16}
                      fontWeight={700}
                      fontFamily={CODE_FONT}
                    >
                      {curveName}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Pills Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {curves.map((c) => {
            const meta = curveMeta[c];
            const isFocus = viz.highlight === c;
            return (
              <span
                key={c}
                style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: isFocus ? theme.paper : theme.paperElevated,
                  border: `1px solid ${isFocus ? meta.color : theme.border}`,
                  color: meta.color,
                  fontSize: 16,
                  fontWeight: isFocus ? 700 : 500,
                }}
              >
                {c} · {meta.rating}
              </span>
            );
          })}
        </div>

        {viz.note && (
          <div
            style={{
              direction: 'rtl',
              fontFamily: ARABIC_FONT,
              fontSize: 21,
              fontWeight: 600,
              color: theme.text,
            }}
          >
            <BidiText>{viz.note}</BidiText>
          </div>
        )}
      </div>
    </Box>
  );
};
