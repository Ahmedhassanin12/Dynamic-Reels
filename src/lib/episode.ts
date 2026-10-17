import { DEFAULT_THEME } from '../config';
import { GLOSSARY, type GlossaryEntry } from '../glossary';
import type { Episode, Word } from '../types';
import { normalizeText } from './text';

export const applyGlossary = (words: Word[], entries: GlossaryEntry[] = GLOSSARY): Word[] => {
  const byLength = [...entries].sort((a, b) => b.say.length - a.say.length);
  const out: Word[] = [];

  for (let i = 0; i < words.length; ) {
    const hit = byLength.find((entry) =>
      entry.say.every((token, k) => words[i + k] && normalizeText(words[i + k].text) === normalizeText(token)),
    );
    if (hit) {
      out.push({ text: hit.show, start: words[i].start, end: words[i + hit.say.length - 1].end });
      i += hit.say.length;
    } else {
      out.push(words[i]);
      i += 1;
    }
  }
  return out;
};

const inRange = (value: number, length: number) => Number.isInteger(value) && value >= 0 && value < length;

/** Data mistakes the type system can't catch. Returns one message per problem. */
export const validateEpisode = (episode: Episode): string[] => {
  const errors: string[] = [];
  const seen = new Set<string>();

  if (episode.words.length === 0) errors.push('words is empty (run the transcribe script, or keep the placeholder word).');
  if (episode.scenes.length === 0) errors.push('scenes is empty.');

  for (const scene of episode.scenes) {
    const fail = (msg: string) => errors.push(`scene "${scene.id}": ${msg}`);

    if (seen.has(scene.id)) fail('duplicate scene id (ids must be unique).');
    seen.add(scene.id);

    if (scene.kind === 'array' && !inRange(scene.target, scene.cells.length)) {
      fail(`target ${scene.target} is outside cells (0-${scene.cells.length - 1}).`);
    }
    if (scene.kind === 'diagram' && scene.highlight !== undefined && !inRange(scene.highlight, scene.nodes.length)) {
      fail(`highlight ${scene.highlight} is outside nodes (0-${scene.nodes.length - 1}).`);
    }
    if ((scene.kind === 'code' || scene.kind === 'codeDemo') && scene.code) {
      const lineCount = scene.code.split('\n').length;
      const bad = (scene.highlightLines ?? []).filter((line) => !inRange(line - 1, lineCount));
      if (bad.length) fail(`highlightLines ${bad.join(', ')} are outside the code (1-${lineCount}, 1-based).`);
    }
    if (scene.kind === 'codeDemo') {
      const { viz } = scene;
      const lineCount = scene.code ? scene.code.split('\n').length : 0;
      if (viz.type === 'scan' && !inRange(viz.target, viz.cells.length)) {
        fail(`viz.target ${viz.target} is outside viz.cells (0-${viz.cells.length - 1}).`);
      }
      if (viz.type === 'lookup' && !inRange(viz.hit, viz.buckets)) {
        fail(`viz.hit ${viz.hit} is outside the buckets (0-${viz.buckets - 1}).`);
      }
      if (viz.type === 'execution') {
        if (viz.steps.length === 0) fail('viz.steps is empty.');
        if (lineCount > 0) {
          const badLines = viz.steps.map((s) => s.line).filter((l) => !inRange(l - 1, lineCount));
          if (badLines.length) fail(`viz.steps line(s) ${badLines.join(', ')} are outside the code (1-${lineCount}).`);
        }
      }
      if (viz.type === 'eventLoop') {
        if (viz.steps.length === 0) fail('viz.steps is empty.');
        if (lineCount > 0) {
          const badLines = viz.steps
            .map((s) => s.line)
            .filter((l): l is number => l !== undefined && !inRange(l - 1, lineCount));
          if (badLines.length) fail(`viz.steps line(s) ${badLines.join(', ')} are outside the code (1-${lineCount}).`);
        }
      }
    }
  }
  return errors;
};

/** Every episode goes through this so the glossary is applied to its words. */
export const defineEpisode = (episode: Episode): Episode => {
  const errors = validateEpisode(episode);
  if (errors.length) throw new Error(`Episode "${episode.id}" has ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
  return { ...episode, theme: episode.theme ?? DEFAULT_THEME, words: applyGlossary(episode.words) };
};
