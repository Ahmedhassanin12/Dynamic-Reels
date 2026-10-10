import { defineEpisode } from '../../lib/episode';
import words from './words.json';

export const arrayVsHashMap = defineEpisode({
  id: 'array-vs-hash-map',
  title: 'Array vs Hash Map',
  voice: 'voice.mp3',
  words,
  scenes: [
    {
      id: 'hook',
      kind: 'statement',
      at: 0,
      text: 'بتعمل loop على 100K user؟',
    },
    {
      id: 'array',
      kind: 'codeDemo',
      at: 'عندك',
      label: 'ITEM 1 OF 2',
      title: 'الـ Array',
      language: 'typescript',
      filename: 'find-user.ts',
      code: `const user = users.find(\n  (u) => u.id === '42'\n);`,
      highlightLines: [2],
      viz: { type: 'scan', cells: ['0', '1', '2', '3', '4', '5', '6', '7', '8'], target: 8 },
      result: 'O(n)',
    },
    {
      id: 'hash',
      kind: 'codeDemo',
      at: 'الحل',
      label: 'ITEM 2 OF 2',
      title: 'الـ Hash Map',
      language: 'typescript',
      filename: 'users.ts',
      code: `const users = new Map<string, User>();\nusers.set('42', user);\nusers.get('42');`,
      highlightLines: [3],
      viz: { type: 'lookup', key: '42', buckets: 12, hit: 7 },
      result: 'O(1)',
    },
    {
      id: 'rule',
      kind: 'compare',
      at: 'القاعدة',
      label: 'THE RULE',
      title: 'تختار إيه؟',
      sides: [
        { title: 'Map', items: ['بتدوّر بالـ key كتير', 'محتاج سرعة'] },
        { title: 'Array', items: ['بتعمل loop على الكل', 'محتاج الترتيب'] },
      ],
    },
    {
      id: 'outro',
      kind: 'statement',
      at: 'الفيديو',
      text: 'الحلقة الجاية: Stack',
    },
  ],
});
