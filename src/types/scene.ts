import type { SceneAnchor } from './transcript';
import type { VizConfig } from './viz';

type Base = {
  id: string;
  /** Where the scene starts: a raw word index, a word/phrase string, or `{ text, occurrence }` (searched after the previous scene's match). */
  at: SceneAnchor;
  label?: string;
  title?: string;
};

export type StepItem = {
  text: string;
  /** Optional monospace pill on the left (e.g. "push(10)", "O(1)") */
  badge?: string;
  /** Optional inline code snippet for the step */
  code?: string;
  tone?: 'good' | 'bad' | 'warn' | 'ink';
};

export type DiagramNode = {
  title: string;
  /** Secondary subtitle or code detail inside the node */
  sub?: string;
  /** Monospace pill badge (e.g. "CLIENT", "200 OK", "DIFF O(N)") */
  badge?: string;
  tone?: 'good' | 'bad' | 'warn' | 'ink' | 'paper';
};

export type CompareSide = {
  title: string;
  /** Bullet items explaining the side (optional when `code` is provided) */
  items?: string[];
  /** Optional code snippet for Before/After or Error/Fix comparisons (Panel 12) */
  code?: string;
  language?: string;
  /** Optional runtime/compiler error callout shown below `code` (e.g. "TypeError: Cannot read properties of undefined") */
  errorLine?: string;
  badge?: string;
  tone?: 'good' | 'bad' | 'ink' | 'paper';
  /** Optional 0..100 progress bar value */
  progress?: number;
};

export type MythRealitySide = {
  /** Optional header label (e.g. "الخرافة الشائعة" or "الحقيقة") */
  label?: string;
  /** Main statement text */
  text: string;
  /** Optional bullet points */
  bullets?: string[];
  /** Optional code snippet */
  code?: string;
  language?: string;
  filename?: string;
  /** Optional badge on top-right (e.g. "✗ FALSE", "✓ FACT") */
  badge?: string;
  tone?: 'bad' | 'good' | 'warn' | 'ink';
};

export type MythRealitySideInput = string | MythRealitySide;

export type PacketStop = {
  /** Emoji or short glyph shown on the stop card (e.g. "📱", "🗄️") */
  icon: string;
  label: string;
  /** Detail line revealed when the packet arrives (e.g. "~30ms") */
  sub?: string;
  /** Monospace pill on the card (e.g. "DNS", "HTTPS") */
  badge?: string;
  tone?: 'good' | 'bad' | 'warn' | 'ink';
};

/** Animated illustrations for the `motion` scene. All frame numbers are relative to the scene start (30fps). */
export type MotionAnim =
  | {
      type: 'likeHeart';
      /** Like counter before the tap (default 1203) */
      likes?: number;
      /** Frame the finger taps the heart (default 12) */
      tapAt?: number;
      /** Status chip shown after the tap (default "السيرفر: لسه ماعرفش") */
      statusText?: string;
      /** If set, the request "fails" at this frame: heart turns back to empty and the counter rolls back */
      revertAt?: number;
      /** Status chip text after the failure (default "فشل الإرسال") */
      failText?: string;
    }
  | {
      type: 'packetFlow';
      /** Stations the request travels through, top to bottom (2-6) */
      stops: PacketStop[];
      /** Frame at which the packet arrives at each stop (one per stop). Use it to sync with the voiceover. */
      arriveAt?: number[];
      /** Frames per hop when `arriveAt` is not given (default 26) */
      hopFrames?: number;
      /** After reaching the last stop, send a green response packet back to the first one */
      returnTrip?: boolean;
    };

export type SceneConfig =
  | (Base & {
      kind: 'statement';
      text: string;
      variant?: 'hook' | 'takeaway' | 'prediction';
      codePreview?: { code: string; badge?: string; filename?: string; language?: string };
    })
  | (Base & {
      kind: 'array';
      cells: string[];
      target: number;
      mode: 'scan' | 'jump';
      pointerLabel?: string;
      result?: string;
    })
  | (Base & {
      kind: 'code';
      code: string;
      language?: string;
      filename?: string;
      highlightLines?: number[];
      skipTyping?: boolean;
      /** When true, preserves code context across scenes without re-typing */
      persistCode?: boolean;
    })
  | (Base & {
      kind: 'codeDemo';
      code?: string;
      language?: string;
      filename?: string;
      highlightLines?: number[];
      skipTyping?: boolean;
      /** When true, preserves code context across scenes without re-typing or delay */
      persistCode?: boolean;
      pill?: string;
      pillTone?: 'good' | 'bad' | 'neutral';
      tagText?: string;
      tagTone?: 'good' | 'bad' | 'neutral';
      viz: VizConfig;
      result?: string;
    })
  | (Base & {
      kind: 'steps';
      steps: Array<string | StepItem>;
      pill?: string;
      /** Show an accumulated visual stack/pipeline bar at the bottom */
      showStack?: boolean;
    })
  | (Base & { kind: 'compare'; pill?: string; sides: [CompareSide, CompareSide] })
  | (Base & {
      kind: 'diagram';
      nodes: Array<string | DiagramNode>;
      highlight?: number;
      pill?: string;
      layout?: 'vertical' | 'pipeline' | 'architecture';
      /** Labels rendered on the arrows between consecutive nodes (e.g. ["GET /api/user", "SELECT *"]) */
      edgeLabels?: string[];
      /** Optional return/response edge labels for request-response architecture flows */
      returnEdgeLabels?: string[];
      /** Optional bottom sub-layer panel (e.g. React Hooks row + diffing note) */
      subLayer?: { label: string; items: string[]; note?: string };
    })
  | (Base & {
      kind: 'qa';
      question: string;
      answer: string;
      pill?: string;
      /** Optional code snippet for "What will this print?" prediction quizzes (Panel 11) */
      code?: string;
      language?: string;
      filename?: string;
      /** Optional A/B/C multiple-choice options */
      options?: string[];
      /** 0-based index of the correct option in `options` */
      correctIndex?: number;
      /** Custom frame delay before revealing the answer and highlighting `correctIndex` */
      revealDelayFrames?: number;
    })
  | (Base & {
      kind: 'transition';
      fromTitle: string;
      fromBadge?: string;
      fromSub?: string;
      toTitle: string;
      toBadge?: string;
      toSub?: string;
      bridgeText?: string;
      pill?: string;
    })
  | (Base & { kind: 'motion'; pill?: string; anim: MotionAnim })
  | (Base & {
      kind: 'mythReality';
      pill?: string;
      myth: MythRealitySideInput;
      reality: MythRealitySideInput;
      /** Custom frame delay before revealing the reality card (defaults to MOTION.stagger * 2) */
      revealDelayFrames?: number;
    });

export type SceneKind = SceneConfig['kind'];
export type SceneOf<K extends SceneKind> = Extract<SceneConfig, { kind: K }>;
