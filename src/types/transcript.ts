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
