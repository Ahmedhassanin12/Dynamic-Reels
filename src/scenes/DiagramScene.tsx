import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { DiagramNode, SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const DiagramScene = ({
  label,
  title,
  pill,
  nodes,
  highlight,
  layout = 'vertical',
  edgeLabels,
  returnEdgeLabels,
  subLayer,
}: SceneOf<'diagram'>) => {
  const theme = useTheme();
  const normalizedNodes: DiagramNode[] = nodes.map((n) => (typeof n === 'string' ? { title: n } : n));
  const resolvedPill =
    pill ??
    (layout === 'architecture'
      ? 'SYSTEM ARCHITECTURE · FLOW'
      : layout === 'pipeline'
        ? 'RENDER PIPELINE'
        : 'FLOW DIAGRAM');

  const isHorizontalGrid = layout === 'pipeline' && normalizedNodes.length === 4;

  return (
    <SceneFrame label={label} title={title} pill={resolvedPill} pillTone="neutral">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, direction: 'rtl' }}>
        <div
          style={
            isHorizontalGrid
              ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, direction: 'ltr' }
              : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }
          }
        >
          {normalizedNodes.map((node, i) => {
            const isHighlighted = i === highlight;
            const resolvedTone = node.tone ?? (isHighlighted ? 'ink' : 'paper');
            const isGood = resolvedTone === 'good';
            const isBad = resolvedTone === 'bad';
            const isWarn = resolvedTone === 'warn';
            const isInk = resolvedTone === 'ink';

            const accent = isGood
              ? theme.good
              : isBad
                ? theme.bad
                : isWarn
                  ? theme.warn
                  : isInk
                    ? theme.ink
                    : theme.text;
            const tint = isGood
              ? theme.goodTint
              : isBad
                ? theme.badTint
                : isWarn
                  ? theme.warnTint
                  : theme.tint;
            const border = isGood
              ? theme.goodBorder
              : isBad
                ? theme.badBorder
                : isWarn
                  ? theme.warnBorder
                  : isInk
                    ? theme.borderStrong
                    : theme.border;

            const edgeLabel = i > 0 ? edgeLabels?.[i - 1] : undefined;
            const returnLabel = i > 0 ? returnEdgeLabels?.[i - 1] : undefined;

            return (
              <Enter key={i} delay={i * MOTION.stagger * 1.5} style={{ width: '100%' }}>
                {/* Connector Arrow + Edge Labels between vertical/architecture nodes */}
                {!isHorizontalGrid && i > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 14,
                      marginBottom: 12,
                      direction: 'ltr',
                    }}
                  >
                    {edgeLabel && (
                      <span
                        style={{
                          padding: '4px 14px',
                          borderRadius: 999,
                          background: theme.tint,
                          border: `1px solid ${theme.borderStrong}`,
                          color: theme.ink,
                          fontFamily: CODE_FONT,
                          fontSize: 17,
                          fontWeight: 600,
                        }}
                      >
                        ↓ {edgeLabel}
                      </span>
                    )}
                    {!edgeLabel && !returnLabel && (
                      <div style={{ fontSize: 30, lineHeight: 1, color: theme.ink }}>↓</div>
                    )}
                    {returnLabel && (
                      <span
                        style={{
                          padding: '4px 14px',
                          borderRadius: 999,
                          background: theme.goodTint,
                          border: `1px solid ${theme.goodBorder}`,
                          color: theme.good,
                          fontFamily: CODE_FONT,
                          fontSize: 17,
                          fontWeight: 600,
                        }}
                      >
                        ↑ {returnLabel}
                      </span>
                    )}
                  </div>
                )}

                <Box
                  tone={resolvedTone}
                  style={{
                    padding: '22px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    textAlign: isHorizontalGrid ? 'left' : 'right',
                    direction: isHorizontalGrid ? 'ltr' : 'rtl',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: tint,
                          border: `1px solid ${border}`,
                          color: isGood || isBad || isWarn ? accent : theme.ink,
                          display: 'grid',
                          placeItems: 'center',
                          fontFamily: CODE_FONT,
                          fontSize: 18,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 31, fontWeight: 700, color: theme.text }}>
                        <BidiText>{node.title}</BidiText>
                      </span>
                    </div>

                    {node.badge && (
                      <span
                        style={{
                          direction: 'ltr',
                          padding: '5px 14px',
                          borderRadius: 999,
                          background: tint,
                          border: `1px solid ${border}`,
                          color: isGood || isBad || isWarn ? accent : theme.ink,
                          fontFamily: CODE_FONT,
                          fontSize: 17,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {node.badge}
                      </span>
                    )}
                  </div>

                  {node.sub && (
                    <div
                      style={{
                        fontSize: 23,
                        color: theme.muted,
                        lineHeight: 1.4,
                        paddingRight: isHorizontalGrid ? 0 : 46,
                        paddingLeft: isHorizontalGrid ? 46 : 0,
                      }}
                    >
                      <BidiText>{node.sub}</BidiText>
                    </div>
                  )}
                </Box>
              </Enter>
            );
          })}
        </div>

        {/* Optional Bottom SubLayer (e.g. React Hooks & Diffing Callout) */}
        {subLayer && (
          <Enter delay={normalizedNodes.length * MOTION.stagger * 1.5}>
            <Box
              style={{
                direction: 'ltr',
                padding: '18px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: theme.paperElevated,
                fontFamily: CODE_FONT,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: theme.ink, letterSpacing: '0.08em' }}>
                  {subLayer.label}
                </span>
                {subLayer.note && (
                  <span style={{ fontSize: 17, color: theme.good, fontWeight: 600 }}>{subLayer.note}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {subLayer.items.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      background: theme.paper,
                      border: `1px solid ${theme.borderStrong}`,
                      color: theme.text,
                      fontSize: 19,
                      fontWeight: 600,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Box>
          </Enter>
        )}
      </div>
    </SceneFrame>
  );
};


