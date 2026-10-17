/** Loose comparison key: no diacritics/tatweel/punctuation, unified alef/yaa/taa-marbuta/hamza forms, normalized Arabic-Indic digits, lowercase. */
export const normalizeText = (s: string) =>
  s
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىی]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[\u0660-\u0669]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
    .replace(/[\u06F0-\u06F9]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 48))
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase();

/** Splits a string on whitespace and returns non-empty normalized tokens. */
export const tokenizeNormalized = (s: string): string[] =>
  s
    .trim()
    .split(/\s+/)
    .map(normalizeText)
    .filter(Boolean);

