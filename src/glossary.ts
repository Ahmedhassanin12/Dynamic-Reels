export type GlossaryEntry = {
  /** what Whisper writes (one or more consecutive words); Latin or Arabic spelling */
  say: string[];
  /** what shows in the captions */
  show: string;
};

/** Add entries as you notice Whisper mis-spelling your English terms. Longest matches win. */
export const GLOSSARY = [
  // Big-O: you say "O of one" / "O of n"
  { say: ['o', 'of', 'one'], show: 'O(1)' },
  { say: ['او', 'اوف', 'وان'], show: 'O(1)' },
  { say: ['o', 'of', 'n'], show: 'O(n)' },
  { say: ['او', 'اوف', 'ان'], show: 'O(n)' },
  // Terms you say in English but Whisper may write in Arabic letters
  { say: ['كي'], show: 'key' },
  { say: ['فاليو'], show: 'value' },
  { say: ['هاش'], show: 'hash' },
  { say: ['ماب'], show: 'Map' },
  { say: ['اراي'], show: 'Array' },
  { say: ['ستاك'], show: 'Stack' },
  { say: ['كيو'], show: 'Queue' },
  { say: ['لوب'], show: 'loop' },
  { say: ['فانكشن'], show: 'function' },
  { say: ['يوزر'], show: 'user' },
] satisfies GlossaryEntry[];
