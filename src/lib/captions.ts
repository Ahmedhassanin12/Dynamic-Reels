import type { Word } from '../types';

export type Chunk = { words: Word[]; start: number; end: number };

export const groupWords = (words: Word[], size: number): Chunk[] =>
  Array.from({ length: Math.ceil(words.length / size) }, (_, i) => {
    const slice = words.slice(i * size, i * size + size);
    return { words: slice, start: slice[0].start, end: slice[slice.length - 1].end };
  });

export const findActiveChunk = (chunks: Chunk[], t: number, hold: number) => {
  const current = [...chunks].reverse().find((c) => c.start <= t);
  return current && t <= current.end + hold ? current : undefined;
};
