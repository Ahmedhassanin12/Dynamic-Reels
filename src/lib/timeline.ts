import { TIMELINE } from '../config';
import type { Episode, SceneConfig, Word } from '../types';
import { normalizeText as normalize } from './text';

export type TimelineItem = { scene: SceneConfig; from: number; durationInFrames: number };

const resolveAnchor = (scene: SceneConfig, words: Word[], searchFrom: number): number => {
  if (typeof scene.at === 'number') {
    if (scene.at < 0 || scene.at >= words.length) {
      throw new Error(`Scene "${scene.id}": word index ${scene.at} is out of range (0-${words.length - 1})`);
    }
    return scene.at;
  }
  const needle = normalize(scene.at);
  if (!needle) throw new Error(`Scene "${scene.id}": anchor "${scene.at}" has no letters or digits to match.`);

  // Exact word match first: a substring match on a short anchor (e.g. "من") could hit an earlier, unrelated word.
  const exact = words.findIndex((w, i) => i >= searchFrom && normalize(w.text) === needle);
  if (exact !== -1) return exact;

  const partial = words.findIndex((w, i) => i >= searchFrom && normalize(w.text).includes(needle));
  if (partial === -1) {
    throw new Error(`Scene "${scene.id}": no word matching "${scene.at}" after word ${searchFrom}. Check words.json.`);
  }
  console.warn(
    `Scene "${scene.id}": no exact match for "${scene.at}", using partial match "${words[partial].text}" (word ${partial}). ` +
      `Use the exact word or its index to silence this.`,
  );
  return partial;
};

export const getDurationInFrames = (episode: Episode, fps: number) =>
  Math.ceil(((episode.words.at(-1)?.end ?? 0) + TIMELINE.tailSeconds) * fps);

export const resolveTimeline = (episode: Episode, fps: number): TimelineItem[] => {
  const total = getDurationInFrames(episode, fps);
  let searchFrom = 0;

  const starts = episode.scenes.map((scene, i) => {
    const index = resolveAnchor(scene, episode.words, searchFrom);
    searchFrom = index + 1;
    const seconds = i === 0 ? 0 : Math.max(0, episode.words[index].start - TIMELINE.leadSeconds);
    return Math.round(seconds * fps);
  });

  return episode.scenes.map((scene, i) => {
    const from = starts[i];
    const durationInFrames = (starts[i + 1] ?? total) - from;
    if (durationInFrames <= 0) throw new Error(`Scene "${scene.id}" starts at or after the next scene. Check the order of "at" anchors.`);
    return { scene, from, durationInFrames };
  });
};
