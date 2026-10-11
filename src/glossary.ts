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

