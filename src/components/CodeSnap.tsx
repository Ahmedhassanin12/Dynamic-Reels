import { Highlight } from 'prism-react-renderer';
import { interpolate, useCurrentFrame } from 'remotion';
import { CODE_SNAP } from '../config';
import { typingFrames } from '../lib/code';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';

type Props = {
  code: string;
  language?: string;
  filename?: string;
  /** 1-based line numbers to focus on once typing finishes */
  highlightLines?: number[];
  /** Optional floating corner badge (e.g. "O(n) · slow") */
  tagText?: string;
  tagTone?: 'good' | 'bad' | 'neutral';
};

export const CodeSnap = ({
  code,
  language = 'tsx',
  filename = 'snippet.ts',
  highlightLines = [],
  tagText,
  tagTone = 'neutral',
}: Props) => {
  const theme = useTheme();
  const { chrome, dots, prism } = theme.code;
  const frame = useCurrentFrame();

  const lines = code.split('\n');
  const maxLineLength = Math.max(...lines.map((l) => l.length), 0);
  const fontSize = maxLineLength > 42 || lines.length > 7 ? CODE_SNAP.compactFontSize : CODE_SNAP.fontSize;

  const typingEnd = typingFrames(code);
  const shown = code.slice(0, Math.floor(frame * CODE_SNAP.charsPerFrame));
  const cursorOn = Math.floor(frame / 15) % 2 === 0 && frame < typingEnd + 45;
  const focus = highlightLines.length
    ? interpolate(frame, [typingEnd, typingEnd + CODE_SNAP.focusFadeFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const tagColor = tagTone === 'good' ? theme.good : tagTone === 'bad' ? theme.bad : theme.ink;
  const tagBorder = tagTone === 'good' ? theme.goodBorder : tagTone === 'bad' ? theme.badBorder : theme.border;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {tagText && (
        <div
          style={{
            position: 'absolute',
            top: -16,
            right: 18,
            zIndex: 5,
            background: chrome.titleBar,
            border: `1px solid ${tagBorder}`,
            borderRadius: 8,
            padding: '4px 14px',
            fontFamily: CODE_FONT,
            fontSize: 17,
            fontWeight: 600,
            color: tagColor,
            boxShadow: theme.shadowSm,
          }}
        >
          {tagText}
        </div>
      )}

      <div
        style={{
          direction: 'ltr',
          textAlign: 'left',
          overflow: 'hidden',
          borderRadius: 16,
          background: chrome.editor,
          border: `1px solid ${chrome.border}`,
          boxShadow: theme.shadow,
          fontFamily: CODE_FONT,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            background: chrome.titleBar,
            borderBottom: `1px solid ${chrome.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {dots.map((color) => (
              <span
                key={color}
                style={{ width: CODE_SNAP.dotSize, height: CODE_SNAP.dotSize, borderRadius: '50%', background: color }}
              />
            ))}
          </div>

          <span style={{ color: theme.muted, fontSize: 18, fontWeight: 500 }}>
            ts — ~/src/{filename}
          </span>

          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: tagColor,
              opacity: 0.85,
            }}
          />
        </div>

        <Highlight theme={prism} code={shown} language={language}>
          {({ tokens, getTokenProps }) => (
            <pre
              style={{
                margin: 0,
                padding: '22px 0 26px',
                fontFamily: CODE_FONT,
                fontSize,
                lineHeight: 1.7,
                fontWeight: 500,
              }}
            >
              {tokens.map((line, i) => {
                const isFocused = highlightLines.includes(i + 1);
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      padding: '2px 0',
                      opacity: isFocused ? 1 : 1 - focus * CODE_SNAP.dimAmount,
                      background: isFocused && focus > 0 ? chrome.currentLine : undefined,
                      borderLeft: `3px solid ${isFocused && focus > 0 ? theme.ink : 'transparent'}`,
                    }}
                  >
                    <span
                      style={{
                        width: 52,
                        paddingRight: 18,
                        textAlign: 'right',
                        color: isFocused && focus > 0 ? chrome.text : chrome.lineNumber,
                        flexShrink: 0,
                        fontSize: fontSize - 4,
                        userSelect: 'none',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ whiteSpace: 'pre' }}>
                      {line.map((token, k) => {
                        const props = getTokenProps({ token });
                        return (
                          <span key={k} className={props.className} style={props.style}>
                            {token.content.replace(/\n/g, '')}
                          </span>
                        );
                      })}
                      {i === tokens.length - 1 && cursorOn && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: 2,
                            height: '1.1em',
                            marginLeft: 2,
                            background: theme.ink,
                            verticalAlign: 'text-bottom',
                          }}
                        />
                      )}
                    </span>
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
};
