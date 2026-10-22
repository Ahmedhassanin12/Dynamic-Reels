import type { PrismTheme } from 'prism-react-renderer';

export const FPS = 30;
export const SIZE = { width: 1080, height: 1920 } as const;

export type CodeChrome = {
  editor: string;
  titleBar: string;
  tabBar: string;
  border: string;
  lineNumber: string;
  currentLine: string;
  text: string;
};

export type CodeSyntax = {
  keyword: string;
  builtin: string;
  function: string;
  string: string;
  number: string;
  variable: string;
  comment: string;
  operator: string;
};

export type Theme = {
  bg: string;
  bgGlow: string;
  paper: string;
  paperElevated: string;
  text: string;
  muted: string;
  dim: string;
  border: string;
  borderStrong: string;
  ink: string;
  onInk: string;
  tint: string;
  good: string;
  onGood: string;
  goodTint: string;
  goodBorder: string;
  goodShadow: string;
  bad: string;
  onBad: string;
  badTint: string;
  badBorder: string;
  badShadow: string;
  warn: string;
  onWarn: string;
  warnTint: string;
  warnBorder: string;
  warnShadow: string;
  grid: string;
  shadow: string;
  shadowSm: string;
  code: {
    dots: readonly [string, string, string];
    chrome: CodeChrome;
    syntax: CodeSyntax;
    prism: PrismTheme;
  };
};

const makePrismTheme = (chrome: CodeChrome, syntax: CodeSyntax): PrismTheme => ({
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

const SHARED_UI = {
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

const SHARED_CHROME: CodeChrome = {
  editor: '#0b0c0e',
  titleBar: '#121317',
  tabBar: '#121317',
  border: 'rgba(255, 255, 255, 0.09)',
  lineNumber: '#525663',
  currentLine: 'rgba(255, 255, 255, 0.04)',
  text: '#e4e4e7',
};

const SHARED_SYNTAX: CodeSyntax = {
  keyword: '#f87171',
  builtin: '#f59e0b',
  function: '#fbbf24',
  string: '#4ade80',
  number: '#fb923c',
  variable: '#fde68a',
  comment: '#52525b',
  operator: '#71717a',
};

const SHARED_CODE = {
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
} as const satisfies Record<string, Theme>;

export type ThemeName = keyof typeof THEMES;
export const DEFAULT_THEME: ThemeName = 'amber';

/** Stage = the top area for scenes; the bottom is reserved for character + captions. */
export const STAGE = { top: 170, paddingX: 84, reservedBottom: 580 } as const;

/** Unified typography scale across scenes, captions, and visualizers. */
export const TYPOGRAPHY = {
  hero: 72,
  title: 58,
  heading: 42,
  subheading: 34,
  body: 30,
  caption: 26,
  code: 28,
  codeCompact: 24,
  badge: 18,
  micro: 14,
} as const;

/** Unified spacing and layout geometry. */
export const SPACING = {
  xs: 8,
  sm: 14,
  md: 20,
  lg: 28,
  xl: 36,
  cardRadius: 16,
  cardRadiusLg: 22,
  pillRadius: 999,
  cardPadding: '24px 28px',
} as const;

export const TIMELINE = {
  /** scenes start slightly before the anchor word so visuals lead the voice */
  leadSeconds: 0.15,
  tailSeconds: 1,
} as const;

export const MOTION = {
  spring: { damping: 14, stiffness: 160 },
  distance: 36,
  stagger: 10,
  answerDelayFrames: 30,
} as const;

export const SCAN = { framesPerCell: 8, jumpDelayFrames: 12 } as const;
export const LOOKUP = { hitDelayFrames: 44, resultDelayFrames: 56 } as const;
export const EXECUTION = { framesPerStep: 18 } as const;
export const EVENT_LOOP = { framesPerStep: 20 } as const;
export const CALL_STACK = { framesPerStep: 16 } as const;
export const BINARY_SEARCH = { framesPerStep: 22 } as const;
export const MEMORY = { stepStaggerFrames: 12 } as const;
export const COMPLEXITY = { drawFrames: 36 } as const;
export const RELATION = { stepStaggerFrames: 12 } as const;

export const CAPTION = {
  wordsPerChunk: 3,
  /** Pause threshold between words to trigger a new caption chunk early */
  maxGapSeconds: 0.35,
  holdSeconds: 0.5,
  fontSize: 52,
  maxWidth: 640,
  right: 115,
  bottom: 220,
  handleSize: 11,
  spring: { damping: 14, stiffness: 180 },
} as const;

/** Scenes cross-fade: the outgoing scene fades while the next one slides in. */
export const TRANSITION = {
  enterSpring: { damping: 16, stiffness: 140 },
  overlapFrames: 8,
  distance: 48,
} as const;

export const CODE_SNAP = {
  fontSize: 28,
  compactFontSize: 24,
  charsPerFrame: 1.6,
  focusFadeFrames: 12,
  dimAmount: 0.52,
  dotSize: 11,
} as const;

export const CODE_DEMO = { vizDelayFrames: 10, vizHeight: 340 } as const;

/** Put your PNG in /public and set the file name. null => placeholder. (Keep your own values here.) */
export const CHARACTER = { src: 'main.png' as string | null, width: 370, height: 770 } as const;
