import GLOSSARY_DATA from './glossary.json';

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

