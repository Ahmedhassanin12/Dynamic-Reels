import { Highlight } from 'prism-react-renderer';
import { interpolate, useCurrentFrame } from 'remotion';
import { CODE_SNAP, CODE_THEME, THEME } from '../config';
import { typingFrames } from '../lib/code';
import { CODE_FONT } from '../lib/fonts';

type Props = {
  code: string;
  language?: string;
  filename?: string;
  /** 1-based line numbers to focus on once typing finishes */
  highlightLines?: number[];
};

const BADGES: Record<string, string> = { typescript: 'TS', tsx: 'TSX', javascript: 'JS', jsx: 'JSX', python: 'PY', json: '{}', css: 'CSS', bash: '$' };
const { chrome } = CODE_SNAP;

export const CodeSnap = ({ code, language = 'tsx', filename = 'snippet', highlightLines = [] }: Props) => {
  const frame = useCurrentFrame();

  const typingEnd = typingFrames(code);
  const shown = code.slice(0, Math.floor(frame * CODE_SNAP.charsPerFrame));
  const cursorOn = Math.floor(frame / 15) % 2 === 0 && frame < typingEnd + 45;
  const focus = highlightLines.length
    ? interpolate(frame, [typingEnd, typingEnd + CODE_SNAP.focusFadeFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <div
      style={{
        direction: 'ltr',
        textAlign: 'left',
        overflow: 'hidden',
        borderRadius: 18,
        background: chrome.editor,
        border: `1px solid ${chrome.border}`,
        boxShadow: THEME.shadow,
        fontFamily: CODE_FONT,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', background: chrome.titleBar }}>
        {CODE_SNAP.dots.map((color) => (
          <span key={color} style={{ width: 20, height: 20, borderRadius: '50%', background: color }} />
        ))}
        <span style={{ flex: 1, textAlign: 'center', marginRight: 70, color: chrome.lineNumber, fontSize: 24 }}>{filename}</span>
      </div>

      <div style={{ display: 'flex', background: chrome.tabBar }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 28px',
            background: chrome.editor,
            borderTop: `3px solid ${THEME.ink}`,
            color: chrome.text,
            fontSize: 26,
          }}
        >
          <span style={{ background: THEME.ink, color: THEME.onInk, borderRadius: 6, padding: '0 8px', fontSize: 20, fontWeight: 500 }}>
            {BADGES[language] ?? language.slice(0, 2).toUpperCase()}
          </span>
          {filename}
          <span style={{ color: chrome.lineNumber, marginLeft: 8 }}>×</span>
        </div>
      </div>

      <Highlight theme={CODE_THEME} code={shown} language={language}>
        {({ tokens, getTokenProps }) => (
          <pre style={{ margin: 0, padding: '22px 0 30px', fontFamily: CODE_FONT, fontSize: CODE_SNAP.fontSize, lineHeight: 1.65 }}>
            {tokens.map((line, i) => {
              const isFocused = highlightLines.includes(i + 1);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    opacity: isFocused ? 1 : 1 - focus * CODE_SNAP.dimAmount,
                    background: isFocused ? `rgba(255, 255, 255, ${focus * 0.07})` : undefined,
                    borderLeft: `5px solid ${isFocused && focus > 0 ? THEME.ink : 'transparent'}`,
                  }}
                >
                  <span style={{ width: 80, paddingRight: 28, textAlign: 'right', color: isFocused && focus > 0 ? chrome.text : chrome.lineNumber, flexShrink: 0 }}>
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
                      <span style={{ display: 'inline-block', width: 3, height: '1.1em', marginLeft: 2, background: chrome.text, verticalAlign: 'text-bottom' }} />
                    )}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
};
