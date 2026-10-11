import type { Word } from '../types';

export type Chunk = { words: Word[]; start: number; end: number };

const SENTENCE_PUNCTUATION = /[.?!؟]$/;

export const groupWords = (
  words: Word[],
  size: number,
  maxGapSeconds: number = 0.35,
): Chunk[] => {
  if (!words.length) return [];
  const chunks: Chunk[] = [];
  let current: Word[] = [];

  for (const word of words) {
    const prev = current.at(-1);
    const hasGap = prev !== undefined && word.start - prev.end > maxGapSeconds;
    const hasPunctuation = prev !== undefined && SENTENCE_PUNCTUATION.test(prev.text.trim());

    if (current.length >= size || hasGap || hasPunctuation) {
      if (current.length > 0) {
        chunks.push({
          words: current,
          start: current[0].start,
          end: current[current.length - 1].end,
        });
        current = [];
      }
    }
    current.push(word);
  }

  if (current.length > 0) {
    chunks.push({
      words: current,
      start: current[0].start,
      end: current[current.length - 1].end,
    });
  }

  return chunks;
};

export const findActiveChunk = (chunks: Chunk[], t: number, hold: number) => {
  const current = [...chunks].reverse().find((c) => c.start <= t);
  return current && t <= current.end + hold ? current : undefined;
};
