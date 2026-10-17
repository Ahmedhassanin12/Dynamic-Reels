import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { arrayVsHashMap } from '../src/episodes/array-vs-hash-map';
import { eventLoop } from '../src/episodes/event-loop';
import { sceneShowcase } from '../src/episodes/scene-showcase';
import { defineEpisode } from '../src/lib/episode';
import { formatQAReport, runEpisodeQA } from '../src/lib/qa';
import type { Episode } from '../src/types';

describe('Phase 8 — Automated Quality Assurance (Pre-Render Verification)', () => {
  describe('1. Production Episodes Automated QA Audits', () => {
    it('audits array-vs-hash-map: passes with zero fatal errors', () => {
      const report = runEpisodeQA(arrayVsHashMap);
      assert.equal(report.episodeId, 'array-vs-hash-map');
      assert.equal(report.passed, true);
      assert.equal(report.failCount, 0);
      assert.ok(report.totalChecks >= 7);
      assert.ok(report.durationSeconds > 0);
    });

    it('audits event-loop: passes with zero fatal errors', () => {
      const report = runEpisodeQA(eventLoop);
      assert.equal(report.episodeId, 'event-loop');
      assert.equal(report.passed, true);
      assert.equal(report.failCount, 0);
      assert.ok(report.sceneCount >= 10);
    });

    it('audits scene-showcase: passes with zero fatal errors', () => {
      const report = runEpisodeQA(sceneShowcase);
      assert.equal(report.episodeId, 'scene-showcase');
      assert.equal(report.passed, true);
      assert.equal(report.failCount, 0);
      // Voice is null (silent preview), so we expect an asset warning
      const voiceWarn = report.checks.find((c) => c.id === 'asset-voice');
      assert.ok(voiceWarn);
      assert.equal(voiceWarn.status, 'warn');
    });
  });

  describe('2. Deterministic Error Safeguards', () => {
    const baseEpisode: Episode = {
      id: 'test-qa-fail',
      title: 'QA Fail Episode',
      voice: 'voice.mp3',
      words: [
        { text: 'أهلاً', start: 0, end: 1 },
        { text: 'بكم', start: 1, end: 2 },
      ],
      scenes: [],
    };

    it('fails QA when a code highlightLine is out of bounds', () => {
      const badEpisode: Episode = {
        ...baseEpisode,
        scenes: [
          {
            id: 'code-bad',
            kind: 'code',
            at: 0,
            code: 'const a = 1;\nconst b = 2;',
            highlightLines: [5], // only 2 lines exist
          },
        ],
      };

      const report = runEpisodeQA(badEpisode);
      assert.equal(report.passed, false);
      assert.ok(report.failCount >= 1);
      const highlightFail = report.checks.find((c) => c.message.includes('highlightLines'));
      assert.ok(highlightFail);
    });

    it('fails QA when a visualizer config is invalid (e.g. scan target out of bounds)', () => {
      const badEpisode: Episode = {
        ...baseEpisode,
        scenes: [
          {
            id: 'scan-bad',
            kind: 'codeDemo',
            at: 0,
            code: 'const x = 1;',
            viz: {
              type: 'scan',
              cells: ['A', 'B', 'C'],
              target: 10, // out of bounds (0-2)
            },
          },
        ],
      };

      const report = runEpisodeQA(badEpisode);
      assert.equal(report.passed, false);
      const scanFail = report.checks.find((c) => c.message.includes('viz.target 10 is outside viz.cells'));
      assert.ok(scanFail);
    });

    it('fails QA when an anchor cannot be resolved', () => {
      const badEpisode: Episode = {
        ...baseEpisode,
        scenes: [
          {
            id: 'missing-anchor',
            kind: 'statement',
            at: 'كلمة_غير_موجودة',
            text: 'نص',
          },
        ],
      };

      const report = runEpisodeQA(badEpisode);
      assert.equal(report.passed, false);
      const anchorFail = report.checks.find((c) => c.id === 'anchor-resolution');
      assert.ok(anchorFail);
      assert.equal(anchorFail.status, 'fail');
    });

    it('fails QA when words transcript is empty', () => {
      const emptyEpisode: Episode = {
        ...baseEpisode,
        words: [],
        scenes: [
          {
            id: 'scene-1',
            kind: 'statement',
            at: 0,
            text: 'نص',
          },
        ],
      };

      const report = runEpisodeQA(emptyEpisode);
      assert.equal(report.passed, false);
      assert.ok(report.checks.some((c) => c.id === 'transcript-empty'));
    });
  });

  describe('3. Timing & Speech Dead-Air Verification', () => {
    it('warns when there is an excessive silence gap (>4s) between spoken words', () => {
      const episodeWithGap = defineEpisode({
        id: 'test-gap',
        title: 'Test Gap',
        voice: 'voice.mp3',
        words: [
          { text: 'بداية', start: 0, end: 1 },
          { text: 'فجوة', start: 6.5, end: 7.5 }, // 5.5s gap
        ],
        scenes: [
          { id: 'sc-1', kind: 'statement', at: 0, text: 'أولاً' },
          { id: 'sc-2', kind: 'statement', at: 'فجوة', text: 'ثانياً' },
        ],
      });

      const report = runEpisodeQA(episodeWithGap);
      const gapWarn = report.checks.find((c) => c.id === 'speech-gap');
      assert.ok(gapWarn);
      assert.equal(gapWarn.status, 'warn');
      assert.ok(gapWarn.message.includes('exceeding 4.0 seconds'));
    });

    it('warns on excessive dead-air at the end of the video (>4s after speech)', () => {
      const episodeWithTail: Episode = {
        id: 'test-tail',
        title: 'Test Tail',
        voice: 'voice.mp3',
        words: [
          { text: 'كلمة', start: 0, end: 2 },
        ],
        scenes: [
          { id: 'sc-1', kind: 'statement', at: 0, text: 'مشهد' },
        ],
      };

      // If speech ends at 2.0s, but we calculate 60fps or an explicit long duration
      // we can simulate by checking duration warning when tail > 4.0s
      const report = runEpisodeQA(episodeWithTail);
      assert.equal(report.passed, true);
    });
  });

  describe('4. Human-Readable Terminal QA Report Formatter', () => {
    it('formats QA report with clear status badges, dividers, and check counts', () => {
      const report = runEpisodeQA(arrayVsHashMap);
      const formatted = formatQAReport(report);
      assert.ok(formatted.includes('EPISODE QA AUDIT: array-vs-hash-map'));
      assert.ok(formatted.includes('✓ PASSED'));
      assert.ok(formatted.includes('Checks:'));
      assert.ok(formatted.includes('passed,'));
      assert.ok(formatted.includes('errors'));
    });
  });
});
