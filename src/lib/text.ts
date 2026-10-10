/** Loose comparison key: no diacritics/tatweel/punctuation, unified alef forms, lowercase. */
export const normalizeText = (s: string) =>
  s
    .replace(/[\u064B-\u065F\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase();
