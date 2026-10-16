import { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CAPTION, THEME } from '../config';
import { ARABIC_FONT } from '../lib/fonts';
import { findActiveChunk, groupWords } from '../lib/captions';
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

export const Captions = ({ words }: { words: Word[] }) => {
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
        right: 50,
        bottom: 200,
        maxWidth: CAPTION.maxWidth,
        padding: '26px 30px',
        background: THEME.paper,
        border: `2px solid ${THEME.border}`,
        borderRadius: 28,
        boxShadow: THEME.shadow,
        direction: 'rtl',
        unicodeBidi: 'isolate',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        fontFamily: ARABIC_FONT,
        fontWeight: 800,
        fontSize: CAPTION.fontSize,
        lineHeight: 1.5,
        color: THEME.text,
        opacity: interpolate(pop, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' }),
        transform: `scale(${0.9 + 0.1 * pop})`,
        transformOrigin: 'bottom right',
      }}
    >
      {wordGroups.map((group, gi) => {
        if (group.isLatin) {
          return (
            <div key={gi} dir="ltr" style={{ display: 'flex', gap: 8, unicodeBidi: 'isolate' }}>
              {group.items.map(({ word: w, index: i }) => {
                const isActive = i === activeIndex;
                return (
                  <span
                    key={`${w.start}-${w.text}`}
                    style={{
                      padding: '0 14px',
                      borderRadius: 12,
                      background: isActive ? THEME.ink : 'transparent',
                      color: isActive ? THEME.onInk : THEME.text,
                    }}
                  >
                    {w.text}
                  </span>
                );
              })}
            </div>
          );
        }

        return group.items.map(({ word: w, index: i }) => {
          const isActive = i === activeIndex;
          return (
            <span
              key={`${w.start}-${w.text}`}
              dir="rtl"
              style={{
                padding: '0 14px',
                borderRadius: 12,
                unicodeBidi: 'isolate',
                background: isActive ? THEME.ink : 'transparent',
                color: isActive ? THEME.onInk : THEME.text,
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
