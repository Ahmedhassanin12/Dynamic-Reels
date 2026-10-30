import { defineEpisode } from '../../lib/episode';
import words from './words.json';
// After recording, put voice.mp3 in this folder, then uncomment:
// import voice from './voice.mp3';

export const behind05HashMap = defineEpisode({
  id: 'behind-05-hash-map',
  title: 'behind-05-hash-map',
  voice: null, // -> voice
  words,
  scenes: [{ id: 'hook', kind: 'statement', at: 0, text: 'اكتب الهوك هنا' }],
});
