import type { TranscriptCorrection, Word } from '../types';
import { normalizeText } from './text';

/**
 * Validates a list of transcript corrections against raw transcript words.
 * Detects out-of-range indices, duplicate indices, and transcript drift (mismatched original text).
 */
export function validateCorrections(
  rawWords: Word[],
  corrections: TranscriptCorrection[] = [],
): string[] {
  const errors: string[] = [];
  const seenIndices = new Set<number>();

  for (const c of corrections) {
    if (!Number.isInteger(c.index) || c.index < 0 || c.index >= rawWords.length) {
      errors.push(`Correction index ${c.index} is out of range (0-${rawWords.length - 1}).`);
      continue;
    }

    if (seenIndices.has(c.index)) {
      errors.push(`Duplicate correction for word index ${c.index}.`);
    }
    seenIndices.add(c.index);

    if (!c.corrected || !c.corrected.trim()) {
      errors.push(`Correction at word ${c.index}: corrected text must not be empty.`);
    }

    const rawWord = rawWords[c.index];
    const rawNorm = normalizeText(rawWord.rawText ?? rawWord.text);
    const origNorm = normalizeText(c.original);

    if (rawNorm !== origNorm) {
      errors.push(
        `Correction at word ${c.index} failed drift validation: expected original "${c.original}" (normalized "${origNorm}"), ` +
          `but found raw transcript word "${rawWord.text}" (normalized "${rawNorm}"). Transcript may have changed.`,
      );
    }
  }

  return errors;
}

/**
 * Applies approved transcript corrections to raw transcript words.
 *
 * Rules:
 * 1. Only corrections with `status: 'approved'` (or undefined) are applied.
 * 2. Words with `status: 'suggested'` remain unchanged until approved.
 * 3. Exact Whisper start/end audio timestamps are 100% preserved.
 * 4. Distinctly records `rawText`, `correctedText`, and `text`.
 */
export function applyCorrections(
  rawWords: Word[],
  corrections: TranscriptCorrection[] = [],
): Word[] {
  if (!corrections || corrections.length === 0) {
    return rawWords.map((w, i) => ({
      ...w,
      rawStart: w.rawStart ?? i,
      rawEnd: w.rawEnd ?? i,
      rawText: w.rawText ?? w.text,
      correctedText: w.text,
    }));
  }

  const errors = validateCorrections(rawWords, corrections);
  if (errors.length > 0) {
    throw new Error(`Failed to apply transcript corrections:\n- ${errors.join('\n- ')}`);
  }

  const approved = corrections.filter((c) => c.status === undefined || c.status === 'approved');
  const correctionMap = new Map<number, TranscriptCorrection>(approved.map((c) => [c.index, c]));

  return rawWords.map((word, i) => {
    const rawIdx = word.rawStart ?? i;
    const corr = correctionMap.get(rawIdx);

    if (!corr) {
      return {
        ...word,
        rawStart: rawIdx,
        rawEnd: word.rawEnd ?? rawIdx,
        rawText: word.rawText ?? word.text,
        correctedText: word.text,
      };
    }

    return {
      text: corr.corrected,
      start: word.start,
      end: word.end,
      rawStart: rawIdx,
      rawEnd: word.rawEnd ?? rawIdx,
      rawText: word.rawText ?? word.text,
      correctedText: corr.corrected,
    };
  });
}

/**
 * Common Arabic ASR phonetic misspellings and transliteration fixes for software engineering.
 */
const KNOWN_PHONETIC_FIXES: Array<{ pattern: RegExp; replacement: string; reason: string }> = [
  { pattern: /^المكرو$/i, replacement: 'الماكرو', reason: 'Correct Arabic vowel spelling for macro' },
  { pattern: /^بروموس$/i, replacement: 'بروميس', reason: 'Common Whisper mishearing for Promise' },
  { pattern: /^سيتتايم$/i, replacement: 'سيت تايم', reason: 'Split glued loanwords' },
];

/**
 * Generates heuristic correction suggestions without requiring external AI APIs.
 * Inspects raw words for known common ASR phonetic errors.
 */
export function suggestCorrectionsHeuristic(rawWords: Word[]): TranscriptCorrection[] {
  const suggestions: TranscriptCorrection[] = [];

  for (let i = 0; i < rawWords.length; i++) {
    const w = rawWords[i];
    for (const fix of KNOWN_PHONETIC_FIXES) {
      if (fix.pattern.test(w.text)) {
        suggestions.push({
          index: i,
          original: w.text,
          corrected: fix.replacement,
          status: 'suggested',
          reason: fix.reason,
        });
        break;
      }
    }
  }

  return suggestions;
}

export type CorrectionDiff = {
  index: number;
  raw: string;
  corrected: string;
  start: number;
  end: number;
  reason?: string;
};

/**
 * Computes a human-readable list of changes between raw transcript and corrected transcript.
 */
export function generateCorrectionDiff(
  rawWords: Word[],
  correctedWords: Word[],
  corrections: TranscriptCorrection[] = [],
): CorrectionDiff[] {
  const reasonMap = new Map<number, string | undefined>(corrections.map((c) => [c.index, c.reason]));
  const diffs: CorrectionDiff[] = [];

  for (let i = 0; i < Math.min(rawWords.length, correctedWords.length); i++) {
    const raw = rawWords[i];
    const corr = correctedWords[i];
    if (raw.text !== corr.text) {
      diffs.push({
        index: i,
        raw: raw.text,
        corrected: corr.text,
        start: raw.start,
        end: raw.end,
        reason: reasonMap.get(i),
      });
    }
  }

  return diffs;
}
