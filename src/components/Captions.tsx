import { useMemo, type ReactNode } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CAPTION } from '../config';
import { findActiveChunk, groupWords } from '../lib/captions';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type { Word } from '../types';

type WordGroup = { isLatin: boolean; items: { word: Word; index: number }[] };

const groupWordsByDirection = (words: Word[]): WordGroup[] => {
  const groups: WordGroup[] = [];

  words.forEach((word, index) => {
    const isLatin = /[a-zA-Z0-9]/.test(word.text);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.isLatin === isLatin) {
      lastGroup.items.push({ word, index });
    } else {
      groups.push({ isLatin, items: [{ word, index }] });
    }
  });

  return groups;
};

const SelectionBox = ({
  children,
  color,
  tint,
  textColor,
}: {
  children: ReactNode;
  color: string;
  tint: string;
  textColor: string;
}) => {
  const size = CAPTION.handleSize;
  const offset = -(size / 2) - 1;
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        padding: '2px 18px',
        background: tint,
        color: textColor,
        margin: '0 6px',
      }}
    >
      {/* <span
        style={{
          position: 'absolute',
          top: offset,
          left: offset,
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          // border: `2px solid ${textColor}`,
        }}
      />
      <span
        style={{
          position: 'absolute',
          bottom: offset,
          right: offset,
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          // border: `2px solid ${textColor}`,
        }}
      /> */}
      {children}
    </span>
  );
};

export const Captions = ({ words }: { words: Word[] }) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const chunks = useMemo(() => groupWords(words, CAPTION.wordsPerChunk, CAPTION.maxGapSeconds), [words]);
  const active = findActiveChunk(chunks, t, CAPTION.holdSeconds);

  if (!active) return null;

  const pop = spring({ frame: frame - Math.round(active.start * fps), fps, config: CAPTION.spring });
  const activeIndex = active.words.reduce((acc, w, i) => (w.start <= t ? i : acc), -1);
  const wordGroups = groupWordsByDirection(active.words);

  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        right: CAPTION.right,
        bottom: CAPTION.bottom,
        maxWidth: CAPTION.maxWidth,
        padding: '8px 12px',
        direction: 'rtl',
        unicodeBidi: 'isolate',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px 14px',
        fontFamily: ARABIC_FONT,
        fontWeight: 700,
        fontSize: CAPTION.fontSize,
        lineHeight: 1.4,
        color: theme.text,
        opacity: interpolate(pop, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' }),
        transform: `translateY(${(1 - pop) * 12}px)`,
      }}
    >
      {wordGroups.map((group, gi) => {
        if (group.isLatin) {
          return (
            <div key={gi} dir="ltr" style={{ display: 'flex', alignItems: 'center', gap: 12, unicodeBidi: 'isolate', fontFamily: CODE_FONT }}>
              {group.items.map(({ word: w, index: i }) => {
                const isActive = i === activeIndex;
                if (isActive) {
                  return (
                    <SelectionBox key={`${w.start}-${w.text}`} color={theme.ink} tint={theme.tint} textColor={theme.text}>
                      {w.text}
                    </SelectionBox>
                  );
                }
                return (
                  <span key={`${w.start}-${w.text}`} style={{ color: theme.muted }}>
                    {w.text}
                  </span>
                );
              })}
            </div>
          );
        }

        return group.items.map(({ word: w, index: i }) => {
          const isActive = i === activeIndex;
          if (isActive) {
            return (
              <SelectionBox key={`${w.start}-${w.text}`} color={theme.ink} tint={theme.tint} textColor={theme.text}>
                <span dir="rtl" style={{ unicodeBidi: 'isolate' }}>
                  {w.text}
                </span>
              </SelectionBox>
            );
          }
          return (
            <span
              key={`${w.start}-${w.text}`}
              dir="rtl"
              style={{
                unicodeBidi: 'isolate',
                color: theme.muted,
              }}
            >
              {w.text}
            </span>
          );
        });
      })}
    </div>
  );
};
