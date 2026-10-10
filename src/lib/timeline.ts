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
  const index = words.findIndex((w, i) => i >= searchFrom && normalize(w.text).includes(needle));
  if (index === -1) {
    throw new Error(`Scene "${scene.id}": no word matching "${scene.at}" after word ${searchFrom}. Check words.json.`);
  }
  return index;
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
