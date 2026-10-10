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

/** Every episode goes through this so the glossary is applied to its words. */
export const defineEpisode = (episode: Episode): Episode => ({ ...episode, words: applyGlossary(episode.words) });
