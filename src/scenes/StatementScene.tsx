import { AbsoluteFill } from 'remotion';
import { BidiText } from '../components/BidiText';
import { CodeSnap } from '../components/CodeSnap';
import { Enter } from '../components/Enter';
import { STAGE } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';

const VARIANT_LABELS = {
  hook: 'QUESTION HOOK',
  prediction: 'PREDICTION',
  takeaway: 'KEY TAKEAWAY',
} as const;

/**
 * Parses inline `[code]` pills and `**accent**` highlights while preserving BiDi isolation.
 */
const RichStatement = ({ text }: { text: string }) => {
  const theme = useTheme();
  const tokens = text.split(/(\[[^\]]+\]|\*\*[^*]+\*\*)/g);

  return (
    <bdi dir="rtl" style={{ unicodeBidi: 'isolate' }}>
      {tokens.map((tok, i) => {
        if (!tok) return null;
        if (tok.startsWith('[') && tok.endsWith(']')) {
          const codeText = tok.slice(1, -1);
          return (
            <bdi
              key={i}
              dir="ltr"
              style={{
                display: 'inline-block',
                fontFamily: CODE_FONT,
                fontSize: '0.78em',
                fontWeight: 600,
                padding: '2px 18px',
                margin: '0 6px',
                borderRadius: 12,
                background: theme.paperElevated,
                border: `1px solid ${theme.ink}`,
                color: theme.ink,
                boxShadow: theme.shadowSm,
                verticalAlign: 'middle',
              }}
            >
              {codeText}
            </bdi>
          );
        }
        if (tok.startsWith('**') && tok.endsWith('**')) {
          const accentText = tok.slice(2, -2);
          return (
            <span key={i} style={{ color: theme.ink }}>
              <BidiText>{accentText}</BidiText>
            </span>
          );
        }
        return <BidiText key={i}>{tok}</BidiText>;
      })}
    </bdi>
  );
};

const isMainlyLatin = (str: string) => {
  const letters = str.replace(/[^a-zA-Z\u0600-\u06FF]/g, '');
  const latinCount = (letters.match(/[a-zA-Z]/g) || []).length;
  return letters.length > 0 && latinCount / letters.length > 0.65;
};

export const StatementScene = ({ label, text, variant, codePreview }: SceneOf<'statement'>) => {
  const theme = useTheme();

  // Split into distinct blocks if separated by double newline or mixed scripts
  const rawParagraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  let arabicText = text;
  let englishCallout: string | undefined;

  if (rawParagraphs.length >= 2) {
    const latinIdx = rawParagraphs.findIndex((p) => isMainlyLatin(p));
    if (latinIdx !== -1) {
      englishCallout = rawParagraphs[latinIdx];
      arabicText = rawParagraphs.filter((_, idx) => idx !== latinIdx).join('\n\n');
    }
  } else if (text.includes('\n')) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const latinLine = lines.find((l) => isMainlyLatin(l));
    if (latinLine) {
      englishCallout = latinLine;
      arabicText = lines.filter((l) => l !== latinLine).join('\n');
    }
  }

  const cleanLength = arabicText.replace(/[\[\]*]/g, '').length;
  const hasPreview = Boolean(codePreview);
  const fontSize = hasPreview
    ? cleanLength > 55
      ? 48
      : 56
    : cleanLength > 70
      ? 52
      : cleanLength > 45
        ? 60
        : 70;
  const badgeText = label ?? (variant ? VARIANT_LABELS[variant] : undefined);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${STAGE.top}px ${STAGE.paddingX}px ${STAGE.reservedBottom}px`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: hasPreview ? 36 : 28, width: '100%' }}>
        <Enter>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 880 }}>
            {badgeText && (
              <div
                style={{
                  padding: '6px 18px',
                  borderRadius: 999,
                  border: `1px solid ${theme.borderStrong}`,
                  background: theme.tint,
                  color: theme.ink,
                  fontFamily: CODE_FONT,
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                }}
              >
                {badgeText}
              </div>
            )}
            <div
              dir="rtl"
              style={{
                fontFamily: ARABIC_FONT,
                fontWeight: 700,
                fontSize,
                lineHeight: 1.45,
                direction: 'rtl',
                textAlign: 'center',
                color: theme.text,
                whiteSpace: 'pre-line',
              }}
            >
              <RichStatement text={arabicText} />
            </div>

            {englishCallout && (
              <div
                dir="ltr"
                style={{
                  fontFamily: CODE_FONT,
                  fontSize: Math.max(24, Math.round(fontSize * 0.52)),
                  fontWeight: 600,
                  color: theme.ink,
                  letterSpacing: 0.5,
                  padding: '12px 28px',
                  borderRadius: 16,
                  background: theme.tint,
                  border: `1px solid ${theme.borderStrong}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: theme.shadowSm,
                  marginTop: 6,
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '1.15em' }}>💡</span>
                <span>{englishCallout}</span>
              </div>
            )}

            {!hasPreview && !englishCallout && (
              <div
                style={{
                  width: 72,
                  height: 3,
                  borderRadius: 999,
                  background: theme.ink,
                  opacity: 0.75,
                }}
              />
            )}
          </div>
        </Enter>

        {codePreview && (
          <Enter delay={10} style={{ width: '100%', maxWidth: 780 }}>
            <div style={{ transform: 'rotate(-1.5deg)', position: 'relative' }}>
              <CodeSnap
                code={codePreview.code}
                filename={codePreview.filename ?? 'hook.js'}
                language={codePreview.language ?? 'javascript'}
                skipTyping
                tagText={codePreview.badge ?? '0ms'}
                tagTone="neutral"
              />
            </div>
          </Enter>
        )}
      </div>
    </AbsoluteFill>
  );
};


