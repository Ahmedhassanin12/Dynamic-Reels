/** Loose comparison key: no diacritics/tatweel/punctuation, unified alef/yaa/taa-marbuta forms, lowercase. */
export const normalizeText = (s: string) =>
  s
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىی]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase();

/** Splits a string on whitespace and returns non-empty normalized tokens. */
export const tokenizeNormalized = (s: string): string[] =>
  s
    .trim()
    .split(/\s+/)
    .map(normalizeText)
    .filter(Boolean);

