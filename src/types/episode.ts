import type { ThemeName } from '../config';
import type { SceneConfig } from './scene';
import type { TranscriptCorrection, Word } from './transcript';

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
