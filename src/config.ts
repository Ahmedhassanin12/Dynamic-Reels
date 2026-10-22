export const FPS = 30;
export const SIZE = { width: 1080, height: 1920 } as const;

export type { CodeChrome, CodeSyntax, Theme, ThemeName } from './theme';
export {
  DEFAULT_THEME,
  SHARED_CHROME,
  SHARED_CODE,
  SHARED_SYNTAX,
  SHARED_UI,
  THEMES,
  makePrismTheme,
} from './theme';

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
