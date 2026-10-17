import { useCurrentFrame } from 'remotion';
import { Box } from '../components/Box';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { LinkedListNode, LinkedListNodeInput, VizProps } from '../types';
import { ResultBadge } from './ResultBadge';

const normalizeNode = (input: LinkedListNodeInput, index: number, total: number): LinkedListNode => {
  if (typeof input === 'object' && input !== null) {
    return {
      ...input,
      address: input.address ?? `0x${(16 + index * 12).toString(16).toUpperCase()}`,
      badge: input.badge ?? (index === 0 ? 'HEAD' : index === total - 1 ? 'TAIL' : undefined),
    };
  }
  return {
    value: input,
    address: `0x${(16 + index * 12).toString(16).toUpperCase()}`,
    badge: index === 0 ? 'HEAD' : index === total - 1 ? 'TAIL' : undefined,
  };
};

export const LinkedListViz = ({ viz, result }: VizProps<'linkedList'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  const rawNodes = viz.nodes ?? [];
  const nodes = rawNodes.map((n, i) => normalizeNode(n, i, rawNodes.length));

  // Determine active pointer index
  let activeIndex: number | undefined;
  if (viz.framesPerStep !== undefined && viz.framesPerStep > 0) {
    activeIndex = Math.min(nodes.length - 1, Math.floor(frame / viz.framesPerStep));
  } else if (viz.activePointer !== undefined) {
    if (typeof viz.activePointer === 'number') {
      activeIndex = viz.activePointer;
    } else {
      const idx = nodes.findIndex((n) => n.address === viz.activePointer || String(n.value) === viz.activePointer);
      if (idx !== -1) activeIndex = idx;
    }
  }

  const pointerLabel = viz.pointerLabel ?? 'curr';

  return (
    <Box
      tone="paper"
      style={{
        direction: 'ltr',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        fontFamily: CODE_FONT,
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, color: theme.ink, fontWeight: 700 }}>
            linked list · pointer chaining
          </span>
          <span
            style={{
              fontSize: 13,
              color: theme.muted,
              background: theme.paperElevated,
              padding: '2px 8px',
              borderRadius: 6,
              border: `1px solid ${theme.border}`,
            }}
          >
            {nodes.length} nodes
          </span>
        </div>
        {activeIndex !== undefined && (
          <span style={{ fontSize: 16, color: theme.good, fontWeight: 600 }}>
            pointer at [{activeIndex}] {nodes[activeIndex]?.address}
          </span>
        )}
      </div>

      {/* Nodes Chain Area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '16px 0',
        }}
      >
        {nodes.map((node, i) => {
          const isActive = activeIndex === i;
          const isHighlighted = node.highlight || isActive;
          const isHead = i === 0;
          const isTail = i === nodes.length - 1;
          const nextAddress = node.next !== undefined ? node.next : isTail ? null : nodes[i + 1]?.address;

          const toneColor =
            node.tone === 'good' || (isHead && !node.tone)
              ? theme.good
              : node.tone === 'bad'
                ? theme.bad
                : node.tone === 'warn'
                  ? theme.warn
                  : isActive
                    ? theme.good
                    : theme.ink;

          const toneTint =
            node.tone === 'good' || (isHead && !node.tone)
              ? theme.goodTint
              : node.tone === 'bad'
                ? theme.badTint
                : node.tone === 'warn'
                  ? theme.warnTint
                  : isActive
                    ? theme.goodTint
                    : theme.paperElevated;

          const toneBorder =
            node.tone === 'good' || (isHead && !node.tone)
              ? theme.goodBorder
              : node.tone === 'bad'
                ? theme.badBorder
                : node.tone === 'warn'
                  ? theme.warnBorder
                  : isActive
                    ? theme.goodBorder
                    : theme.borderStrong;

          return (
            <div key={`${node.address}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Node Card */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {/* Pointer indicator tag above active node */}
                <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isActive && (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: theme.good,
                        background: theme.goodTint,
                        border: `1px solid ${theme.goodBorder}`,
                        borderRadius: 6,
                        padding: '1px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      ▲ {pointerLabel}
                    </span>
                  )}
                </div>

                {/* Node Box */}
                <div
                  style={{
                    borderRadius: 14,
                    border: `1.5px solid ${toneBorder}`,
                    background: toneTint,
                    boxShadow: isActive ? theme.goodShadow : theme.shadowSm,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 130,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Node Address / Badge Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 8px',
                      background: 'rgba(0,0,0,0.25)',
                      borderBottom: `1px solid ${theme.border}`,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: theme.muted }}>{node.address}</span>
                    {node.badge && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: toneColor,
                          background: 'rgba(255,255,255,0.06)',
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                      >
                        {node.badge}
                      </span>
                    )}
                  </div>

                  {/* Node Payload: Data | Next Pointer */}
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    {/* Data / Value cell */}
                    <div
                      style={{
                        padding: '12px 14px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: `1px solid ${theme.border}`,
                      }}
                    >
                      <span style={{ fontSize: 11, color: theme.muted, marginBottom: 2 }}>val</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>
                        {String(node.value)}
                      </span>
                    </div>

                    {/* Next Pointer cell */}
                    <div
                      style={{
                        padding: '12px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        minWidth: 44,
                      }}
                    >
                      <span style={{ fontSize: 11, color: theme.muted, marginBottom: 2 }}>next</span>
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: nextAddress === null ? theme.bad : theme.good,
                        }}
                      >
                        {nextAddress === null ? '⏚' : '•'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Index subscript */}
                <span style={{ fontSize: 12, color: theme.muted }}>[{i}]</span>
              </div>

              {/* Connecting Pointer Arrow */}
              {!isTail && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: isActive ? theme.good : theme.muted,
                    fontSize: 22,
                    fontWeight: 700,
                    marginTop: 8,
                  }}
                >
                  <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                    <line
                      x1="0"
                      y1="8"
                      x2="26"
                      y2="8"
                      stroke={isActive ? theme.good : theme.borderStrong}
                      strokeWidth="2.5"
                      strokeDasharray={isActive ? 'none' : '4 2'}
                    />
                    <polygon
                      points="24,3 32,8 24,13"
                      fill={isActive ? theme.good : theme.borderStrong}
                    />
                  </svg>
                </div>
              )}

              {/* Tail null indicator */}
              {isTail && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: theme.bad,
                    fontSize: 14,
                    fontWeight: 700,
                    marginTop: 8,
                    gap: 2,
                  }}
                >
                  <span style={{ fontSize: 18 }}>⏚</span>
                  <span style={{ fontSize: 11, color: theme.muted }}>NULL</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Result / Educational Note */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 16, color: theme.muted }}>
          {viz.note ?? 'Non-contiguous memory allocation · fast insertion without shifting'}
        </span>
        {result && <ResultBadge text={result} delay={0} tone="good" />}
      </div>
    </Box>
  );
};
