import { DEFAULT_THEME, FPS } from '../config';
import { GLOSSARY, applyGlossary, type GlossaryEntry } from '../glossary';
import type { Episode, Word } from '../types';
import { applyCorrections, validateCorrections } from './corrections';
import { resolveTimeline } from './timeline';

export { applyGlossary };

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

    if (scene.kind === 'statement') {
      if (!scene.text.trim()) {
        fail('text must not be empty.');
      }
      if (scene.codePreview && !scene.codePreview.code.trim()) {
        fail('codePreview.code must not be empty when specified.');
      }
    }
    if (scene.kind === 'array') {
      if (scene.cells.length === 0) {
        fail('cells must not be empty.');
      } else if (!inRange(scene.target, scene.cells.length)) {
        fail(`target ${scene.target} is outside cells (0-${scene.cells.length - 1}).`);
      }
    }
    if (scene.kind === 'diagram') {
      if (
        scene.nodes.length === 0 ||
        scene.nodes.some((n) => !(typeof n === 'string' ? n : n.title).trim())
      ) {
        fail('nodes must contain at least one non-empty node.');
      } else if (scene.highlight !== undefined && !inRange(scene.highlight, scene.nodes.length)) {
        fail(`highlight ${scene.highlight} is outside nodes (0-${scene.nodes.length - 1}).`);
      }
      if (scene.subLayer && (!scene.subLayer.label.trim() || scene.subLayer.items.length === 0)) {
        fail('diagram subLayer must have a non-empty label and at least one item.');
      }
      if (scene.edgeLabels && scene.edgeLabels.length > Math.max(0, scene.nodes.length - 1)) {
        fail(
          `edgeLabels length (${scene.edgeLabels.length}) cannot exceed node transitions (${Math.max(0, scene.nodes.length - 1)}).`,
        );
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
      if (viz.type === 'memory') {
        if (viz.stack.length === 0 || viz.stack.some((s) => !s.name.trim())) {
          fail('viz.stack must contain at least one variable with a non-empty name.');
        }
        const heapIds = new Set(viz.heap.map((h) => h.id));
        const badRefs = viz.stack.filter((s) => s.ref && !heapIds.has(s.ref)).map((s) => `${s.name} -> ${s.ref}`);
        if (badRefs.length) {
          fail(`viz.stack ref(s) ${badRefs.join(', ')} do not match any viz.heap id.`);
        }
      }
      if (viz.type === 'complexity') {
        if (viz.curves && viz.curves.length === 0) {
          fail('viz.curves must not be empty when specified.');
        }
      }
      if (viz.type === 'linkedList') {
        if (viz.nodes.length === 0) {
          fail('viz.nodes must contain at least one node.');
        }
        if (typeof viz.activePointer === 'number' && !inRange(viz.activePointer, viz.nodes.length)) {
          fail(`viz.activePointer ${viz.activePointer} is outside viz.nodes (0-${viz.nodes.length - 1}).`);
        }
        if (viz.framesPerStep !== undefined && (!Number.isFinite(viz.framesPerStep) || viz.framesPerStep <= 0)) {
          fail(`viz.framesPerStep (${viz.framesPerStep}) must be a positive number.`);
        }
      }
      if (viz.type === 'asyncFlow') {
        const hasPromise = Boolean(viz.promise);
        const hasLanes = Boolean(viz.lanes && viz.lanes.length > 0);
        const hasSteps = Boolean(viz.steps && viz.steps.length > 0);
        if (!hasPromise && !hasLanes && !hasSteps) {
          fail('viz of type asyncFlow must provide at least one of promise, lanes, or steps.');
        }
        if (viz.promise && !['pending', 'fulfilled', 'rejected'].includes(viz.promise.state)) {
          fail(`viz.promise.state "${viz.promise.state}" must be one of 'pending', 'fulfilled', or 'rejected'.`);
        }
        if (viz.lanes && viz.lanes.length === 0) {
          fail('viz.lanes must contain at least one lane when specified.');
        }
        if (viz.steps && viz.steps.length === 0) {
          fail('viz.steps must contain at least one step when specified.');
        }
        if (viz.framesPerStep !== undefined && (!Number.isFinite(viz.framesPerStep) || viz.framesPerStep <= 0)) {
          fail(`viz.framesPerStep (${viz.framesPerStep}) must be a positive number.`);
        }
      }
      if (viz.type === 'relation') {
        if (!viz.tables || viz.tables.length < 1 || viz.tables.length > 2) {
          fail('viz.tables must contain 1 or 2 tables.');
        } else {
          const tableColMap = new Map<string, Set<string>>();
          for (const table of viz.tables) {
            const tName = table.name?.trim() ?? '';
            if (!tName) {
              fail('each table in viz.tables must have a non-empty name.');
            }
            const colNames = (table.columns ?? []).map((c) => (typeof c === 'string' ? c.trim() : c.name?.trim() ?? ''));
            if (colNames.length === 0 || colNames.some((n) => !n)) {
              fail(`table "${tName || 'unnamed'}" must contain at least one non-empty column.`);
            }
            if (!table.rows || table.rows.length === 0) {
              fail(`table "${tName || 'unnamed'}" must contain at least one sample row.`);
            } else if (table.highlightRow !== undefined && !inRange(table.highlightRow, table.rows.length)) {
              fail(`table "${tName}" highlightRow ${table.highlightRow} is outside rows (0-${table.rows.length - 1}).`);
            }
            const colSet = new Set(colNames.filter(Boolean));
            if (tName) tableColMap.set(tName, colSet);
            if (table.highlightColumns) {
              const badCols = table.highlightColumns.filter((hc) => !colSet.has(hc));
              if (badCols.length) {
                fail(`table "${tName}" highlightColumns (${badCols.join(', ')}) do not exist in columns.`);
              }
            }
          }
          if (viz.link) {
            const { fromTable, fromColumn, toTable, toColumn } = viz.link;
            const fromCols = tableColMap.get(fromTable);
            const toCols = tableColMap.get(toTable);
            if (!fromCols) {
              fail(`viz.link.fromTable "${fromTable}" does not match any table in viz.tables.`);
            } else if (!fromCols.has(fromColumn)) {
              fail(`viz.link.fromColumn "${fromColumn}" does not exist in table "${fromTable}".`);
            }
            if (!toCols) {
              fail(`viz.link.toTable "${toTable}" does not match any table in viz.tables.`);
            } else if (!toCols.has(toColumn)) {
              fail(`viz.link.toColumn "${toColumn}" does not exist in table "${toTable}".`);
            }
          }
        }
        if (viz.framesPerStep !== undefined && (!Number.isFinite(viz.framesPerStep) || viz.framesPerStep <= 0)) {
          fail(`viz.framesPerStep (${viz.framesPerStep}) must be a positive number.`);
        }
      }
    }
    if (scene.kind === 'steps') {
      if (
        scene.steps.length === 0 ||
        scene.steps.some((s) => !(typeof s === 'string' ? s : s.text).trim())
      ) {
        fail('steps must contain at least one non-empty step.');
      }
    }
    if (scene.kind === 'compare') {
      const badSide = scene.sides.some((s) => {
        if (!s.title.trim()) return true;
        const hasCode = Boolean(s.code && s.code.trim());
        const hasItems = Boolean(s.items && s.items.length > 0);
        if (!hasCode && !hasItems) return true;
        if (s.items && s.items.some((item) => !item.trim())) return true;
        return false;
      });
      if (badSide) {
        fail('each compare side must have a non-empty title and at least one non-empty item or code snippet.');
      }
      for (const side of scene.sides) {
        if (side.progress !== undefined && (!Number.isFinite(side.progress) || side.progress < 0 || side.progress > 100)) {
          fail(`compare side progress (${side.progress}) must be a number between 0 and 100.`);
        }
      }
    }
    if (scene.kind === 'qa') {
      if (!scene.question.trim() || !scene.answer.trim()) {
        fail('question and answer must not be empty.');
      }
      if (scene.revealDelayFrames !== undefined && (!Number.isFinite(scene.revealDelayFrames) || scene.revealDelayFrames < 0)) {
        fail(`qa revealDelayFrames (${scene.revealDelayFrames}) must be a non-negative number.`);
      }
      if (scene.options !== undefined) {
        if (scene.options.length < 2 || scene.options.some((opt) => !opt.trim())) {
          fail('qa options must contain at least 2 non-empty strings.');
        } else if (scene.correctIndex !== undefined && !inRange(scene.correctIndex, scene.options.length)) {
          fail(`qa correctIndex ${scene.correctIndex} is outside options (0-${scene.options.length - 1}).`);
        }
      } else if (scene.correctIndex !== undefined) {
        fail('qa correctIndex requires options to be specified.');
      }
    }
    if (scene.kind === 'transition') {
      if (!scene.fromTitle.trim() || !scene.toTitle.trim()) {
        fail('transition fromTitle and toTitle must not be empty.');
      }
    }
    if (scene.kind === 'mythReality') {
      const mythText = typeof scene.myth === 'string' ? scene.myth : scene.myth.text;
      const realityText = typeof scene.reality === 'string' ? scene.reality : scene.reality.text;
      if (!mythText || !mythText.trim()) {
        fail('myth must contain non-empty text.');
      }
      if (!realityText || !realityText.trim()) {
        fail('reality must contain non-empty text.');
      }
      if (scene.revealDelayFrames !== undefined && (!Number.isFinite(scene.revealDelayFrames) || scene.revealDelayFrames < 0)) {
        fail(`mythReality revealDelayFrames (${scene.revealDelayFrames}) must be a non-negative number.`);
      }
    }
  }

  // Validate corrections if specified
  if (episode.corrections && episode.corrections.length > 0) {
    const correctionErrors = validateCorrections(sourceWords, episode.corrections);
    errors.push(...correctionErrors);
  }

  // Validate timeline and scene anchors if words and scenes are present and timestamps are valid
  if (errors.length === 0) {
    try {
      const correctedWords = applyCorrections(sourceWords, episode.corrections);
      const prepared: Episode = {
        ...episode,
        rawWords: sourceWords,
        words: applyGlossary(correctedWords),
      };
      resolveTimeline(prepared, FPS);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return errors;
};

/** Every episode goes through this so corrections and glossary are applied while preserving rawWords. */
export const defineEpisode = (episode: Episode): Episode => {
  const rawWords = episode.rawWords ?? episode.words;
  const correctedWords = applyCorrections(rawWords, episode.corrections);
  const words = applyGlossary(correctedWords);
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

