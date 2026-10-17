import { useCurrentFrame } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { CodeSnap } from '../components/CodeSnap';
import { Enter } from '../components/Enter';
import { MOTION } from '../config';
import { CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const QaScene = ({
  label,
  title,
  pill,
  question,
  answer,
  code,
  language,
  filename,
  options,
  correctIndex,
  revealDelayFrames,
}: SceneOf<'qa'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const hasOptions = Boolean(options && options.length > 0);
  const resolvedPill = pill ?? (hasOptions ? 'PREDICTION QUIZ' : 'Q & A');

  const optionsStaggerEnd = hasOptions ? (options!.length + 1) * MOTION.stagger : 0;
  const revealAt = revealDelayFrames ?? optionsStaggerEnd + MOTION.answerDelayFrames;
  const isRevealed = frame >= revealAt;

  return (
    <SceneFrame label={label} title={title} pill={resolvedPill} pillTone={isRevealed && hasOptions ? 'good' : 'neutral'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, direction: 'rtl' }}>
        <Enter>
          <Box
            style={{
              padding: code || hasOptions ? '22px 28px' : undefined,
              fontSize: code || hasOptions ? 34 : 38,
              lineHeight: 1.45,
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <BidiText>{question}</BidiText>
            {hasOptions && (
              <span
                style={{
                  direction: 'ltr',
                  padding: '5px 14px',
                  borderRadius: 999,
                  background: isRevealed ? theme.goodTint : theme.warnTint,
                  border: `1px solid ${isRevealed ? theme.goodBorder : theme.warnBorder}`,
                  color: isRevealed ? theme.good : theme.warn,
                  fontFamily: CODE_FONT,
                  fontSize: 16,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {isRevealed ? '✓ REVEALED' : '? THINK'}
              </span>
            )}
          </Box>
        </Enter>

        {code && (
          <Enter delay={MOTION.stagger}>
            <CodeSnap code={code} language={language} filename={filename} skipTyping />
          </Enter>
        )}

        {hasOptions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {options!.map((opt, idx) => {
              const isCorrect = isRevealed && correctIndex === idx;
              const isDimmed = isRevealed && correctIndex !== undefined && correctIndex !== idx;
              const letter = OPTION_LETTERS[idx] ?? String(idx + 1);
              const isPureLtr = !/[\u0600-\u06FF]/.test(opt);

              return (
                <Enter key={idx} delay={(idx + 1) * MOTION.stagger}>
                  <div
                    style={{
                      padding: '16px 24px',
                      borderRadius: 16,
                      border: `1px solid ${isCorrect ? theme.goodBorder : theme.borderStrong}`,
                      background: isCorrect ? theme.goodTint : theme.paper,
                      opacity: isDimmed ? 0.42 : 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 18,
                      boxShadow: isCorrect ? theme.shadowSm : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: isCorrect ? theme.paper : theme.tint,
                          border: `1px solid ${isCorrect ? theme.goodBorder : theme.borderStrong}`,
                          color: isCorrect ? theme.good : theme.ink,
                          display: 'grid',
                          placeItems: 'center',
                          fontFamily: CODE_FONT,
                          fontSize: 20,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {isCorrect ? '✓' : letter}
                      </span>
                      <span
                        dir={isPureLtr ? 'ltr' : undefined}
                        style={{
                          fontFamily: isPureLtr ? CODE_FONT : undefined,
                          fontSize: 28,
                          fontWeight: isCorrect ? 700 : 500,
                          color: isCorrect ? theme.good : theme.text,
                        }}
                      >
                        {isPureLtr ? opt : <BidiText>{opt}</BidiText>}
                      </span>
                    </div>

                    {isCorrect && (
                      <span
                        style={{
                          direction: 'ltr',
                          padding: '4px 14px',
                          borderRadius: 999,
                          background: theme.paper,
                          border: `1px solid ${theme.goodBorder}`,
                          color: theme.good,
                          fontFamily: CODE_FONT,
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        CORRECT
                      </span>
                    )}
                  </div>
                </Enter>
              );
            })}
          </div>
        )}

        <Enter delay={revealAt}>
          <Box
            tone={hasOptions ? 'good' : 'ink'}
            style={{
              padding: hasOptions ? '20px 28px' : undefined,
              fontSize: hasOptions ? 32 : 38,
              lineHeight: 1.45,
            }}
          >
            <BidiText>{answer}</BidiText>
          </Box>
        </Enter>
      </div>
    </SceneFrame>
  );
};


