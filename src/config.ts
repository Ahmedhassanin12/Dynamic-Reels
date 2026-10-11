import type { PrismTheme } from 'prism-react-renderer';

export const FPS = 30;
export const SIZE = { width: 1080, height: 1920 } as const;

const SHARED = {
  bg: '#0f1115',
  paper: '#1a1d24',
  text: '#f2f3f5',
  muted: '#8b90a0',
  border: '#2b303b',
  grid: 'rgba(255, 255, 255, 0.035)',
  shadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
  shadowSm: '0 12px 30px rgba(0, 0, 0, 0.4)',
} as const;

/** `ink` is the brand accent, `onInk` is the text color used on top of it. Switch palette with PALETTE_NAME. */
export const PALETTES = {
  amber: { ...SHARED, ink: '#ffb020', onInk: '#14110a', tint: 'rgba(255, 176, 32, 0.14)' },
  mint: { ...SHARED, ink: '#34d399', onInk: '#04140d', tint: 'rgba(52, 211, 153, 0.14)' },
  rose: { ...SHARED, ink: '#fb7185', onInk: '#1a0509', tint: 'rgba(251, 113, 133, 0.14)' },
} as const;

export const PALETTE_NAME: keyof typeof PALETTES = 'amber';
export const THEME = PALETTES[PALETTE_NAME];

/** Stage = the top area for scenes; the bottom is reserved for character + captions. */
export const STAGE = { top: 130, reservedBottom: 560 } as const;

export const TIMELINE = {
  /** scenes start slightly before the anchor word so visuals lead the voice */
  leadSeconds: 0.15,
  tailSeconds: 1,
} as const;

export const MOTION = {
  spring: { damping: 14, stiffness: 160 },
  distance: 50,
  stagger: 10,
  answerDelayFrames: 30,
} as const;

export const SCAN = { framesPerCell: 8, jumpDelayFrames: 12 } as const;
export const LOOKUP = { hitDelayFrames: 44, resultDelayFrames: 56 } as const;

export const CAPTION = {
  wordsPerChunk: 3,
  holdSeconds: 0.5,
  fontSize: 64,
  maxWidth: 640,
  spring: { damping: 14, stiffness: 180 },
} as const;

/** Scenes cross-fade: the outgoing scene fades while the next one slides in. */
export const TRANSITION = {
  enterSpring: { damping: 16, stiffness: 140 },
  overlapFrames: 8,
  distance: 60,
} as const;

export const CODE_SNAP = {
  fontSize: 36,
  charsPerFrame: 1.6,
  focusFadeFrames: 12,
  dimAmount: 0.5,
  dots: ['#ff5f57', '#febc2e', '#28c840'],
  /** VS Code Dark+ chrome */
  chrome: {
    editor: '#1e1e1e',
    titleBar: '#323233',
    tabBar: '#252526',
    border: '#3c3c3c',
    lineNumber: '#858585',
    currentLine: '#2a2d2e',
    text: '#d4d4d4',
  },
} as const;

export const CODE_DEMO = { vizDelayFrames: 10, vizHeight: 400 } as const;

/** VS Code Dark+ syntax colors. */
export const CODE_THEME = {
  plain: { color: CODE_SNAP.chrome.text, backgroundColor: CODE_SNAP.chrome.editor },
  styles: [
    { types: ['keyword', 'tag', 'boolean'], style: { color: '#569cd6' } },
    { types: ['builtin', 'class-name', 'maybe-class-name'], style: { color: '#4ec9b0' } },
    { types: ['function'], style: { color: '#dcdcaa' } },
    { types: ['string', 'char', 'attr-value'], style: { color: '#ce9178' } },
    { types: ['number'], style: { color: '#b5cea8' } },
    { types: ['property', 'parameter', 'variable', 'constant'], style: { color: '#9cdcfe' } },
    { types: ['comment'], style: { color: '#6a9955', fontStyle: 'italic' } },
    { types: ['operator', 'punctuation'], style: { color: '#d4d4d4' } },
  ],
} satisfies PrismTheme;

/** Put your PNG in /public and set the file name. null => placeholder. (Keep your own values here.) */
export const CHARACTER = { src: "main.png" as string | null, width: 370, height: 870 } as const;
