import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FPS } from '../src/config';
import { arrayVsHashMap } from '../src/episodes/array-vs-hash-map';
import arrayWords from '../src/episodes/array-vs-hash-map/words.json';
import { eventLoop } from '../src/episodes/event-loop';
import eventLoopWords from '../src/episodes/event-loop/words.json';
import { applyGlossary, defineEpisode, validateEpisode } from '../src/lib/episode';
import { normalizeText, tokenizeNormalized } from '../src/lib/text';
import { computeBinarySearchSteps, getMinSceneFrames, resolveTimeline } from '../src/lib/timeline';
import type { Episode, SceneConfig, Word } from '../src/types';

const makeStatement = (id: string, at: SceneConfig['at'], text = 'مشهد تجريبي'): SceneConfig => ({
  id,
  kind: 'statement',
  at,
  text,
});

describe('Phase 2 — Timeline and Anchor Resolution', () => {
  describe('1. Regression: Reported Event Loop Anchor Errors (سينكرونس, الماكرو, التايمر)', () => {
    it('resolves raw Arabic anchors ("سينكرونس", "الماكرو", "التايمر") even after glossary replaces them with English terms', () => {
      const scenesWithArabicAnchors = eventLoop.scenes.map((scene) => {
        if (scene.id === 'sync-explanation') return { ...scene, at: 'سينكرونس' };
        if (scene.id === 'microtasks') return { ...scene, at: 'الماكرو' };
        if (scene.id === 'timer') return { ...scene, at: 'التايمر' };
        return scene;
      });

      const ep = defineEpisode({
        ...eventLoop,
        words: eventLoopWords,
        rawWords: undefined,
        scenes: scenesWithArabicAnchors,
      });

      const timeline = resolveTimeline(ep, FPS);

      const syncScene = timeline.find((t) => t.scene.id === 'sync-explanation')!;
      const microScene = timeline.find((t) => t.scene.id === 'microtasks')!;
      const timerScene = timeline.find((t) => t.scene.id === 'timer')!;

      // Verify exact raw word indices and timestamps from event-loop/words.json
      assert.equal(syncScene.match.rawIndex, 61);
      assert.equal(syncScene.match.startSeconds, 27.86);

      assert.equal(microScene.match.rawIndex, 74);
      assert.equal(microScene.match.startSeconds, 34.14);

      assert.equal(timerScene.match.rawIndex, 91);
      assert.equal(timerScene.match.startSeconds, 41.54);
    });

    it('resolves English glossary display anchors ("Synchronous Code", "Microtasks", "Timer Callback") to the exact same timestamps', () => {
      const timeline = resolveTimeline(eventLoop, FPS);

      const syncScene = timeline.find((t) => t.scene.id === 'sync-explanation')!;
      const microScene = timeline.find((t) => t.scene.id === 'microtasks')!;
      const timerScene = timeline.find((t) => t.scene.id === 'timer')!;

      assert.equal(syncScene.match.rawIndex, 61);
      assert.equal(syncScene.match.rawEndIndex, 62);
      assert.equal(syncScene.match.startSeconds, 27.86);
      assert.equal(syncScene.match.text, 'Synchronous Code');

      assert.equal(microScene.match.rawIndex, 74);
      assert.equal(microScene.match.rawEndIndex, 75);
      assert.equal(microScene.match.startSeconds, 34.14);
      assert.equal(microScene.match.text, 'Microtasks');

      assert.equal(timerScene.match.rawIndex, 91);
      assert.equal(timerScene.match.rawEndIndex, 93);
      assert.equal(timerScene.match.startSeconds, 41.54);
      assert.equal(timerScene.match.text, 'Timer Callback');
    });

    it('resolves multi-word Arabic phrases ("سينكرونس كود", "الماكرو تاسكس", "التايمر كول باك") identically', () => {
      const ep = defineEpisode({
        ...eventLoop,
        words: eventLoopWords,
        rawWords: undefined,
        scenes: [
          makeStatement('hook', 0),
          makeStatement('sync', 'سينكرونس كود'),
          makeStatement('micro', 'الماكرو تاسكس'),
          makeStatement('timer', 'التايمر كول باك'),
        ],
      });

      const timeline = resolveTimeline(ep, FPS);
      assert.equal(timeline[1].match.rawIndex, 61);
      assert.equal(timeline[1].match.rawEndIndex, 62);
      assert.equal(timeline[2].match.rawIndex, 74);
      assert.equal(timeline[2].match.rawEndIndex, 75);
      assert.equal(timeline[3].match.rawIndex, 91);
      assert.equal(timeline[3].match.rawEndIndex, 93);
    });

    it('resolves the event-loop "rule" scene to the 2nd occurrence of "معناها" at 55.10s (raw word 124) instead of cutting off "zero-delay" at 53.44s', () => {
      const timeline = resolveTimeline(eventLoop, FPS);
      const zeroDelay = timeline.find((t) => t.scene.id === 'zero-delay')!;
      const rule = timeline.find((t) => t.scene.id === 'rule')!;

      assert.equal(zeroDelay.match.rawIndex, 115);
      assert.equal(zeroDelay.match.rawEndIndex, 117);
      assert.equal(zeroDelay.match.startSeconds, 51.96);

      assert.equal(rule.match.rawIndex, 124);
      assert.equal(rule.match.startSeconds, 55.1);
      assert.ok(zeroDelay.durationInFrames >= 90, `Expected zero-delay duration >= 90 frames, got ${zeroDelay.durationInFrames}`);
    });
  });

  describe('2. Numeric Index Stability & Glossary Interaction', () => {
    it('preserves raw numeric word indices even when multi-word glossary entries precede them', () => {
      // In event-loop, two 4-word setTimeout entries precede raw word 43 ("النتيجة")
      // Raw index 43 is "النتيجة" (20.14s); post-glossary index 37 is "النتيجة"
      const ep = defineEpisode({
        id: 'numeric-stability',
        title: 'Numeric Stability',
        voice: null,
        words: eventLoopWords,
        scenes: [
          makeStatement('s0', 0),
          makeStatement('s1', 43), // Raw word 43: "النتيجة"
          makeStatement('s2', 61), // Raw word 61: "سينكرونس"
          makeStatement('s3', 91), // Raw word 91: "التايمر"
        ],
      });

      const timeline = resolveTimeline(ep, FPS);
      assert.equal(timeline[1].match.rawIndex, 43);
      assert.equal(timeline[1].match.rawText, 'النتيجة');
      assert.equal(timeline[1].match.startSeconds, 20.14);

      assert.equal(timeline[2].match.rawIndex, 61);
      assert.equal(timeline[2].match.rawText, 'سينكرونس');
      assert.equal(timeline[2].match.startSeconds, 27.86);

      assert.equal(timeline[3].match.rawIndex, 91);
      assert.equal(timeline[3].match.rawText, 'التايمر');
      assert.equal(timeline[3].match.startSeconds, 41.54);
    });

    it('does not apply glossary normalization twice if applyGlossary or defineEpisode is called repeatedly', () => {
      const once = applyGlossary(eventLoopWords);
      const twice = applyGlossary(once);
      assert.equal(once.length, twice.length);
      assert.deepEqual(once, twice);

      const epOnce = defineEpisode({
        id: 'idempotent',
        title: 'Idempotent',
        voice: null,
        words: arrayWords,
        scenes: arrayVsHashMap.scenes,
      });
      const epTwice = defineEpisode(epOnce);
      assert.equal(epOnce.words.length, epTwice.words.length);
      assert.equal(epOnce.rawWords?.length, arrayWords.length);
      assert.equal(epTwice.rawWords?.length, arrayWords.length);
    });
  });

  describe('3. Arabic Normalization & Mixed Text Matching', () => {
    it('normalizes Arabic alef variants, taa marbuta/haa, alef maqsura/yaa, diacritics, tatweel, and punctuation', () => {
      assert.equal(normalizeText('أَإِآٱلْـمَـدْرَسَةُ!'), normalizeText('اااالمدرسه'));
      assert.equal(normalizeText('الأَرْقَامُ'), normalizeText('الارقام'));
      assert.equal(normalizeText('عَلَى'), normalizeText('علي'));
      assert.equal(normalizeText('ثَلَاثَة'), normalizeText('ثلاثه'));
      assert.equal(normalizeText('O(1)'), 'o1');
      assert.deepEqual(tokenizeNormalized('  سينكرونس   كود! '), ['سينكرونس', 'كود']);
    });

    it('matches anchors with different Arabic spelling variants (e.g., أ/ا, ة/ه, ى/ي, harakat)', () => {
      const words: Word[] = [
        { text: 'بداية', start: 0.0, end: 0.5 },
        { text: 'الأرقام', start: 1.0, end: 1.5 },
        { text: 'النتيجة', start: 2.0, end: 2.5 },
        { text: 'على', start: 3.0, end: 3.5 },
      ];
      const ep = defineEpisode({
        id: 'norm-test',
        title: 'Norm Test',
        voice: null,
        words,
        scenes: [
          makeStatement('s1', 'بدايه'),
          makeStatement('s2', 'الارقام'),
          makeStatement('s3', 'النَّتِيجَه'),
          makeStatement('s4', 'علي'),
        ],
      });
      const timeline = resolveTimeline(ep, FPS);
      assert.deepEqual(
        timeline.map((t) => t.match.rawIndex),
        [0, 1, 2, 3],
      );
    });
  });

  describe('4. Sequential Anchors, Repeated Words & Explicit Occurrence Selection', () => {
    const repeatedWords: Word[] = [
      { text: 'مقدمة', start: 0.0, end: 0.5 },
      { text: 'كود', start: 1.0, end: 1.5 },
      { text: 'معناها', start: 2.0, end: 2.5 },
      { text: 'أول', start: 3.0, end: 3.5 },
      { text: 'معناها', start: 4.0, end: 4.5 },
      { text: 'ثاني', start: 5.0, end: 5.5 },
      { text: 'معناها', start: 6.0, end: 6.5 },
    ];

    it('selects explicit occurrence N starting from the previous scene match', () => {
      const ep = defineEpisode({
        id: 'occ-test',
        title: 'Occurrence Test',
        voice: null,
        words: repeatedWords,
        scenes: [
          makeStatement('s0', 0),
          makeStatement('s1', { text: 'معناها', occurrence: 2 }), // Matches index 4 (4.0s)
          makeStatement('s2', { text: 'معناها', occurrence: 1 }), // Matches next 'معناها' after index 4 -> index 6 (6.0s)
        ],
      });
      const timeline = resolveTimeline(ep, FPS);
      assert.equal(timeline[1].match.rawIndex, 4);
      assert.equal(timeline[1].match.startSeconds, 4.0);
      assert.equal(timeline[2].match.rawIndex, 6);
      assert.equal(timeline[2].match.startSeconds, 6.0);
    });

    it('disambiguates repeated words via multi-word phrase anchors', () => {
      const ep = defineEpisode({
        id: 'phrase-test',
        title: 'Phrase Test',
        voice: null,
        words: repeatedWords,
        scenes: [
          makeStatement('s0', 0),
          makeStatement('s1', 'معناها ثاني'), // Skips 'معناها أول' at 2..3 and matches 4..5
        ],
      });
      const timeline = resolveTimeline(ep, FPS);
      assert.equal(timeline[1].match.rawIndex, 4);
      assert.equal(timeline[1].match.rawEndIndex, 5);
    });
  });

  describe('5. Actionable Error Diagnostics & Timeline Validation', () => {
    const sampleWords: Word[] = [
      { text: 'أول', start: 0.0, end: 0.5 },
      { text: 'ثاني', start: 1.0, end: 1.5 },
      { text: 'ثالث', start: 2.0, end: 2.5 },
    ];

    it('reports earlier occurrences when a previous scene advanced past a target anchor', () => {
      const ep: Episode = {
        id: 'past-anchor',
        title: 'Past Anchor',
        voice: null,
        words: sampleWords,
        scenes: [
          makeStatement('first', 'ثالث'), // Jumps to index 2
          makeStatement('second', 'ثاني'), // Appeared at index 1!
        ],
      };
      const errors = validateEpisode(ep);
      assert.equal(errors.length, 1);
      assert.match(errors[0], /Scene "second": no word matching "ثاني"/);
      assert.match(errors[0], /appeared earlier at word 1 \("ثاني" @ 1s\)/);
    });

    it('rejects out-of-order numeric anchors', () => {
      const ep: Episode = {
        id: 'bad-num-order',
        title: 'Bad Num Order',
        voice: null,
        words: sampleWords,
        scenes: [
          makeStatement('first', 2),
          makeStatement('second', 1),
        ],
      };
      const errors = validateEpisode(ep);
      assert.equal(errors.length, 1);
      assert.match(errors[0], /Scene "second": word index 1 .* is earlier than the current search position/);
    });

    it('rejects occurrence count higher than available matches', () => {
      const ep: Episode = {
        id: 'bad-occurrence',
        title: 'Bad Occurrence',
        voice: null,
        words: sampleWords,
        scenes: [
          makeStatement('first', 0),
          makeStatement('second', { text: 'ثاني', occurrence: 2 }),
        ],
      };
      const errors = validateEpisode(ep);
      assert.equal(errors.length, 1);
      assert.match(errors[0], /requested occurrence 2 of "ثاني".*only found 1 match/);
    });

    it('validates word timestamps (negative start, end < start, non-monotonic start)', () => {
      const ep: Episode = {
        id: 'bad-timestamps',
        title: 'Bad Timestamps',
        voice: null,
        words: [
          { text: 'أول', start: -0.5, end: 0.2 },
          { text: 'ثاني', start: 2.0, end: 1.5 },
          { text: 'ثالث', start: 1.0, end: 2.5 },
        ],
        scenes: [makeStatement('hook', 0)],
      };
      const errors = validateEpisode(ep);
      assert.ok(errors.some((e) => e.includes('must be non-negative')));
      assert.ok(errors.some((e) => e.includes('end timestamp (1.5) is earlier than start (2)')));
      assert.ok(errors.some((e) => e.includes('start timestamp is earlier than previous word')));
    });

    it('validates malformed scene configs across scene kinds', () => {
      const ep: Episode = {
        id: 'bad-scenes',
        title: 'Bad Scenes',
        voice: null,
        words: sampleWords,
        scenes: [
          { id: 'dup', kind: 'statement', at: 0, text: '   ' },
          { id: 'dup', kind: 'array', at: 1, cells: ['a'], target: 3, mode: 'scan' },
          { id: 'code-bad', kind: 'code', at: 2, code: 'const x = 1;', highlightLines: [5] },
        ],
      };
      const errors = validateEpisode(ep);
      assert.ok(errors.some((e) => e.includes('text must not be empty')));
      assert.ok(errors.some((e) => e.includes('duplicate scene id')));
      assert.ok(errors.some((e) => e.includes('target 3 is outside cells')));
      assert.ok(errors.some((e) => e.includes('highlightLines 5 are outside the code')));
    });

    it('validates Batch 1 & Batch 2 visualizers (execution, eventLoop, callStack, binarySearch)', () => {
      const ep: Episode = {
        id: 'bad-viz',
        title: 'Bad Viz',
        voice: null,
        words: [
          { text: 'أول', start: 0.0, end: 0.5 },
          { text: 'ثاني', start: 1.0, end: 1.5 },
          { text: 'ثالث', start: 2.0, end: 2.5 },
          { text: 'رابع', start: 3.0, end: 3.5 },
        ],
        scenes: [
          {
            id: 'exec-bad',
            kind: 'codeDemo',
            at: 0,
            code: 'const a = 1;\nconst b = 2;',
            viz: { type: 'execution', steps: [{ line: 5, vars: { a: '1' } }] },
          },
          {
            id: 'stack-bad',
            kind: 'codeDemo',
            at: 1,
            viz: { type: 'callStack', frames: ['fact(1)'], returns: ['1', '2'] },
          },
          {
            id: 'bsearch-unsorted',
            kind: 'codeDemo',
            at: 2,
            viz: { type: 'binarySearch', cells: ['10', '5', '20'], targetIndex: 1 },
          },
          {
            id: 'bsearch-range',
            kind: 'codeDemo',
            at: 3,
            viz: { type: 'binarySearch', cells: ['2', '5', '8'], targetIndex: 9 },
          },
        ],
      };
      const errors = validateEpisode(ep);
      assert.ok(errors.some((e) => e.includes('scene "exec-bad": viz.steps line(s) 5 are outside the code')));
      assert.ok(errors.some((e) => e.includes('scene "stack-bad": viz.returns length (2) cannot exceed viz.frames length (1)')));
      assert.ok(errors.some((e) => e.includes('scene "bsearch-unsorted": viz.cells for binarySearch must be sorted')));
      assert.ok(errors.some((e) => e.includes('scene "bsearch-range": viz.targetIndex 9 is outside viz.cells')));
    });

    it('computes deterministic binary search steps and minimum scene frames for callStack and binarySearch', () => {
      const cells = ['2', '5', '8', '12', '16', '23', '38', '56', '72'];
      const steps = computeBinarySearchSteps(cells, 5); // target = '23' at index 5
      assert.equal(steps.length, 3);
      assert.deepEqual(steps.map((s) => s.mid), [4, 6, 5]);
      assert.equal(steps.at(-1)?.found, true);

      const stackFrames = getMinSceneFrames({
        id: 'stack-demo',
        kind: 'codeDemo',
        at: 0,
        skipTyping: true,
        code: 'function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }',
        viz: {
          type: 'callStack',
          frames: ['fact(3)', 'fact(2)', 'fact(1)'],
          returns: ['1', '2', '6'],
        },
      });
      assert.ok(stackFrames > 90);
    });
  });
});

