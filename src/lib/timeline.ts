import {
  BINARY_SEARCH,
  CALL_STACK,
  CODE_DEMO,
  CODE_SNAP,
  COMPLEXITY,
  EVENT_LOOP,
  EXECUTION,
  LOOKUP,
  MEMORY,
  MOTION,
  RELATION,
  SCAN,
  TIMELINE,
} from '../config';
import type { Episode, SceneConfig, Word } from '../types';
import { typingFrames } from './code';
import { applyCorrections } from './corrections';
import { applyGlossary } from '../glossary';
import { normalizeText as normalize, tokenizeNormalized } from './text';

export type BinarySearchStep = {
  low: number;
  mid: number;
  high: number;
  found: boolean;
};

/** Deterministically computes exact [low, mid, high] steps for binary search on a sorted array. */
export const computeBinarySearchSteps = (
  cells: (string | number)[],
  targetIndex: number,
): BinarySearchStep[] => {
  const steps: BinarySearchStep[] = [];
  let low = 0;
  let high = cells.length - 1;

  while (low <= high && steps.length <= cells.length) {
    const mid = Math.floor((low + high) / 2);
    const found = mid === targetIndex;
    steps.push({ low, mid, high, found });
    if (found) break;
    if (targetIndex < mid) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return steps.length > 0 ? steps : [{ low: 0, mid: 0, high: Math.max(0, cells.length - 1), found: true }];
};

export type AnchorMatch = {
  /** Start index in the raw transcript (0-based) */
  rawIndex: number;
  /** Inclusive end index in the raw transcript (0-based) */
  rawEndIndex: number;
  /** Index in the glossary-normalized episode.words array */
  wordIndex: number;
  /** Display text of the matched token/phrase */
  text: string;
  /** Original raw text from words.json */
  rawText: string;
  /** Start timestamp in seconds */
  startSeconds: number;
};

export type TimelineItem = {
  scene: SceneConfig;
  from: number;
  durationInFrames: number;
  match: AnchorMatch;
};

type PrevMatchContext = { sceneId: string; match: AnchorMatch } | undefined;

const findDisplayWordIndex = (displayWords: Word[], rawIndex: number): number => {
  const idx = displayWords.findIndex((w, i) => {
    const start = w.rawStart ?? i;
    const end = w.rawEnd ?? i;
    return rawIndex >= start && rawIndex <= end;
  });
  return idx === -1 ? Math.min(rawIndex, Math.max(0, displayWords.length - 1)) : idx;
};

const formatPrevContext = (prev: PrevMatchContext, rawWords: Word[], searchFromRaw: number): string => {
  const searchWord = rawWords[searchFromRaw];
  const searchDesc = searchWord
    ? `word ${searchFromRaw} ("${searchWord.text}" @ ${searchWord.start}s)`
    : `word ${searchFromRaw} (end of transcript)`;
  if (!prev) return `starting at ${searchDesc}`;
  return `after word ${prev.match.rawEndIndex} (scene "${prev.sceneId}" matched word ${prev.match.rawIndex} "${prev.match.rawText}" @ ${prev.match.startSeconds}s; searching from ${searchDesc})`;
};

export const resolveAnchor = (
  scene: SceneConfig,
  rawWords: Word[],
  displayWords: Word[],
  searchFromRaw: number,
  prev?: PrevMatchContext,
): AnchorMatch => {
  if (typeof scene.at === 'number') {
    if (!Number.isInteger(scene.at) || scene.at < 0 || scene.at >= rawWords.length) {
      throw new Error(`Scene "${scene.id}": word index ${scene.at} is out of range (0-${rawWords.length - 1})`);
    }
    if (scene.at < searchFromRaw) {
      const target = rawWords[scene.at];
      throw new Error(
        `Scene "${scene.id}": word index ${scene.at} ("${target.text}" @ ${target.start}s) is earlier than the current search position (${formatPrevContext(prev, rawWords, searchFromRaw)}).`,
      );
    }
    const wordIndex = findDisplayWordIndex(displayWords, scene.at);
    return {
      rawIndex: scene.at,
      rawEndIndex: scene.at,
      wordIndex,
      text: displayWords[wordIndex]?.text ?? rawWords[scene.at].text,
      rawText: rawWords[scene.at].text,
      startSeconds: rawWords[scene.at].start,
    };
  }

  const anchorText = typeof scene.at === 'string' ? scene.at : scene.at.text;
  const occurrence = typeof scene.at === 'string' ? 1 : (scene.at.occurrence ?? 1);

  if (!Number.isInteger(occurrence) || occurrence < 1) {
    throw new Error(`Scene "${scene.id}": anchor occurrence must be a positive integer (got ${occurrence}).`);
  }

  const fullNeedle = normalize(anchorText);
  const needleTokens = tokenizeNormalized(anchorText);
  if (!fullNeedle || needleTokens.length === 0) {
    throw new Error(`Scene "${scene.id}": anchor "${anchorText}" has no letters or digits to match.`);
  }

  // Map each rawStart index to its display word index for fast lookup
  const displayAtRawStart = new Map<number, number>();
  displayWords.forEach((w, idx) => {
    displayAtRawStart.set(w.rawStart ?? idx, idx);
  });

  const allExactMatches: AnchorMatch[] = [];

  for (let rIdx = 0; rIdx < rawWords.length; rIdx++) {
    // 1. Check raw token / multi-word phrase match starting at rIdx
    const rawPhraseMatches =
      rIdx + needleTokens.length <= rawWords.length &&
      needleTokens.every((token, k) => normalize(rawWords[rIdx + k].text) === token);

    // 2. Check glossary / display token or multi-word display phrase starting at rIdx
    const wIdx = displayAtRawStart.get(rIdx);
    let displayMatchEndRaw = -1;
    let displayMatchText = '';

    if (wIdx !== undefined) {
      const dw = displayWords[wIdx];
      const matchText = normalize(dw.text) === fullNeedle;
      const matchCorr = dw.correctedText ? normalize(dw.correctedText) === fullNeedle : false;
      if (matchText || matchCorr) {
        displayMatchEndRaw = dw.rawEnd ?? rIdx;
        displayMatchText = dw.text;
      } else {
        // Check if consecutive display words starting at wIdx tokenize to needleTokens
        const collectedTokens: string[] = [];
        let endWIdx = wIdx;
        while (endWIdx < displayWords.length && collectedTokens.length < needleTokens.length) {
          collectedTokens.push(...tokenizeNormalized(displayWords[endWIdx].text));
          if (collectedTokens.length < needleTokens.length) {
            endWIdx++;
          }
        }
        if (
          collectedTokens.length === needleTokens.length &&
          collectedTokens.every((t, k) => t === needleTokens[k])
        ) {
          displayMatchEndRaw = displayWords[endWIdx].rawEnd ?? endWIdx;
          displayMatchText = displayWords
            .slice(wIdx, endWIdx + 1)
            .map((w) => w.text)
            .join(' ');
        }
      }
    }

    if (rawPhraseMatches || displayMatchEndRaw !== -1) {
      const rawEndIndex =
        displayMatchEndRaw !== -1
          ? Math.max(displayMatchEndRaw, rIdx + needleTokens.length - 1)
          : rIdx + needleTokens.length - 1;
      const resolvedWIdx = wIdx ?? findDisplayWordIndex(displayWords, rIdx);
      const rawSliceText = rawWords
        .slice(rIdx, rawEndIndex + 1)
        .map((w) => w.text)
        .join(' ');
      allExactMatches.push({
        rawIndex: rIdx,
        rawEndIndex,
        wordIndex: resolvedWIdx,
        text: displayMatchText || (displayWords[resolvedWIdx]?.text ?? rawSliceText),
        rawText: rawSliceText,
        startSeconds: rawWords[rIdx].start,
      });
    }
  }

  const afterMatches = allExactMatches.filter((m) => m.rawIndex >= searchFromRaw);
  const beforeMatches = allExactMatches.filter((m) => m.rawIndex < searchFromRaw);

  if (afterMatches.length >= occurrence) {
    return afterMatches[occurrence - 1];
  }

  if (afterMatches.length > 0 && afterMatches.length < occurrence) {
    throw new Error(
      `Scene "${scene.id}": requested occurrence ${occurrence} of "${anchorText}" ${formatPrevContext(prev, rawWords, searchFromRaw)}, ` +
        `but only found ${afterMatches.length} match(es) (at word ${afterMatches.map((m) => `${m.rawIndex} "${m.rawText}" @ ${m.startSeconds}s`).join(', ')}).`,
    );
  }

  // Fallback partial match only when looking for the 1st occurrence of a single token
  if (occurrence === 1 && needleTokens.length === 1) {
    for (let rIdx = searchFromRaw; rIdx < rawWords.length; rIdx++) {
      const wIdx = displayAtRawStart.get(rIdx);
      const rawNorm = normalize(rawWords[rIdx].text);
      const dispNorm = wIdx !== undefined ? normalize(displayWords[wIdx].text) : '';
      if (rawNorm.includes(fullNeedle) || dispNorm.includes(fullNeedle)) {
        const resolvedWIdx = wIdx ?? findDisplayWordIndex(displayWords, rIdx);
        const rawEndIndex =
          !rawNorm.includes(fullNeedle) && wIdx !== undefined
            ? (displayWords[wIdx].rawEnd ?? rIdx)
            : rIdx;
        const matchedText = rawNorm.includes(fullNeedle)
          ? rawWords[rIdx].text
          : displayWords[resolvedWIdx].text;
        console.warn(
          `Scene "${scene.id}": no exact match for "${anchorText}", using partial match "${matchedText}" (word ${rIdx} @ ${rawWords[rIdx].start}s). ` +
            `Use the exact word or its index to silence this.`,
        );
        return {
          rawIndex: rIdx,
          rawEndIndex,
          wordIndex: resolvedWIdx,
          text: displayWords[resolvedWIdx]?.text ?? rawWords[rIdx].text,
          rawText: rawWords[rIdx].text,
          startSeconds: rawWords[rIdx].start,
        };
      }
    }
  }

  const earlierHint =
    beforeMatches.length > 0
      ? ` Note: "${anchorText}" appeared earlier at word ${beforeMatches.map((m) => `${m.rawIndex} ("${m.rawText}" @ ${m.startSeconds}s)`).join(', ')} — a previous scene may have advanced past it.`
      : ' Check words.json.';

  throw new Error(
    `Scene "${scene.id}": no word matching "${anchorText}" ${formatPrevContext(prev, rawWords, searchFromRaw)}.${earlierHint}`,
  );
};

/** Estimated minimum frames required for the scene's key animations to finish cleanly. */
export const getMinSceneFrames = (scene: SceneConfig): number => {
  switch (scene.kind) {
    case 'statement':
      return scene.codePreview ? 28 : 15;
    case 'array':
      return scene.mode === 'scan'
        ? (scene.target + 1) * SCAN.framesPerCell + 15
        : SCAN.jumpDelayFrames + 15;
    case 'code': {
      const codeTyping = scene.skipTyping || scene.persistCode ? 0 : typingFrames(scene.code);
      return codeTyping + (scene.highlightLines?.length ? CODE_SNAP.focusFadeFrames : 0) + 15;
    }
    case 'codeDemo': {
      const codeTyping = scene.code && !(scene.skipTyping || scene.persistCode) ? typingFrames(scene.code) : 0;
      const delay = scene.code && !scene.persistCode ? CODE_DEMO.vizDelayFrames : 0;
      let vizFrames = 30;
      if (scene.viz.type === 'scan') {
        vizFrames = (scene.viz.target + 1) * SCAN.framesPerCell + 20;
      } else if (scene.viz.type === 'lookup') {
        vizFrames = LOOKUP.resultDelayFrames + 20;
      } else if (scene.viz.type === 'execution') {
        vizFrames = scene.viz.steps.length * (scene.viz.framesPerStep ?? EXECUTION.framesPerStep) + 15;
      } else if (scene.viz.type === 'eventLoop') {
        vizFrames = scene.viz.steps.length * (scene.viz.framesPerStep ?? EVENT_LOOP.framesPerStep) + 15;
      } else if (scene.viz.type === 'callStack') {
        const totalSteps = scene.viz.frames.length + (scene.viz.returns?.length ?? 0);
        vizFrames = totalSteps * (scene.viz.framesPerStep ?? CALL_STACK.framesPerStep) + 15;
      } else if (scene.viz.type === 'binarySearch') {
        const steps = computeBinarySearchSteps(scene.viz.cells, scene.viz.targetIndex).length;
        vizFrames = steps * (scene.viz.framesPerStep ?? BINARY_SEARCH.framesPerStep) + 15;
      } else if (scene.viz.type === 'memory') {
        vizFrames = Math.max(scene.viz.stack.length, scene.viz.heap.length + 1) * MEMORY.stepStaggerFrames + 20;
      } else if (scene.viz.type === 'complexity') {
        vizFrames = COMPLEXITY.drawFrames + 20;
      } else if (scene.viz.type === 'linkedList') {
        const count = scene.viz.nodes.length;
        const stepFrames = scene.viz.framesPerStep ?? 18;
        vizFrames = scene.viz.activePointer !== undefined || scene.viz.framesPerStep ? count * stepFrames + 15 : 35;
      } else if (scene.viz.type === 'asyncFlow') {
        const stepCount = scene.viz.steps?.length ?? 1;
        const stepFrames = scene.viz.framesPerStep ?? 25;
        vizFrames = scene.viz.steps?.length ? stepCount * stepFrames + 15 : 35;
      } else if (scene.viz.type === 'relation') {
        const stepFrames = scene.viz.framesPerStep ?? RELATION.stepStaggerFrames;
        const totalItems = scene.viz.tables.length + (scene.viz.link ? 1 : 0);
        vizFrames = totalItems * stepFrames + 20;
      }
      return codeTyping + delay + vizFrames;
    }
    case 'steps':
      return (scene.steps.length + (scene.showStack ? 1 : 0)) * MOTION.stagger + 15;
    case 'compare': {
      const maxItems = Math.max(...scene.sides.map((s) => s.items?.length ?? 1), 0);
      return scene.sides.length * MOTION.stagger + maxItems * MOTION.stagger + 15;
    }
    case 'diagram':
      return Math.ceil((scene.nodes.length + (scene.subLayer ? 1 : 0)) * MOTION.stagger * 1.5) + 15;
    case 'qa': {
      const optionsStagger = scene.options?.length ? (scene.options.length + 1) * MOTION.stagger : 0;
      const revealAt = scene.revealDelayFrames ?? optionsStagger + MOTION.answerDelayFrames;
      return revealAt + 20;
    }
    case 'transition':
      return MOTION.stagger * 3 + 20;
    case 'mythReality': {
      const revealAt = scene.revealDelayFrames ?? MOTION.stagger * 2;
      return revealAt + 25;
    }
    default:
      return 30;
  }
};

export const getDurationInFrames = (episode: Episode, fps: number) =>
  Math.ceil(((episode.words.at(-1)?.end ?? 0) + TIMELINE.tailSeconds) * fps);

const getEpisodeWordViews = (episode: Episode): { rawWords: Word[]; displayWords: Word[] } => {
  if (episode.rawWords && episode.words.every((w) => w.rawStart !== undefined)) {
    return { rawWords: episode.rawWords, displayWords: episode.words };
  }
  if (episode.words.length > 0 && episode.words.every((w) => w.rawStart !== undefined)) {
    return { rawWords: episode.rawWords ?? episode.words, displayWords: episode.words };
  }
  const rawWords = episode.rawWords ?? episode.words;
  const correctedWords = applyCorrections(rawWords, episode.corrections);
  return { rawWords, displayWords: applyGlossary(correctedWords) };
};

export const resolveTimeline = (
  episode: Episode,
  fps: number,
  totalDurationInFrames?: number,
): TimelineItem[] => {
  const { rawWords, displayWords } = getEpisodeWordViews(episode);
  const total = Math.max(totalDurationInFrames ?? 0, getDurationInFrames(episode, fps));
  let searchFromRaw = 0;
  let prev: PrevMatchContext = undefined;

  const resolved = episode.scenes.map((scene, i) => {
    const match = resolveAnchor(scene, rawWords, displayWords, searchFromRaw, prev);
    searchFromRaw = match.rawEndIndex + 1;
    prev = { sceneId: scene.id, match };
    const seconds = i === 0 ? 0 : Math.max(0, match.startSeconds - TIMELINE.leadSeconds);
    return { scene, match, from: Math.round(seconds * fps) };
  });

  return resolved.map(({ scene, match, from }, i) => {
    const next = resolved[i + 1];
    const nextFrom = next ? next.from : total;
    const durationInFrames = nextFrom - from;
    if (durationInFrames <= 0) {
      const nextDetail = next
        ? `next scene "${next.scene.id}" (word ${next.match.rawIndex} "${next.match.rawText}" @ ${next.match.startSeconds}s, frame ${next.from})`
        : `end of timeline (frame ${total})`;
      throw new Error(
        `Scene "${scene.id}" (word ${match.rawIndex} "${match.rawText}" @ ${match.startSeconds}s, frame ${from}) starts at or after ${nextDetail}. Check the order of "at" anchors.`,
      );
    }

    const minFrames = getMinSceneFrames(scene);
    if (durationInFrames < minFrames) {
      console.warn(
        `Scene "${scene.id}" (${scene.kind}): duration is ${durationInFrames} frames (~${(durationInFrames / fps).toFixed(2)}s), ` +
          `but its animation needs at least ${minFrames} frames (~${(minFrames / fps).toFixed(2)}s) to complete.`,
      );
    }

    return { scene, from, durationInFrames, match };
  });
};

