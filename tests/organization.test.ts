import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SPACING, TYPOGRAPHY } from '../src/config';
import { drawProgress, emphasisPulse, enterProgress, fadeSlide, scalePop } from '../src/lib/motion';
import { idToVariableName, isValidEpisodeId, registerEpisodeInSource } from '../src/lib/scaffold';

describe('Phase 2 — Codebase Organization & Architecture Refactoring', () => {
  describe('1. Episode Scaffolding & Identifier Hardening', () => {
    it('validates episode IDs strictly (requires starting with lowercase letter, allows digits and hyphens)', () => {
      assert.equal(isValidEpisodeId('event-loop'), true);
      assert.equal(isValidEpisodeId('array-vs-hash-map'), true);
      assert.equal(isValidEpisodeId('react-19-demo'), true);
      assert.equal(isValidEpisodeId('algo1'), true);

      // Rejects invalid identifiers
      assert.equal(isValidEpisodeId('1-intro'), false, 'cannot start with digit');
      assert.equal(isValidEpisodeId('camelCaseId'), false, 'cannot contain uppercase');
      assert.equal(isValidEpisodeId('has_underscores'), false, 'cannot contain underscores');
      assert.equal(isValidEpisodeId(''), false, 'cannot be empty');
      assert.equal(isValidEpisodeId(null as unknown as string), false, 'cannot be null');
    });

    it('converts kebab-case IDs to valid JavaScript camelCase variable names', () => {
      assert.equal(idToVariableName('event-loop'), 'eventLoop');
      assert.equal(idToVariableName('array-vs-hash-map'), 'arrayVsHashMap');
      assert.equal(idToVariableName('react-19-features'), 'react19Features');
      assert.equal(idToVariableName('simple'), 'simple');
    });

    it('robustly registers new episodes in episodes index without regex fragility', () => {
      const mockSource = `import type { Episode } from '../types';
import { arrayVsHashMap } from './array-vs-hash-map';
import { eventLoop } from './event-loop';

export const EPISODES = [arrayVsHashMap, eventLoop] satisfies Episode[];
`;

      const result = registerEpisodeInSource(mockSource, 'binary-search', 'binarySearch');

      assert.ok(result.includes("import { binarySearch } from './binary-search';"));
      assert.ok(result.includes('export const EPISODES = [arrayVsHashMap, eventLoop, binarySearch] satisfies Episode[];'));
    });

    it('rejects duplicate episode registration in episodes index', () => {
      const mockSource = `import { eventLoop } from './event-loop';
export const EPISODES = [eventLoop] satisfies Episode[];
`;
      assert.throws(() => {
        registerEpisodeInSource(mockSource, 'event-loop', 'eventLoop');
      }, /'event-loop' is already imported/);
    });
  });

  describe('2. Design Tokens & Typography Standardization', () => {
    it('provides unified TYPOGRAPHY scale with consistent hierarchy', () => {
      assert.ok(TYPOGRAPHY.hero > TYPOGRAPHY.title);
      assert.ok(TYPOGRAPHY.title > TYPOGRAPHY.heading);
      assert.ok(TYPOGRAPHY.heading > TYPOGRAPHY.subheading);
      assert.ok(TYPOGRAPHY.subheading > TYPOGRAPHY.body);
      assert.ok(TYPOGRAPHY.code > TYPOGRAPHY.codeCompact);
      assert.equal(typeof TYPOGRAPHY.hero, 'number');
      assert.equal(typeof TYPOGRAPHY.code, 'number');
    });

    it('provides unified SPACING and border radius tokens', () => {
      assert.ok(SPACING.xs < SPACING.sm);
      assert.ok(SPACING.sm < SPACING.md);
      assert.ok(SPACING.md < SPACING.lg);
      assert.ok(SPACING.lg < SPACING.xl);
      assert.equal(SPACING.cardRadius, 16);
      assert.equal(SPACING.pillRadius, 999);
      assert.equal(SPACING.cardPadding, '24px 28px');
    });
  });

  describe('3. Motion Design System Primitives', () => {
    it('computes deterministic frame-driven entrance, scale-pop, draw, and emphasis pulse states', () => {
      assert.equal(enterProgress(0, 30, 10), 0, 'before delay progress is 0');
      assert.ok(enterProgress(30, 30, 10) > 0.9, 'after delay spring converges toward 1');

      const slideStart = fadeSlide(0, 30, { delay: 10, distance: 24 });
      const slideEnd = fadeSlide(35, 30, { delay: 10, distance: 24 });
      assert.equal(slideStart.opacity, 0);
      assert.equal(slideEnd.opacity, 1);

      const popStart = scalePop(0, 30, { delay: 12, from: 0.8 });
      const popEnd = scalePop(40, 30, { delay: 12, from: 0.8 });
      assert.equal(popStart.opacity, 0);
      assert.equal(popEnd.opacity, 1);
      assert.ok(popEnd.scale > 0.98);

      assert.equal(drawProgress(5, { delay: 10, duration: 20 }), 0);
      assert.ok(drawProgress(20, { delay: 10, duration: 20 }) > 0.5);
      assert.equal(drawProgress(35, { delay: 10, duration: 20 }), 1);

      const beforePulse = emphasisPulse(5, { atFrame: 20 });
      const midPulse = emphasisPulse(28, { atFrame: 20 });
      const settledPulse = emphasisPulse(60, { atFrame: 20 });
      assert.equal(beforePulse.isActive, false);
      assert.equal(beforePulse.active, 0);
      assert.equal(midPulse.isActive, true);
      assert.ok(midPulse.pulse > 0);
      assert.equal(settledPulse.active, 1);
      assert.equal(settledPulse.pulse, 0);
    });
  });
});
