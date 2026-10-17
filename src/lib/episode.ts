import { DEFAULT_THEME, FPS } from '../config';
import { GLOSSARY, type GlossaryEntry } from '../glossary';
import type { Episode, Word } from '../types';
import { normalizeText } from './text';
import { resolveTimeline } from './timeline';

export function applyGlossary(words: Word[], entries: GlossaryEntry[] = GLOSSARY): Word[] {
  // Prevent accidental double-application on already-normalized words when using default glossary
  if (entries === GLOSSARY && words.length > 0 && words.every((w) => w.rawStart !== undefined)) {
    return words;
  }

  const byLength = [...entries].sort((a, b) => b.say.length - a.say.length);
  const out: Word[] = [];

  for (let i = 0; i < words.length; ) {
    const hit = byLength.find(
      (entry) =>
        entry.say.length > 0 &&
        entry.say.every((token, k) => words[i + k] && normalizeText(words[i + k].text) === normalizeText(token)),
    );
    if (hit) {
      const endIdx = i + hit.say.length - 1;
      out.push({
        text: hit.show,
        start: words[i].start,
        end: words[endIdx].end,
        rawStart: words[i].rawStart ?? i,
        rawEnd: words[endIdx].rawEnd ?? endIdx,
        rawText: words
          .slice(i, endIdx + 1)
          .map((w) => w.rawText ?? w.text)
          .join(' '),
      });
      i += hit.say.length;
    } else {
      out.push({
        ...words[i],
        rawStart: words[i].rawStart ?? i,
        rawEnd: words[i].rawEnd ?? i,
        rawText: words[i].rawText ?? words[i].text,
      });
      i += 1;
    }
  }
  return out;
}

const inRange = (value: number, length: number) => Number.isInteger(value) && value >= 0 && value < length;

/** Data mistakes the type system can't catch. Returns one message per problem. */
export const validateEpisode = (episode: Episode): string[] => {
  const errors: string[] = [];
  const seen = new Set<string>();
  const sourceWords = episode.rawWords ?? episode.words;

  if (sourceWords.length === 0) {
    errors.push('words is empty (run the transcribe script, or keep the placeholder word).');
  }

  for (let i = 0; i < sourceWords.length; i++) {
    const w = sourceWords[i];
    if (!w.text || !w.text.trim()) {
      errors.push(`word ${i}: text must not be empty.`);
    }
    if (!Number.isFinite(w.start) || !Number.isFinite(w.end)) {
      errors.push(`word ${i} ("${w.text}"): start and end timestamps must be finite numbers.`);
      continue;
    }
    if (w.start < 0) {
      errors.push(`word ${i} ("${w.text}"): start timestamp (${w.start}) must be non-negative.`);
    }
    if (w.end < w.start) {
      errors.push(`word ${i} ("${w.text}"): end timestamp (${w.end}) is earlier than start (${w.start}).`);
    }
    if (i > 0 && Number.isFinite(sourceWords[i - 1].start) && w.start < sourceWords[i - 1].start) {
      errors.push(
        `word ${i} ("${w.text}" @ ${w.start}s): start timestamp is earlier than previous word ${i - 1} ("${sourceWords[i - 1].text}" @ ${sourceWords[i - 1].start}s).`,
      );
    }
  }

  if (episode.scenes.length === 0) errors.push('scenes is empty.');

  for (const scene of episode.scenes) {
    const fail = (msg: string) => errors.push(`scene "${scene.id}": ${msg}`);

    if (!scene.id || !scene.id.trim()) fail('scene id must not be empty.');
    if (seen.has(scene.id)) fail('duplicate scene id (ids must be unique).');
    seen.add(scene.id);

    if (scene.kind === 'statement' && !scene.text.trim()) {
      fail('text must not be empty.');
    }
    if (scene.kind === 'array') {
      if (scene.cells.length === 0) {
        fail('cells must not be empty.');
      } else if (!inRange(scene.target, scene.cells.length)) {
        fail(`target ${scene.target} is outside cells (0-${scene.cells.length - 1}).`);
      }
    }
    if (scene.kind === 'diagram') {
      if (scene.nodes.length === 0) {
        fail('nodes must not be empty.');
      } else if (scene.highlight !== undefined && !inRange(scene.highlight, scene.nodes.length)) {
        fail(`highlight ${scene.highlight} is outside nodes (0-${scene.nodes.length - 1}).`);
      }
    }
    if ((scene.kind === 'code' || scene.kind === 'codeDemo') && scene.code !== undefined) {
      if (!scene.code.trim()) {
        fail('code must not be empty.');
      } else {
        const lineCount = scene.code.split('\n').length;
        const bad = (scene.highlightLines ?? []).filter((line) => !inRange(line - 1, lineCount));
        if (bad.length) fail(`highlightLines ${bad.join(', ')} are outside the code (1-${lineCount}, 1-based).`);
      }
    }
    if (scene.kind === 'codeDemo') {
      const { viz } = scene;
      const lineCount = scene.code && scene.code.trim() ? scene.code.split('\n').length : 0;
      if (viz.type === 'scan') {
        if (viz.cells.length === 0) {
          fail('viz.cells must not be empty.');
        } else if (!inRange(viz.target, viz.cells.length)) {
          fail(`viz.target ${viz.target} is outside viz.cells (0-${viz.cells.length - 1}).`);
        }
      }
      if (viz.type === 'lookup') {
        if (!Number.isInteger(viz.buckets) || viz.buckets <= 0) {
          fail(`viz.buckets (${viz.buckets}) must be a positive integer.`);
        } else if (!inRange(viz.hit, viz.buckets)) {
          fail(`viz.hit ${viz.hit} is outside the buckets (0-${viz.buckets - 1}).`);
        }
      }
      if (viz.type === 'execution') {
        if (viz.steps.length === 0) fail('viz.steps must not be empty.');
        if (lineCount > 0) {
          const badLines = viz.steps.map((s) => s.line).filter((l) => !inRange(l - 1, lineCount));
          if (badLines.length) fail(`viz.steps line(s) ${badLines.join(', ')} are outside the code (1-${lineCount}).`);
        }
      }
      if (viz.type === 'eventLoop') {
        if (viz.steps.length === 0) fail('viz.steps must not be empty.');
        if (lineCount > 0) {
          const badLines = viz.steps
            .map((s) => s.line)
            .filter((l): l is number => l !== undefined && !inRange(l - 1, lineCount));
          if (badLines.length) fail(`viz.steps line(s) ${badLines.join(', ')} are outside the code (1-${lineCount}).`);
        }
      }
      if (viz.type === 'callStack') {
        if (viz.frames.length === 0 || viz.frames.some((f) => !f.trim())) {
          fail('viz.frames must contain at least one non-empty frame label.');
        }
        if (viz.returns && viz.returns.length > viz.frames.length) {
          fail(`viz.returns length (${viz.returns.length}) cannot exceed viz.frames length (${viz.frames.length}).`);
        }
        if (viz.lines && lineCount > 0) {
          const badLines = viz.lines.filter((l) => !inRange(l - 1, lineCount));
          if (badLines.length) fail(`viz.lines ${badLines.join(', ')} are outside the code (1-${lineCount}).`);
        }
      }
      if (viz.type === 'binarySearch') {
        if (viz.cells.length === 0) {
          fail('viz.cells must not be empty.');
        } else if (!inRange(viz.targetIndex, viz.cells.length)) {
          fail(`viz.targetIndex ${viz.targetIndex} is outside viz.cells (0-${viz.cells.length - 1}).`);
        } else {
          const nums = viz.cells.map((c) => Number(c));
          if (nums.every((n) => Number.isFinite(n))) {
            for (let i = 1; i < nums.length; i++) {
              if (nums[i] < nums[i - 1]) {
                fail('viz.cells for binarySearch must be sorted in ascending order.');
                break;
              }
            }
          }
        }
      }
    }
    if (scene.kind === 'steps') {
      if (scene.steps.length === 0 || scene.steps.some((s) => !s.trim())) {
        fail('steps must contain at least one non-empty string.');
      }
    }
    if (scene.kind === 'compare') {
      if (scene.sides.some((s) => !s.title.trim() || s.items.length === 0 || s.items.some((item) => !item.trim()))) {
        fail('each compare side must have a non-empty title and at least one non-empty item.');
      }
    }
    if (scene.kind === 'qa') {
      if (!scene.question.trim() || !scene.answer.trim()) {
        fail('question and answer must not be empty.');
      }
    }
  }

  // Validate timeline and scene anchors if words and scenes are present and timestamps are valid
  if (errors.length === 0) {
    try {
      const prepared: Episode = {
        ...episode,
        rawWords: sourceWords,
        words: applyGlossary(sourceWords),
      };
      resolveTimeline(prepared, FPS);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return errors;
};

/** Every episode goes through this so the glossary is applied to its words while preserving rawWords. */
export const defineEpisode = (episode: Episode): Episode => {
  const rawWords = episode.rawWords ?? episode.words;
  const words = applyGlossary(rawWords);
  const prepared: Episode = {
    ...episode,
    theme: episode.theme ?? DEFAULT_THEME,
    rawWords,
    words,
  };
  const errors = validateEpisode(prepared);
  if (errors.length) throw new Error(`Episode "${episode.id}" has ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
  return prepared;
};

