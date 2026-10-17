import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { exportSrt, exportVtt, formatTimestampSrt, formatTimestampVtt } from '../src/lib/captions';
import type { Word } from '../src/types';

describe('Phase 9 — Rendering and Publishing Workflow (Subtitle & Export Pipeline)', () => {
  describe('1. Timestamp Formatting', () => {
    it('formats SRT timestamps in HH:MM:SS,mmm format', () => {
      assert.equal(formatTimestampSrt(0), '00:00:00,000');
      assert.equal(formatTimestampSrt(1.25), '00:00:01,250');
      assert.equal(formatTimestampSrt(65.4), '00:01:05,400');
      assert.equal(formatTimestampSrt(3661.05), '01:01:01,050');
    });

    it('formats WebVTT timestamps in HH:MM:SS.mmm format', () => {
      assert.equal(formatTimestampVtt(0), '00:00:00.000');
      assert.equal(formatTimestampVtt(1.25), '00:00:01.250');
      assert.equal(formatTimestampVtt(65.4), '00:01:05.400');
      assert.equal(formatTimestampVtt(3661.05), '01:01:01.050');
    });
  });

  describe('2. Subtitle Track Export (.srt & .vtt)', () => {
    const sampleWords: Word[] = [
      { text: 'بتعمل', start: 0.2, end: 0.6 },
      { text: 'loop', start: 0.65, end: 1.1 },
      { text: 'على', start: 1.15, end: 1.4 },
      { text: '100K', start: 1.45, end: 1.9 },
      { text: 'user؟', start: 1.95, end: 2.5 },
      { text: 'عندك', start: 3.5, end: 4.0 }, // gap > 0.35s from previous word
      { text: 'Array', start: 4.05, end: 4.5 },
      { text: 'كبيرة', start: 4.55, end: 5.0 },
    ];

    it('generates valid SubRip (.srt) subtitle blocks with sequential indices', () => {
      const srt = exportSrt(sampleWords, 3, 0.35);
      assert.ok(srt.length > 0);

      const blocks = srt.trim().split('\n\n');
      assert.ok(blocks.length >= 3);

      // Block 1 check
      assert.ok(blocks[0].startsWith('1\n'));
      assert.ok(blocks[0].includes('00:00:00,200 --> 00:00:01,400'));
      assert.ok(blocks[0].includes('بتعمل loop على'));

      // Punctuation "user؟" splits or ends chunk
      assert.ok(blocks[1].startsWith('2\n'));
      assert.ok(blocks[1].includes('100K user؟'));

      // Gap > 0.35s creates a clean new chunk
      assert.ok(blocks[2].startsWith('3\n'));
      assert.ok(blocks[2].includes('00:00:03,500 --> 00:00:05,000'));
      assert.ok(blocks[2].includes('عندك Array كبيرة'));
    });

    it('generates valid WebVTT (.vtt) file beginning with WEBVTT header', () => {
      const vtt = exportVtt(sampleWords, 3, 0.35);
      assert.ok(vtt.startsWith('WEBVTT\n\n'));
      assert.ok(vtt.includes('00:00:00.200 --> 00:00:01.400'));
      assert.ok(vtt.includes('بتعمل loop على'));
    });

    it('handles empty words gracefully', () => {
      assert.equal(exportSrt([]), '');
      assert.equal(exportVtt([]), 'WEBVTT\n\n');
    });
  });
});
