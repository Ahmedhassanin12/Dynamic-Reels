import type { PrismTheme } from 'prism-react-renderer';
import type { CodeChrome, CodeSyntax, Theme, ThemeName } from './types';

export const makePrismTheme = (chrome: CodeChrome, syntax: CodeSyntax): PrismTheme => ({
  plain: { color: chrome.text, backgroundColor: 'transparent' },
  styles: [
    { types: ['comment'], style: { color: syntax.comment, fontStyle: 'italic' } },
    { types: ['keyword', 'tag', 'operator', 'boolean'], style: { color: syntax.keyword } },
    { types: ['function', 'method'], style: { color: syntax.function } },
    { types: ['string', 'char', 'attr-value'], style: { color: syntax.string } },
    { types: ['number'], style: { color: syntax.number } },
    { types: ['builtin', 'class-name', 'maybe-class-name'], style: { color: syntax.builtin } },
    { types: ['property', 'parameter', 'variable', 'constant'], style: { color: syntax.variable } },
    { types: ['punctuation'], style: { color: syntax.operator } },
  ],
});

export const SHARED_UI = {
  bg: '#060608',
  bgGlow:
    'radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.035) 0%, rgba(34, 197, 94, 0.02) 40%, transparent 72%)',
  paper: '#0d0e11',
  paperElevated: '#131419',
  text: '#f4f4f5',
  muted: '#8e929f',
  dim: '#525560',
  border: 'rgba(255, 255, 255, 0.09)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  good: '#22c55e',
  onGood: '#05140b',
  goodTint: 'rgba(34, 197, 94, 0.11)',
  goodBorder: 'rgba(34, 197, 94, 0.38)',
  goodShadow: '0 0 50px rgba(34, 197, 94, 0.08)',
  bad: '#ef4444',
  onBad: '#190505',
  badTint: 'rgba(239, 68, 68, 0.11)',
  badBorder: 'rgba(239, 68, 68, 0.35)',
  badShadow: '0 0 50px rgba(239, 68, 68, 0.07)',
  warn: '#fb923c',
  onWarn: '#1a0a03',
  warnTint: 'rgba(251, 146, 60, 0.11)',
  warnBorder: 'rgba(251, 146, 60, 0.35)',
  warnShadow: '0 0 50px rgba(251, 146, 60, 0.07)',
  grid: 'transparent',
  shadow: '0 32px 80px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
  shadowSm: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
} as const;

export const SHARED_CHROME: CodeChrome = {
  editor: '#0b0c0e',
  titleBar: '#121317',
  tabBar: '#121317',
  border: 'rgba(255, 255, 255, 0.09)',
  lineNumber: '#525663',
  currentLine: 'rgba(255, 255, 255, 0.04)',
  text: '#e4e4e7',
};

export const SHARED_SYNTAX: CodeSyntax = {
  keyword: '#f87171',
  builtin: '#f59e0b',
  function: '#fbbf24',
  string: '#4ade80',
  number: '#fb923c',
  variable: '#fde68a',
  comment: '#52525b',
  operator: '#71717a',
};

export const SHARED_CODE = {
  dots: ['#ff5f57', '#febc2e', '#28c840'] as const,
  chrome: SHARED_CHROME,
  syntax: SHARED_SYNTAX,
  prism: makePrismTheme(SHARED_CHROME, SHARED_SYNTAX),
};

/** `ink` is the brand accent, `onInk` is the text color used on top of it. Each episode can pick its own theme. */
export const THEMES = {
  amber: { ...SHARED_UI, ink: '#f59e0b', onInk: '#060608', tint: 'rgba(245, 158, 11, 0.12)', code: SHARED_CODE },
  mint: { ...SHARED_UI, ink: '#22c55e', onInk: '#04140d', tint: 'rgba(34, 197, 94, 0.12)', code: SHARED_CODE },
  rose: { ...SHARED_UI, ink: '#f43f5e', onInk: '#1a0509', tint: 'rgba(244, 63, 94, 0.12)', code: SHARED_CODE },
} as const satisfies Record<ThemeName, Theme>;

export const DEFAULT_THEME: ThemeName = 'amber';
