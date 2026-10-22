import GLOSSARY_DATA from './glossary.json';
import { normalizeText } from './lib/text';
import type { Word } from './types';

export type GlossaryEntry = {
  /** what Whisper writes (one or more consecutive words); Latin or Arabic spelling */
  say: string[];
  /** what shows in the captions */
  show: string;
};

/**
 * Glossary of spoken terms to captions replacements.
 * Stored in glossary.json so scripts/transcribe.py can also use them to seed Whisper's prompt.
 */
export const GLOSSARY: GlossaryEntry[] = GLOSSARY_DATA;

/**
 * Validates glossary integrity: checks for empty tokens, duplicate patterns, and conflicting mappings.
 */
export function validateGlossary(entries: GlossaryEntry[] = GLOSSARY): string[] {
  const errors: string[] = [];
  const seenPatterns = new Map<string, string>();

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.show || !entry.show.trim()) {
      errors.push(`Glossary entry ${i}: "show" must not be empty.`);
    }
    if (!Array.isArray(entry.say) || entry.say.length === 0 || entry.say.some((s) => !s || !s.trim())) {
      errors.push(`Glossary entry ${i} ("${entry.show}"): "say" must contain at least one non-empty string.`);
      continue;
    }

    const key = entry.say.map((s) => s.trim().toLowerCase()).join(' ');
    const existing = seenPatterns.get(key);
    if (existing !== undefined) {
      if (existing !== entry.show) {
        errors.push(
          `Glossary conflict for pattern [${entry.say.join(', ')}]: mapped to both "${existing}" and "${entry.show}".`,
        );
      }
    } else {
      seenPatterns.set(key, entry.show);
    }
  }

  return errors;
}

/**
 * Applies glossary transformations to word-level transcripts with longest-match priority.
 */
export function applyGlossary(words: Word[], entries: GlossaryEntry[] = GLOSSARY): Word[] {
  // Prevent accidental double-application on already-normalized words when using default glossary
  if (entries === GLOSSARY && words.length > 0 && Boolean((words as unknown as { _glossaryApplied?: boolean })._glossaryApplied)) {
    return words;
  }

  const byLength = [...entries].sort((a, b) => b.say.length - a.say.length);
  const out: Word[] = [];

  for (let i = 0; i < words.length; ) {
    const hit = byLength.find(
      (entry) =>
        entry.say.length > 0 &&
        entry.say.every((token, k) => words[i + k] && normalizeText(words[i + k].text) === normalizeText(token)),
    );
    if (hit) {
      const endIdx = i + hit.say.length - 1;
      out.push({
        text: hit.show,
        start: words[i].start,
        end: words[endIdx].end,
        rawStart: words[i].rawStart ?? i,
        rawEnd: words[endIdx].rawEnd ?? endIdx,
        rawText: words
          .slice(i, endIdx + 1)
          .map((w) => w.rawText ?? w.text)
          .join(' '),
        correctedText: words
          .slice(i, endIdx + 1)
          .map((w) => w.correctedText ?? w.text)
          .join(' '),
      });
      i += hit.say.length;
    } else {
      out.push({
        ...words[i],
        rawStart: words[i].rawStart ?? i,
        rawEnd: words[i].rawEnd ?? i,
        rawText: words[i].rawText ?? words[i].text,
        correctedText: words[i].correctedText ?? words[i].text,
      });
      i += 1;
    }
  }

  if (entries === GLOSSARY) {
    (out as unknown as { _glossaryApplied?: boolean })._glossaryApplied = true;
  }
  return out;
}


