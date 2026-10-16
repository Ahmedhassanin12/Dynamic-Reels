import type { ThemeName } from './config';

export type Word = { text: string; start: number; end: number };

type Base = {
  id: string;
  /** Where the scene starts: a word index, or text of the first word to match (searched after the previous scene's start). */
  at: number | string;
  label?: string;
  title?: string;
};

export type VizConfig =
  | { type: 'scan'; cells: string[]; target: number }
  | { type: 'lookup'; key: string; buckets: number; hit: number };

export type VizType = VizConfig['type'];
export type VizProps<K extends VizType> = { viz: Extract<VizConfig, { type: K }>; result?: string };

export type CompareSide = { title: string; items: string[] };

export type SceneConfig =
  | (Base & { kind: 'statement'; text: string })
  | (Base & { kind: 'array'; cells: string[]; target: number; mode: 'scan' | 'jump' })
  | (Base & { kind: 'code'; code: string; language?: string; filename?: string; highlightLines?: number[] })
  | (Base & { kind: 'codeDemo'; code: string; language?: string; filename?: string; highlightLines?: number[]; viz: VizConfig; result?: string })
  | (Base & { kind: 'steps'; steps: string[] })
  | (Base & { kind: 'compare'; sides: [CompareSide, CompareSide] })
  | (Base & { kind: 'diagram'; nodes: string[]; highlight?: number })
  | (Base & { kind: 'qa'; question: string; answer: string });

export type SceneKind = SceneConfig['kind'];
export type SceneOf<K extends SceneKind> = Extract<SceneConfig, { kind: K }>;

export type Episode = {
  id: string;
  title: string;
  theme?: ThemeName;
  /** imported audio asset (e.g. `import voice from './voice.mp3'`), or null for a silent preview */
  voice: string | null;
  words: Word[];
  scenes: SceneConfig[];
};
