import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { arrayVsHashMap } from '../src/episodes/array-vs-hash-map';
import { eventLoop } from '../src/episodes/event-loop';
import {
  analyzeChoreography,
  createScriptTemplate,
  EDUCATIONAL_ARCS,
  rateSpeechPacing,
  type EducationalArcType,
} from '../src/lib/choreography';
import type { Episode } from '../src/types';

describe('Phase 6 — Content Structure and Audio Choreography', () => {
  describe('1. Educational Arc Blueprints & Script Templates', () => {
    it('defines 5 standard educational arcs with valid narrative progression', () => {
      const arcKeys: EducationalArcType[] = [
        'problem-solution',
        'runtime-mental-model',
        'myth-buster',
        'prediction-quiz',
        'algorithm-walkthrough',
      ];

      for (const key of arcKeys) {
        const arc = EDUCATIONAL_ARCS[key];
        assert.ok(arc.title.length > 0);
        assert.ok(arc.description.length > 0);
        assert.ok(arc.structure.length >= 4);

        // Every educational arc must begin with a hook and end with a takeaway
        assert.equal(arc.structure[0].role, 'hook');
        assert.equal(arc.structure.at(-1)?.role, 'takeaway');

        // All recommended scene kinds are valid strings
        for (const kind of arc.recommendedScenes) {
          assert.ok(['statement', 'code', 'codeDemo', 'array', 'compare', 'diagram', 'qa', 'steps', 'transition', 'mythReality'].includes(kind));
        }
      }
    });

    it('generates reviewable script template with educational goals and timing estimates', () => {
      const script = createScriptTemplate('react-fiber', 'React Fiber Reconciler', 'Understand how React schedules work');
      assert.equal(script.id, 'react-fiber');
      assert.equal(script.arc, 'problem-solution');
      assert.equal(script.segments.length, 5);

      assert.equal(script.segments[0].role, 'hook');
      assert.ok(script.segments[0].deliveryNote?.includes('High energy'));

      assert.equal(script.segments[4].role, 'takeaway');
      assert.ok(script.segments[4].deliveryNote?.includes('cadence'));
    });
  });

  describe('2. Speech Pacing & WPM Evaluation', () => {
    it('rates speaking rate according to educational video comprehension standards', () => {
      assert.equal(rateSpeechPacing(95), 'too-slow');
      assert.equal(rateSpeechPacing(120), 'relaxed');
      assert.equal(rateSpeechPacing(145), 'optimal');
      assert.equal(rateSpeechPacing(175), 'fast');
      assert.equal(rateSpeechPacing(195), 'too-fast');
    });
  });

  describe('3. Audio Choreography Engine & Timing Audits', () => {
    it('audits the event-loop episode and confirms optimal pacing and duration', () => {
      const audit = analyzeChoreography(eventLoop);
      assert.equal(audit.episodeId, 'event-loop');
      assert.equal(audit.pacingRating, 'optimal');
      assert.ok(audit.overallWpm >= 130 && audit.overallWpm <= 150);
      assert.equal(audit.scenes.length, eventLoop.scenes.length);

      // Verify each scene has computed timing bounds
      for (const scene of audit.scenes) {
        assert.ok(scene.durationSeconds > 0);
        assert.ok(scene.durationInFrames >= scene.minFramesNeeded);
        assert.notEqual(scene.pacing, 'rushed');
      }
    });

    it('detects stale scenes when a visualizer remains static for over 11 seconds', () => {
      const audit = analyzeChoreography(arrayVsHashMap);
      assert.equal(audit.episodeId, 'array-vs-hash-map');
      
      const staleScenes = audit.scenes.filter((s) => s.pacing === 'stale');
      assert.ok(staleScenes.length >= 1);
      assert.ok(staleScenes.some((s) => s.sceneId === 'array'));
      assert.ok(audit.warnings.some((w) => w.includes('Scene "array" may feel stale')));
    });

    it('flags rushed scenes when timeline duration is shorter than animation requirements', () => {
      const rushedEp: Episode = {
        id: 'rushed-test',
        title: 'Rushed Test',
        voice: null,
        words: [
          { text: 'أول', start: 0.0, end: 0.4 },
          { text: 'كود', start: 0.5, end: 1.0 },
          { text: 'نهاية', start: 1.2, end: 1.8 },
        ],
        scenes: [
          {
            id: 'too-fast-stack',
            kind: 'codeDemo',
            at: 0,
            code: 'function a() {\n  return 1;\n}',
            viz: {
              type: 'callStack',
              frames: ['a()', 'b()', 'c()', 'd()'],
              framesPerStep: 20, // 4 frames * 20 = 80 frames minimum
            },
          },
          {
            id: 'next-scene',
            kind: 'statement',
            at: 1, // word 1 is at 0.5s -> scene 1 only gets ~15 frames!
            text: 'كود سريع',
          },
        ],
      };

      const audit = analyzeChoreography(rushedEp);
      const rushedScene = audit.scenes.find((s) => s.sceneId === 'too-fast-stack');
      assert.ok(rushedScene);
      assert.equal(rushedScene.pacing, 'rushed');
      assert.ok(audit.warnings.some((w) => w.includes('Scene "too-fast-stack" (codeDemo) is rushed')));
    });

    it('detects natural audio gaps and silence pauses (>0.45s) for visual punchlines', () => {
      const pausedEp: Episode = {
        id: 'paused-test',
        title: 'Paused Test',
        voice: null,
        words: [
          { text: 'كلمة', start: 0.0, end: 0.5 },
          // 0.8s pause here
          { text: 'بعد', start: 1.3, end: 1.8 },
          { text: 'الوقفة', start: 1.9, end: 2.4 },
        ],
        scenes: [
          { id: 's1', kind: 'statement', at: 0, text: 'كلمة' },
        ],
      };

      const audit = analyzeChoreography(pausedEp);
      assert.equal(audit.dramaticGaps.length, 1);
      assert.equal(audit.dramaticGaps[0].afterWordText, 'كلمة');
      assert.equal(audit.dramaticGaps[0].gapSeconds, 0.8);
      assert.ok(audit.recommendations.some((r) => r.includes('natural speech pause')));
    });
  });
});
