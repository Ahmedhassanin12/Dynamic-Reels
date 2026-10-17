import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { arrayVsHashMap } from '../src/episodes/array-vs-hash-map';
import { eventLoop } from '../src/episodes/event-loop';
import { auditEpisodeAuthoring } from '../src/lib/diagnostics';
import { defineEpisode } from '../src/lib/episode';
import type { Episode } from '../src/types';

describe('Phase 7 — Preview and Authoring Experience', () => {
  describe('1. Production Episode Audits', () => {
    it('audits array-vs-hash-map without fatal anchor errors', () => {
      const result = auditEpisodeAuthoring(arrayVsHashMap);
      assert.equal(result.episodeId, 'array-vs-hash-map');
      assert.equal(result.hasErrors, false);
      assert.ok(result.timeline.length >= 4);

      // Verify all scenes have non-zero durations and valid minFramesNeeded
      for (const scene of result.timeline) {
        assert.ok(scene.durationFrames > 0);
        assert.ok(scene.minFramesNeeded > 0);
        assert.ok(['optimal', 'tight', 'stale'].includes(scene.status));
      }
    });

    it('audits event-loop without fatal anchor errors', () => {
      const result = auditEpisodeAuthoring(eventLoop);
      assert.equal(result.episodeId, 'event-loop');
      assert.equal(result.hasErrors, false);
      assert.ok(result.timeline.length >= 5);

      // Verify anchors matched valid words
      const resolvedAnchors = result.timeline.filter((s) => s.matchedWord);
      assert.ok(resolvedAnchors.length > 0);
      for (const s of resolvedAnchors) {
        assert.ok(typeof s.matchedWord?.rawIndex === 'number');
        assert.ok(s.matchedWord!.text.length > 0);
      }
    });
  });

  describe('2. Code Readability & Safe-Zone Overflow Diagnostics', () => {
    const baseEpisode: Episode = {
      id: 'test-overflow',
      title: 'Test Overflow',
      voice: 'voice.mp3',
      words: [
        { text: 'أهلاً', start: 0, end: 1 },
        { text: 'بكم', start: 1, end: 2 },
        { text: 'جميعاً', start: 2, end: 3 },
      ],
      scenes: [],
    };

    it('flags code lines longer than 44 characters as mobile readability warning', () => {
      const longLine = 'const veryLongVariableNameThatDefinitelyExceedsFortyFourChars = 100;';
      const testEp = defineEpisode({
        ...baseEpisode,
        scenes: [
          {
            id: 'code-scene',
            kind: 'code',
            at: 0,
            code: `const x = 1;\n${longLine}\nconst y = 2;`,
          },
        ],
      });

      const audit = auditEpisodeAuthoring(testEp);
      const warnings = audit.issues.filter((i) => i.category === 'code-readability' && i.message.includes('44 characters'));
      assert.ok(warnings.length >= 1);
      assert.equal(warnings[0].sceneId, 'code-scene');
      assert.equal(warnings[0].severity, 'warn');
    });

    it('flags code blocks exceeding 9 lines as mobile vertical stage overflow warning', () => {
      const tenLines = Array.from({ length: 10 }, (_, i) => `const val_${i} = ${i};`).join('\n');
      const testEp = defineEpisode({
        ...baseEpisode,
        scenes: [
          {
            id: 'long-code',
            kind: 'code',
            at: 0,
            code: tenLines,
          },
        ],
      });

      const audit = auditEpisodeAuthoring(testEp);
      const warnings = audit.issues.filter((i) => i.category === 'code-readability' && i.message.includes('9 lines'));
      assert.ok(warnings.length >= 1);
      assert.equal(warnings[0].sceneId, 'long-code');
    });

    it('passes concise code snippets without readability warnings', () => {
      const testEp = defineEpisode({
        ...baseEpisode,
        scenes: [
          {
            id: 'clean-code',
            kind: 'code',
            at: 0,
            code: `const map = new Map();\nmap.set('key', value);\nreturn map.get('key');`,
          },
        ],
      });

      const audit = auditEpisodeAuthoring(testEp);
      const codeIssues = audit.issues.filter((i) => i.category === 'code-readability');
      assert.equal(codeIssues.length, 0);
    });
  });

  describe('3. Text Length and Title Overflow Warnings', () => {
    it('flags statement scenes with more than 110 characters', () => {
      const testEp = defineEpisode({
        id: 'test-statement',
        title: 'Test',
        voice: 'voice.mp3',
        words: [{ text: 'كلمة', start: 0, end: 2 }],
        scenes: [
          {
            id: 'huge-statement',
            kind: 'statement',
            at: 0,
            text: 'هذه جملة توضيحية طويلة جداً تتعدى الحد الموصى به للمشاهد الافتتاحية في الريلز مما قد يسبب تجاوز المساحة المتاحة للشاشة العمودية',
          },
        ],
      });

      const audit = auditEpisodeAuthoring(testEp);
      const textIssues = audit.issues.filter((i) => i.category === 'text-length');
      assert.ok(textIssues.length >= 1);
      assert.ok(textIssues[0].message.includes('overflow the stage canvas'));
    });

    it('flags QA scenes with question exceeding 85 characters', () => {
      const testEp = defineEpisode({
        id: 'test-qa',
        title: 'Test QA',
        voice: 'voice.mp3',
        words: [{ text: 'سؤال', start: 0, end: 2 }],
        scenes: [
          {
            id: 'long-qa',
            kind: 'qa',
            at: 0,
            question: 'ما هي النتيجة المتوقعة لتنفيذ هذا الكود البرمجي عندما نمرر مصفوفة فارغة تماماً للدالة المسؤولة؟',
            answer: 'O(1)',
            options: ['O(1)', 'O(n)'],
            correctIndex: 0,
          },
        ],
      });

      const audit = auditEpisodeAuthoring(testEp);
      const qaIssues = audit.issues.filter((i) => i.category === 'text-length');
      assert.ok(qaIssues.length >= 1);
      assert.ok(qaIssues[0].message.includes('Long questions make option cards crowded'));
    });
  });

  describe('4. Timing Budgets & Scene Pacing Diagnostics', () => {
    it('flags rushed scenes when duration is less than minSceneFrames', () => {
      // codeDemo with steps needs >100 frames
      const testEp = defineEpisode({
        id: 'test-rushed',
        title: 'Test Rushed',
        voice: 'voice.mp3',
        words: [
          { text: 'ابدأ', start: 0, end: 0.5 },
          { text: 'التالي', start: 0.5, end: 1.0 },
        ],
        scenes: [
          {
            id: 'rushed-demo',
            kind: 'codeDemo',
            at: 0, // starts at frame 0
            code: 'const a = 1;',
            viz: { type: 'scan', cells: ['0', '1', '2'], target: 2 },
          },
          {
            id: 'next-scene',
            kind: 'statement',
            at: 'التالي', // starts at frame 15 (0.5s * 30fps), giving rushed-demo only 15 frames
            text: 'التالي',
          },
        ],
      });

      const audit = auditEpisodeAuthoring(testEp, 30);
      assert.equal(audit.hasErrors, true);
      const timingErrors = audit.issues.filter((i) => i.category === 'timing-budget' && i.severity === 'error');
      assert.ok(timingErrors.length >= 1);
      assert.equal(timingErrors[0].sceneId, 'rushed-demo');
      assert.ok(timingErrors[0].message.includes('needs at least'));
    });

    it('flags stale scenes that linger on screen for longer than 11 seconds', () => {
      const testEp = defineEpisode({
        id: 'test-stale',
        title: 'Test Stale',
        voice: 'voice.mp3',
        words: [
          { text: 'أولاً', start: 0, end: 1.0 },
          { text: 'النهاية', start: 15.0, end: 16.0 },
        ],
        scenes: [
          {
            id: 'stale-scene',
            kind: 'statement',
            at: 0,
            text: 'مشهد يبقى طويلاً',
          },
          {
            id: 'end-scene',
            kind: 'statement',
            at: 'النهاية',
            text: 'النهاية',
          },
        ],
      });

      const audit = auditEpisodeAuthoring(testEp, 30);
      const staleIssues = audit.issues.filter((i) => i.category === 'timing-budget' && i.severity === 'warn');
      assert.ok(staleIssues.length >= 1);
      assert.equal(staleIssues[0].sceneId, 'stale-scene');
      assert.ok(staleIssues[0].message.includes('stays on screen'));
    });
  });
});
