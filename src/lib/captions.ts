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

/** Formats seconds into standard SRT timestamp format: HH:MM:SS,mmm */
export const formatTimestampSrt = (seconds: number): string => {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
};

/** Formats seconds into standard WebVTT timestamp format: HH:MM:SS.mmm */
export const formatTimestampVtt = (seconds: number): string => {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
};

/** Generates a standard SubRip (.srt) subtitle track string from synchronized words. */
export const exportSrt = (
  words: Word[],
  size: number = 3,
  maxGapSeconds: number = 0.35,
): string => {
  const chunks = groupWords(words, size, maxGapSeconds);
  return chunks
    .map((chunk, index) => {
      const text = chunk.words.map((w) => w.text).join(' ');
      return `${index + 1}\n${formatTimestampSrt(chunk.start)} --> ${formatTimestampSrt(chunk.end)}\n${text}\n`;
    })
    .join('\n');
};

/** Generates a standard WebVTT (.vtt) subtitle track string from synchronized words. */
export const exportVtt = (
  words: Word[],
  size: number = 3,
  maxGapSeconds: number = 0.35,
): string => {
  const chunks = groupWords(words, size, maxGapSeconds);
  const body = chunks
    .map((chunk, index) => {
      const text = chunk.words.map((w) => w.text).join(' ');
      return `${index + 1}\n${formatTimestampVtt(chunk.start)} --> ${formatTimestampVtt(chunk.end)}\n${text}\n`;
    })
    .join('\n');
  return `WEBVTT\n\n${body}`;
};

