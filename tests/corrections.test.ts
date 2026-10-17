import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GLOSSARY, validateGlossary } from '../src/glossary';
import {
  applyCorrections,
  generateCorrectionDiff,
  suggestCorrectionsHeuristic,
  validateCorrections,
} from '../src/lib/corrections';
import { applyGlossary, defineEpisode } from '../src/lib/episode';
import { resolveTimeline } from '../src/lib/timeline';
import type { Episode, TranscriptCorrection, Word } from '../src/types';

describe('Phase 4 — Transcript and Glossary Workflow', () => {
  const sampleRawWords: Word[] = [
    { text: 'مرحبا', start: 0.1, end: 0.5 },
    { text: 'المكرو', start: 0.6, end: 1.1 },
    { text: 'تاسكس', start: 1.2, end: 1.8 },
    { text: 'في', start: 1.9, end: 2.2 },
    { text: 'بروموس', start: 2.3, end: 2.8 },
  ];

  describe('1. Raw vs Corrected vs Display-Normalized Text Layers', () => {
    it('preserves exact Whisper timestamps and leaves raw words array completely unchanged', () => {
      const rawSnapshot = JSON.parse(JSON.stringify(sampleRawWords));
      const corrections: TranscriptCorrection[] = [
        { index: 1, original: 'المكرو', corrected: 'الماكرو', status: 'approved' },
      ];

      const corrected = applyCorrections(sampleRawWords, corrections);

      // Verify raw array is not mutated
      assert.deepEqual(sampleRawWords, rawSnapshot);

      // Verify timestamp preservation
      assert.equal(corrected[1].start, 0.6);
      assert.equal(corrected[1].end, 1.1);
      assert.equal(corrected[1].text, 'الماكرو');
      assert.equal(corrected[1].rawText, 'المكرو');
      assert.equal(corrected[1].correctedText, 'الماكرو');
    });

    it('enforces explicit approval and ignores suggestions with status "suggested"', () => {
      const corrections: TranscriptCorrection[] = [
        { index: 1, original: 'المكرو', corrected: 'الماكرو', status: 'suggested' },
        { index: 4, original: 'بروموس', corrected: 'بروميس', status: 'approved' },
      ];

      const corrected = applyCorrections(sampleRawWords, corrections);

      // Word 1 was only suggested -> remains untouched
      assert.equal(corrected[1].text, 'المكرو');
      assert.equal(corrected[1].correctedText, 'المكرو');

      // Word 4 was approved -> applied
      assert.equal(corrected[4].text, 'بروميس');
      assert.equal(corrected[4].correctedText, 'بروميس');
    });

    it('distinguishes rawText, correctedText, and final glossary display text across the pipeline', () => {
      const corrections: TranscriptCorrection[] = [
        { index: 1, original: 'المكرو', corrected: 'الماكرو', status: 'approved' },
      ];

      const corrected = applyCorrections(sampleRawWords, corrections);
      const display = applyGlossary(corrected);

      // Word 1 & 2 ("الماكرو تاسكس") combine into glossary term "Microtasks"
      const microtaskWord = display[1];
      assert.equal(microtaskWord.text, 'Microtasks'); // display text
      assert.equal(microtaskWord.rawText, 'المكرو تاسكس'); // original raw text
      assert.equal(microtaskWord.correctedText, 'الماكرو تاسكس'); // corrected text
      assert.equal(microtaskWord.start, 0.6);
      assert.equal(microtaskWord.end, 1.8);
    });
  });

  describe('2. Transcript Drift Detection & Safety Validation', () => {
    it('detects transcript drift when raw word text does not match correction original', () => {
      const driftedCorrections: TranscriptCorrection[] = [
        { index: 1, original: 'كلمة_مختلفة', corrected: 'الماكرو', status: 'approved' },
      ];

      const errors = validateCorrections(sampleRawWords, driftedCorrections);
      assert.equal(errors.length, 1);
      assert.ok(errors[0].includes('failed drift validation'));
      assert.ok(errors[0].includes('expected original "كلمة_مختلفة"'));
      assert.ok(errors[0].includes('found raw transcript word "المكرو"'));

      assert.throws(() => {
        applyCorrections(sampleRawWords, driftedCorrections);
      }, /failed drift validation/);
    });

    it('rejects out-of-range indices and duplicate indices', () => {
      const invalidCorrections: TranscriptCorrection[] = [
        { index: 99, original: 'أي', corrected: 'تصحيح', status: 'approved' },
        { index: 1, original: 'المكرو', corrected: 'تصحيح1', status: 'approved' },
        { index: 1, original: 'المكرو', corrected: 'تصحيح2', status: 'approved' },
      ];

      const errors = validateCorrections(sampleRawWords, invalidCorrections);
      assert.ok(errors.some((e) => e.includes('Correction index 99 is out of range')));
      assert.ok(errors.some((e) => e.includes('Duplicate correction for word index 1')));
    });

    it('computes human-readable diff of changes', () => {
      const corrections: TranscriptCorrection[] = [
        { index: 1, original: 'المكرو', corrected: 'الماكرو', status: 'approved', reason: 'Vowel fix' },
      ];
      const corrected = applyCorrections(sampleRawWords, corrections);
      const diff = generateCorrectionDiff(sampleRawWords, corrected, corrections);

      assert.equal(diff.length, 1);
      assert.equal(diff[0].index, 1);
      assert.equal(diff[0].raw, 'المكرو');
      assert.equal(diff[0].corrected, 'الماكرو');
      assert.equal(diff[0].reason, 'Vowel fix');
    });

    it('generates heuristic suggestions for known phonetic ASR mistakes', () => {
      const suggestions = suggestCorrectionsHeuristic(sampleRawWords);
      assert.ok(suggestions.length >= 2);
      assert.ok(suggestions.some((s) => s.original === 'المكرو' && s.corrected === 'الماكرو'));
      assert.ok(suggestions.some((s) => s.original === 'بروموس' && s.corrected === 'بروميس'));
      assert.ok(suggestions.every((s) => s.status === 'suggested'));
    });
  });

  describe('3. Glossary Audit, Prioritization & Definite Article Variants', () => {
    it('validates current project GLOSSARY integrity with zero conflicts', () => {
      const errors = validateGlossary(GLOSSARY);
      assert.deepEqual(errors, []);
    });

    it('detects conflicting glossary entries that map the same phrase to different shows', () => {
      const conflicting = [
        { say: ['هاش', 'ماب'], show: 'Hash Map' },
        { say: ['هاش', 'ماب'], show: 'HashMap' },
      ];
      const errors = validateGlossary(conflicting);
      assert.equal(errors.length, 1);
      assert.ok(errors[0].includes('Glossary conflict for pattern [هاش, ماب]'));
    });

    it('prioritizes multi-word glossary terms ("هاش ماب" -> "Hash Map") over single-word tokens ("هاش" -> "hash", "ماب" -> "Map")', () => {
      const words: Word[] = [
        { text: 'هاش', start: 0.1, end: 0.4 },
        { text: 'ماب', start: 0.5, end: 0.9 },
      ];
      const display = applyGlossary(words);
      assert.equal(display.length, 1);
      assert.equal(display[0].text, 'Hash Map');
    });

    it('normalizes definite article loanwords ("الاراي" -> "Array", "الستاك" -> "Stack")', () => {
      const words: Word[] = [
        { text: 'الاراي', start: 0.1, end: 0.5 },
        { text: 'الستاك', start: 0.6, end: 1.0 },
      ];
      const display = applyGlossary(words);
      assert.equal(display[0].text, 'Array');
      assert.equal(display[1].text, 'Stack');
    });
  });

  describe('4. Full Episode Integration & Anchor Matching Against Corrected Text', () => {
    it('applies corrections inside defineEpisode and resolves anchors against corrected text', () => {
      const ep = defineEpisode({
        id: 'corr-integration-test',
        title: 'Correction Integration Test',
        voice: null,
        words: sampleRawWords,
        corrections: [
          { index: 4, original: 'بروموس', corrected: 'بروميس', status: 'approved' },
        ],
        scenes: [
          { id: 's0', kind: 'statement', at: 0, text: 'مرحبا' },
          { id: 's1', kind: 'statement', at: 'بروميس', text: 'شرح البروميس' }, // Matches correctedText!
        ],
      });

      const timeline = resolveTimeline(ep, 30);
      assert.equal(timeline.length, 2);
      assert.equal(timeline[1].match.rawIndex, 4);
      assert.equal(timeline[1].match.startSeconds, 2.3);
    });

    it('fails validateEpisode if corrections have drift or invalid indices', () => {
      const badEp: Episode = {
        id: 'bad-corr-ep',
        title: 'Bad Corr Episode',
        voice: null,
        words: sampleRawWords,
        corrections: [
          { index: 99, original: 'خطأ', corrected: 'تصحيح', status: 'approved' },
        ],
        scenes: [{ id: 's0', kind: 'statement', at: 0, text: 'مشهد' }],
      };

      assert.throws(() => {
        defineEpisode(badEp);
      }, /Correction index 99 is out of range/);
    });
  });
});
