import type { ThemeName } from './config';

export type Word = {
  text: string;
  start: number;
  end: number;
  /** Start index in the raw transcript (0-based, populated by applyGlossary) */
  rawStart?: number;
  /** Inclusive end index in the raw transcript (0-based, populated by applyGlossary) */
  rawEnd?: number;
  /** Original raw transcript text before glossary normalization */
  rawText?: string;
  /** Corrected transcript text (after applying approved corrections, before glossary) */
  correctedText?: string;
};

export type TranscriptCorrection = {
  /** 0-based word index in raw transcript (words.json) */
  index: number;
  /** Expected raw text at this index for safety validation against drift */
  original: string;
  /** Corrected text replacing the raw word */
  corrected: string;
  /** Approval status: only 'approved' corrections are applied to the episode */
  status?: 'approved' | 'suggested';
  /** Rationale or source of the correction */
  reason?: string;
};

export type AnchorObject = {
  /** Exact word or multi-word phrase to match (in either raw transcript or glossary terms) */
  text: string;
  /** 1-based occurrence to select starting from the previous scene's anchor (default: 1) */
  occurrence?: number;
};

export type SceneAnchor = number | string | AnchorObject;

type Base = {
  id: string;
  /** Where the scene starts: a raw word index, a word/phrase string, or `{ text, occurrence }` (searched after the previous scene's match). */
  at: SceneAnchor;
  label?: string;
  title?: string;
};

export type ExecutionStep = {
  /** 1-based line number in the code snippet */
  line: number;
  /** Console output emitted at this step */
  output?: string;
  /** Variable state snapshot at this step */
  vars?: Record<string, string>;
  /** Short educational note for this step */
  note?: string;
};

export type EventLoopStep = {
  /** Optional 1-based active line number in the code snippet */
  line?: number;
  /** Frames currently on the Call Stack (bottom-to-top or top-to-bottom) */
  stack: string[];
  /** Active Web API timers/requests */
  webApis?: string[];
  /** Callbacks waiting in the Microtask Queue (Promises) */
  microtasks: string[];
  /** Callbacks waiting in the Task / Macrotask Queue (setTimeout, I/O) */
  tasks: string[];
  /** Console outputs emitted up to this step */
  output?: string[];
  /** Which runtime zone is currently active */
  activeZone?: 'stack' | 'webApi' | 'microtask' | 'task' | 'loop';
  /** Short explanation of what happens in this tick */
  note?: string;
};

export type StackSlot = {
  name: string;
  value: string;
  /** Optional Heap object id this variable points to (e.g. "0x4F2A") */
  ref?: string;
  changed?: boolean;
};

export type HeapObject = {
  id: string;
  label: string;
  entries: Record<string, string>;
  /** Optional property key that was mutated through a shared reference */
  mutatedKey?: string;
};

export type ComplexityCurve = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n²)';

export type VizConfig =
  | { type: 'scan'; cells: string[]; target: number }
  | { type: 'lookup'; key: string; buckets: number; hit: number; valuePreview?: string; subtitle?: string }
  | { type: 'execution'; steps: ExecutionStep[]; framesPerStep?: number }
  | { type: 'eventLoop'; steps: EventLoopStep[]; framesPerStep?: number }
  | {
      type: 'callStack';
      frames: string[];
      returns?: string[];
      lines?: number[];
      mode?: 'stack' | 'queue';
      framesPerStep?: number;
    }
  | {
      type: 'binarySearch';
      cells: (string | number)[];
      targetIndex: number;
      framesPerStep?: number;
    }
  | {
      type: 'memory';
      stack: StackSlot[];
      heap: HeapObject[];
      note?: string;
    }
  | {
      type: 'complexity';
      curves?: ComplexityCurve[];
      highlight?: ComplexityCurve;
      note?: string;
    }
  | {
      type: 'linkedList';
      nodes: LinkedListNodeInput[];
      activePointer?: number | string;
      pointerLabel?: string;
      note?: string;
      framesPerStep?: number;
    };

export type LinkedListNode = {
  value: string | number;
  /** Address or identifier for this node (e.g. "0x1A", "0x4F") */
  address?: string;
  /** Target pointer: next node address or null/undefined for tail */
  next?: string | null;
  /** Highlight state */
  highlight?: boolean;
  /** Optional badge on the node (e.g. "HEAD", "TAIL", "NEW") */
  badge?: string;
  tone?: 'good' | 'bad' | 'warn' | 'ink';
};

export type LinkedListNodeInput = string | number | LinkedListNode;

export type VizType = VizConfig['type'];
export type VizProps<K extends VizType> = { viz: Extract<VizConfig, { type: K }>; result?: string };

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
    })
  | (Base & {
      kind: 'codeDemo';
      code?: string;
      language?: string;
      filename?: string;
      highlightLines?: number[];
      skipTyping?: boolean;
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
  | (Base & {
      kind: 'mythReality';
      pill?: string;
      myth: MythRealitySideInput;
      reality: MythRealitySideInput;
      /** Custom frame delay before revealing the reality card (defaults to MOTION.stagger * 2) */
      revealDelayFrames?: number;
    });

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

export type SceneKind = SceneConfig['kind'];
export type SceneOf<K extends SceneKind> = Extract<SceneConfig, { kind: K }>;

export type Episode = {
  id: string;
  title: string;
  theme?: ThemeName;
  /** imported audio asset (e.g. `import voice from './voice.mp3'`), or null for a silent preview */
  voice: string | null;
  words: Word[];
  /** Preserved pre-glossary transcript words for anchor resolution and debugging */
  rawWords?: Word[];
  /** Optional explicit transcript corrections applied before glossary normalization */
  corrections?: TranscriptCorrection[];
  scenes: SceneConfig[];
};

