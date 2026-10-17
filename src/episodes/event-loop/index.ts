import { defineEpisode } from '../../lib/episode';
import words from './words.json';
// After recording, put voice.mp3 in this folder, then uncomment:
import voice from './voice.mp3';

export const eventLoop = defineEpisode({
  id: 'event-loop',
  title: 'event-loop',
  voice,
  words,
  
  
scenes: [
  {
    id: 'hook',
    kind: 'statement',
    at: 0,
    text: 'لو كتبت setTimeout بوقت صفر... الكود هيشتغل فورًا؟',
  },
  {
    id: 'example-intro',
    kind: 'statement',
    at: 'بص',
    text: 'بص على المثال ده.',
  },
  {
    id: 'sync-code',
    kind: 'codeDemo',
    at: 'اول',
    label: 'THE EXAMPLE',
    title: 'ترتيب التنفيذ',
    language: 'javascript',
    filename: 'event-loop.js',
    code: `console.log(1);

setTimeout(() => {
  console.log(2);
}, 0);

Promise.resolve().then(() => {
  console.log(3);
});

console.log(4);`,
    highlightLines: [1, 3, 4, 6, 7, 10],
    viz: {
      type: 'scan',
      cells: ['1', '2', '3', '4'],
      target: 0,
    },
    result: '1 → 4 → 3 → 2',
  },
  {
    id: 'prediction',
    kind: 'statement',
    at: 'تفتكر',
    text: 'تفتكر الأرقام هتظهر بالترتيب؟',
  },
  {
    id: 'output',
    kind: 'statement',
    at: 'النتيجة',
    text: 'النتيجة: 1، 4، 3، 2',
  },
  {
    id: 'sync-explanation',
    kind: 'codeDemo',
    at: 'Synchronous Code',
    label: 'STEP 1 OF 3',
    title: 'Synchronous Code',
    language: 'javascript',
    filename: 'sync.js',
    code: `console.log(1);

// Synchronous code
console.log(4);`,
    highlightLines: [1, 4],
    viz: {
      type: 'scan',
      cells: ['1', '2', '3', '4'],
      target: 3,
    },
    result: '1 → 4',
  },
  {
    id: 'microtasks',
    kind: 'codeDemo',
    at: 'Microtasks',
    label: 'STEP 2 OF 3',
    title: 'Microtasks',
    language: 'javascript',
    filename: 'promise.js',
    code: `Promise.resolve().then(() => {
  console.log(3);
});`,
    highlightLines: [1, 2],
    viz: {
      type: 'scan',
      cells: ['1', '4', '3', '2'],
      target: 2,
    },
    result: 'Promise callback → 3',
  },
  {
    id: 'timer',
    kind: 'codeDemo',
    at: 'Timer Callback',
    label: 'STEP 3 OF 3',
    title: 'Timer Callback',
    language: 'javascript',
    filename: 'timer.js',
    code: `setTimeout(() => {
  console.log(2);
}, 0);`,
    highlightLines: [1, 2, 3],
    viz: {
      type: 'scan',
      cells: ['1', '4', '3', '2'],
      target: 3,
    },
    result: 'Timer callback → 2',
  },
  {
    id: 'zero-delay',
    kind: 'statement',
    at: '0 milliseconds',
    text: 'صفر milliseconds مش معناها تنفيذ فوري.',
  },
  {
    id: 'rule',
    kind: 'compare',
    at: 'معناها',
    label: 'THE RULE',
    title: 'افهم ترتيب التنفيذ',
    sides: [
      {
        title: 'Synchronous',
        items: [
          'بيتنفذ الأول',
          '1 ثم 4',
        ],
      },
      {
        title: 'Asynchronous callbacks',
        items: [
          'Promise microtask قبل timer callback',
          '3 ثم 2',
        ],
      },
    ],
  },
  {
    id: 'outro',
    kind: 'statement',
    at: 'فهم',
    text: 'فهم الـ Event Loop أهم من حفظ ترتيب الـ output.',
  },
],

});
