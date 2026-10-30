import { defineEpisode } from '../../lib/episode';
import words from './words.json';
// After recording, put voice.mp3 in this folder, then uncomment:
// import voice from './voice.mp3';

export const behind10Recap = defineEpisode({
  id: 'behind-10-recap',
  title: 'behind-10-recap',
  voice: null, // -> voice
  words,
  scenes: [{ id: 'hook', kind: 'statement', at: 0, text: 'اكتب الهوك هنا' }],
});
