import { defineEpisode } from '../../lib/episode';
import words from './words.json';
// After recording, put voice.mp3 in this folder, then uncomment:
// import voice from './voice.mp3';

export const behind03Database = defineEpisode({
  id: 'behind-03-database',
  title: 'behind-03-database',
  voice: null, // -> voice
  words,
  scenes: [{ id: 'hook', kind: 'statement', at: 0, text: 'اكتب الهوك هنا' }],
});
