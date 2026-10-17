import { defineEpisode } from '../../lib/episode';
import voice from './voice.mp3';
import words from './words.json';

const EVENT_LOOP_CODE = `console.log(1);

setTimeout(() => {
  console.log(2);
}, 0);

Promise.resolve().then(() => {
  console.log(3);
});

console.log(4);`;

export const eventLoop = defineEpisode({
  id: 'event-loop',
  title: 'event-loop',
  voice,
  words,
  theme:"mint",
  scenes: [
    {
      id: 'hook',
      kind: 'statement',
      variant: 'hook',
      at: 0,
      text: 'لو كتبت [setTimeout] بوقت صفر... الكود هيشتغل **فورًا؟**',
      codePreview: {
        filename: 'timer.js',
        badge: '⏱ 0ms',
        code: `setTimeout(() => {\n  console.log(2);\n}, 0);`,
      },
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
      pill: 'CODE EXECUTION · TRACE',
      pillTone: 'neutral',
      language: 'javascript',
      filename: 'event-loop.js',
      code: EVENT_LOOP_CODE,
      highlightLines: [1, 3, 7, 11],
      viz: {
        type: 'execution',
        steps: [
          { line: 1, output: '1', note: 'تنفيذ مباشر على الـ Call Stack' },
          { line: 3, note: 'تسجيل الـ Timer في الـ Task Queue' },
          { line: 7, note: 'تسجيل الـ Promise في الـ Microtask Queue' },
          { line: 11, output: '4', note: 'نهاية الكود الـ Synchronous' },
        ],
      },
    },
    {
      id: 'prediction',
      kind: 'statement',
      variant: 'prediction',
      at: 'تفتكر',
      text: 'تفتكر الأرقام هتظهر **بالترتيب؟**',
    },
    {
      id: 'output',
      kind: 'qa',
      at: 'النتيجة',
      label: 'PREDICTION REVEAL',
      title: 'إيه الترتيب الصح؟',
      question: 'تفتكر الـ Console هيطبع إيه؟',
      options: ['1 → 2 → 3 → 4', '1 → 4 → 3 → 2', '2 → 3 → 1 → 4'],
      correctIndex: 1,
      revealDelayFrames: 32,
      answer: 'النتيجة الصح: 1 ثم 4 ثم 3 ثم 2',
    },
    {
      id: 'sync-explanation',
      kind: 'codeDemo',
      at: 'Synchronous Code',
      label: 'STEP 1 OF 3',
      title: 'Synchronous Code',
      pill: 'STEP 1 · CALL STACK',
      pillTone: 'neutral',
      language: 'javascript',
      filename: 'event-loop.js',
      code: EVENT_LOOP_CODE,
      skipTyping: true,
      viz: {
        type: 'eventLoop',
        steps: [
          {
            line: 1,
            stack: ['console.log(1)'],
            microtasks: [],
            tasks: [],
            output: ['1'],
            activeZone: 'stack',
            note: 'تنفيذ console.log(1) فورًا',
          },
          {
            line: 11,
            stack: ['console.log(4)'],
            microtasks: ['Promise callback'],
            tasks: ['setTimeout callback'],
            output: ['1', '4'],
            activeZone: 'stack',
            note: 'تنفيذ console.log(4) قبل أي Queue',
          },
        ],
      },
      result: '1 → 4',
    },
    {
      id: 'microtasks',
      kind: 'codeDemo',
      at: 'Microtasks',
      label: 'STEP 2 OF 3',
      title: 'Microtasks',
      pill: 'STEP 2 · MICROTASK QUEUE',
      pillTone: 'good',
      language: 'javascript',
      filename: 'event-loop.js',
      code: EVENT_LOOP_CODE,
      skipTyping: true,
      viz: {
        type: 'eventLoop',
        steps: [
          {
            line: 7,
            stack: [],
            microtasks: ['Promise callback'],
            tasks: ['setTimeout callback'],
            output: ['1', '4'],
            activeZone: 'microtask',
            note: 'الـ Call Stack فضي -> الأولوية للـ Microtasks',
          },
          {
            line: 8,
            stack: ['console.log(3)'],
            microtasks: [],
            tasks: ['setTimeout callback'],
            output: ['1', '4', '3'],
            activeZone: 'loop',
            note: 'الـ Event Loop ينقل Promise.then للـ Stack',
          },
        ],
      },
      result: 'Promise → 3',
    },
    {
      id: 'timer',
      kind: 'codeDemo',
      at: 'Timer Callback',
      label: 'STEP 3 OF 3',
      title: 'Timer Callback',
      pill: 'STEP 3 · TASK QUEUE',
      pillTone: 'neutral',
      language: 'javascript',
      filename: 'event-loop.js',
      code: EVENT_LOOP_CODE,
      skipTyping: true,
      viz: {
        type: 'eventLoop',
        steps: [
          {
            line: 3,
            stack: [],
            microtasks: [],
            tasks: ['setTimeout callback'],
            output: ['1', '4', '3'],
            activeZone: 'task',
            note: 'الـ Microtasks خلصت -> دور الـ Task Queue',
          },
          {
            line: 4,
            stack: ['console.log(2)'],
            microtasks: [],
            tasks: [],
            output: ['1', '4', '3', '2'],
            activeZone: 'loop',
            note: 'أخيرًا تنفيذ setTimeout وطباعة 2',
          },
        ],
      },
      result: '1 → 4 → 3 → 2',
    },
    {
      id: 'zero-delay',
      kind: 'statement',
      variant: 'takeaway',
      at: '0 milliseconds',
      text: '[0ms] مش معناها تنفيذ **فوري**.',
    },
    {
      id: 'rule',
      kind: 'compare',
      at: { text: 'معناها', occurrence: 2 },
      label: 'THE RULE',
      title: 'افهم ترتيب التنفيذ',
      pill: 'EXECUTION PRIORITY',
      sides: [
        {
          title: 'Synchronous',
          badge: '1st · Call Stack',
          tone: 'good',
          progress: 25,
          items: ['بيتنفذ الأول مباشرة على الـ Stack', 'يطبع 1 ثم 4'],
        },
        {
          title: 'Async Queues',
          badge: 'Microtask > Task',
          tone: 'ink',
          progress: 75,
          items: ['Promise microtask قبل timer callback', 'يطبع 3 ثم 2'],
        },
      ],
    },
    {
      id: 'outro',
      kind: 'statement',
      variant: 'takeaway',
      at: 'فهم',
      text: 'فهم الـ [Event Loop] أهم من حفظ ترتيب الـ **output**.',
    },
  ],
});
