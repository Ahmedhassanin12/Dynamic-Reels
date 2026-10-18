import { Highlight } from 'prism-react-renderer';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const CompareScene = ({ label, title, pill, sides }: SceneOf<'compare'>) => {
  const theme = useTheme();
  const hasCode = sides.some((s) => Boolean(s.code));
  const resolvedPill = pill ?? (hasCode ? 'BEFORE VS AFTER · CODE' : 'COMPARISON');

  return (
    <SceneFrame label={label} title={title} pill={resolvedPill} pillTone="neutral">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, direction: 'rtl' }}>
        {sides.map((side, sideIndex) => {
          const lowerTitle = side.title.toLowerCase();
          const inferredTone =
            side.tone ??
            (side.errorLine ||
            lowerTitle.includes('array') ||
            lowerTitle.includes('before') ||
            lowerTitle.includes('error') ||
            lowerTitle.includes('قبل') ||
            lowerTitle.includes('خطأ')
              ? 'bad'
              : lowerTitle.includes('map') ||
                  lowerTitle.includes('after') ||
                  lowerTitle.includes('fix') ||
                  lowerTitle.includes('بعد') ||
                  lowerTitle.includes('الحل')
                ? 'good'
                : hasCode
                  ? sideIndex === 0
                    ? 'bad'
                    : 'good'
                  : sideIndex === 0
                    ? 'good'
                    : 'ink');

          const isGood = inferredTone === 'good';
          const isBad = inferredTone === 'bad';
          const accent = isGood ? theme.good : isBad ? theme.bad : theme.ink;
          const tint = isGood ? theme.goodTint : isBad ? theme.badTint : theme.tint;
          const border = isGood ? theme.goodBorder : isBad ? theme.badBorder : theme.borderStrong;

          const badgeText =
            side.badge ??
            (lowerTitle.includes('map')
              ? 'O(1) · instant lookup'
              : lowerTitle.includes('array')
                ? 'O(n) · full scan'
                : hasCode
                  ? isBad
                    ? '✗ BEFORE'
                    : '✓ AFTER'
                  : undefined);

          const progressWidth =
            side.progress !== undefined
              ? `${side.progress}%`
              : lowerTitle.includes('map')
                ? '16%'
                : lowerTitle.includes('array')
                  ? '92%'
                  : undefined;

          const items = side.items ?? [];

          return (
            <Enter key={sideIndex} delay={sideIndex * MOTION.stagger}>
              <Box
                tone={isGood ? 'good' : isBad ? 'bad' : 'paper'}
                style={{
                  padding: hasCode ? '22px 28px' : '26px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: `1px solid ${theme.border}`,
                    paddingBottom: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        background: tint,
                        border: `1px solid ${border}`,
                        color: accent,
                        display: 'grid',
                        placeItems: 'center',
                        fontFamily: CODE_FONT,
                        fontSize: 20,
                        fontWeight: 700,
                      }}
                    >
                      {isBad ? '✗' : isGood ? '✓' : String(sideIndex + 1)}
                    </span>
                    <span style={{ fontSize: hasCode ? 34 : 38, fontWeight: 700, color: theme.text }}>
                      <BidiText>{side.title}</BidiText>
                    </span>
                  </div>
                  {badgeText && (
                    <span
                      style={{
                        padding: '6px 16px',
                        borderRadius: 999,
                        background: tint,
                        border: `1px solid ${border}`,
                        color: accent,
                        fontFamily: CODE_FONT,
                        fontSize: 19,
                        fontWeight: 600,
                        direction: 'ltr',
                      }}
                    >
                      {badgeText}
                    </span>
                  )}
                </div>

                {progressWidth && (
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: theme.border,
                      overflow: 'hidden',
                      direction: 'ltr',
                    }}
                  >
                    <div
                      style={{
                        width: progressWidth,
                        height: '100%',
                        background: accent,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                )}

                {side.code && (
                  <div
                    style={{
                      direction: 'ltr',
                      textAlign: 'left',
                      borderRadius: 12,
                      background: theme.code.chrome.editor,
                      border: `1px solid ${border}`,
                      overflow: 'hidden',
                      fontFamily: CODE_FONT,
                    }}
                  >
                    <Highlight theme={theme.code.prism} code={side.code.trim()} language={side.language ?? 'tsx'}>
                      {({ tokens, getTokenProps, style: highlightStyle }) => (
                        <pre
                          style={{
                            ...highlightStyle,
                            color: theme.code.chrome.text,
                            margin: 0,
                            padding: '16px 18px',
                            fontFamily: CODE_FONT,
                            fontSize: 23,
                            lineHeight: 1.6,
                            fontWeight: 500,
                          }}
                        >
                          {tokens.map((line, lineIdx) => (
                            <div key={lineIdx} style={{ display: 'flex' }}>
                              <span
                                style={{
                                  width: 34,
                                  paddingRight: 12,
                                  textAlign: 'right',
                                  color: theme.code.chrome.lineNumber,
                                  fontSize: 19,
                                  flexShrink: 0,
                                  userSelect: 'none',
                                }}
                              >
                                {lineIdx + 1}
                              </span>
                              <span style={{ whiteSpace: 'pre-wrap', color: theme.code.chrome.text }}>
                                {line.map((token, k) => {
                                  const props = getTokenProps({ token });
                                  return (
                                    <span
                                      key={k}
                                      className={props.className}
                                      style={{
                                        color: theme.code.chrome.text,
                                        ...props.style,
                                      }}
                                    >
                                      {token.content.replace(/\n/g, '')}
                                    </span>
                                  );
                                })}
                              </span>
                            </div>
                          ))}
                        </pre>
                      )}
                    </Highlight>

                    {side.errorLine && (
                      <div
                        style={{
                          padding: '10px 18px',
                          background: theme.badTint,
                          borderTop: `1px solid ${theme.badBorder}`,
                          color: theme.bad,
                          fontSize: 19,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <span>⚠</span>
                        <span>{side.errorLine}</span>
                      </div>
                    )}
                  </div>
                )}

                {items.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      fontSize: hasCode ? 28 : 32,
                      lineHeight: 1.45,
                      color: theme.text,
                    }}
                  >
                    {items.map((item, i) => (
                      <Enter key={i} delay={(sideIndex + 1) * MOTION.stagger + (i + 1) * MOTION.stagger}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ color: accent, fontFamily: CODE_FONT, fontSize: 22 }}>•</span>
                          <BidiText>{item}</BidiText>
                        </div>
                      </Enter>
                    ))}
                  </div>
                )}
              </Box>
            </Enter>
          );
        })}
      </div>
    </SceneFrame>
  );
};



