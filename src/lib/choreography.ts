import { FPS, MOTION } from '../config';
import type { Episode, SceneConfig, Word } from '../types';
import { getMinSceneFrames, resolveTimeline } from './timeline';

export type EducationalArcType =
  | 'problem-solution'
  | 'runtime-mental-model'
  | 'myth-buster'
  | 'prediction-quiz'
  | 'algorithm-walkthrough';

export type SegmentRole =
  | 'hook'
  | 'problem'
  | 'concept'
  | 'demo'
  | 'comparison'
  | 'quiz'
  | 'explanation'
  | 'takeaway';

export type ScriptSegment = {
  id: string;
  role: SegmentRole;
  /** Primary learning goal of this segment */
  goal: string;
  /** Natural Egyptian Arabic narration text */
  narration: string;
  /** English technical keywords to preserve without Arabic transliteration */
  englishTerms?: string[];
  /** Proposed scene kind for this segment */
  suggestedSceneKind: SceneConfig['kind'];
  /** First word or phrase to use as anchor */
  suggestedAnchor: string;
  /** Estimated duration in seconds (based on ~2.5 words/sec) */
  estimatedDurationSec?: number;
  /** Pedagogical note or tips for audio delivery */
  deliveryNote?: string;
};

export type EducationalScript = {
  id: string;
  title: string;
  topic: string;
  targetAudience: string;
  learningObjective: string;
  goldenTakeaway: string;
  arc: EducationalArcType;
  segments: ScriptSegment[];
};

export type SpeechPacingRating = 'too-slow' | 'relaxed' | 'optimal' | 'fast' | 'too-fast';

export type ScenePacingStatus = 'rushed' | 'tight' | 'optimal' | 'stale';

export type SceneChoreographyReport = {
  sceneId: string;
  sceneKind: string;
  label?: string;
  anchorText: string;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  durationInFrames: number;
  minFramesNeeded: number;
  wordCount: number;
  wpm: number;
  pacing: ScenePacingStatus;
  note?: string;
};

export type AudioGap = {
  afterWordIndex: number;
  afterWordText: string;
  gapSeconds: number;
  startSeconds: number;
  endSeconds: number;
};

export type ChoreographyAudit = {
  episodeId: string;
  totalWords: number;
  totalDurationSeconds: number;
  overallWpm: number;
  pacingRating: SpeechPacingRating;
  scenes: SceneChoreographyReport[];
  dramaticGaps: AudioGap[];
  warnings: string[];
  recommendations: string[];
};

/** Conversational Arabic delivery averages ~140-155 words per minute on social reels */
export const ESTIMATED_WORDS_PER_SECOND = 2.4;

export const rateSpeechPacing = (wpm: number): SpeechPacingRating => {
  if (wpm < 110) return 'too-slow';
  if (wpm < 130) return 'relaxed';
  if (wpm <= 165) return 'optimal';
  if (wpm <= 185) return 'fast';
  return 'too-fast';
};

/**
 * Standard Educational Arc Blueprints for Computer Science & Software Engineering Reels.
 */
export const EDUCATIONAL_ARCS: Record<
  EducationalArcType,
  {
    title: string;
    description: string;
    recommendedScenes: SceneConfig['kind'][];
    structure: Array<{ role: SegmentRole; description: string; defaultKind: SceneConfig['kind'] }>;
  }
> = {
  'problem-solution': {
    title: 'Problem to Solution (Optimization & Refactoring)',
    description: 'Starts with a real bottleneck/pain point, reveals the optimized solution, and concludes with a decision rule.',
    recommendedScenes: ['statement', 'codeDemo', 'codeDemo', 'compare', 'statement'],
    structure: [
      { role: 'hook', description: 'Intriguing question showing the real-world problem', defaultKind: 'statement' },
      { role: 'problem', description: 'Naive / unoptimized code demonstrating the bottleneck (e.g. O(n) array scan)', defaultKind: 'codeDemo' },
      { role: 'demo', description: 'Optimized approach with live data visualizer (e.g. O(1) hash map lookup)', defaultKind: 'codeDemo' },
      { role: 'comparison', description: 'Side-by-side trade-off matrix or rule of thumb', defaultKind: 'compare' },
      { role: 'takeaway', description: 'Single golden rule to remember', defaultKind: 'statement' },
    ],
  },
  'runtime-mental-model': {
    title: 'Runtime & Mental Models (Event Loop, Memory, Async)',
    description: 'Demystifies abstract JavaScript runtime mechanics step by step.',
    recommendedScenes: ['statement', 'codeDemo', 'diagram', 'compare', 'statement'],
    structure: [
      { role: 'hook', description: 'Counter-intuitive question (e.g. setTimeout(0) vs Promise)', defaultKind: 'statement' },
      { role: 'demo', description: 'Code execution trace stepping line by line', defaultKind: 'codeDemo' },
      { role: 'concept', description: 'Runtime architecture / visualizer (Call Stack vs Microtasks vs Event Loop)', defaultKind: 'codeDemo' },
      { role: 'comparison', description: 'Key distinction or execution priority rule', defaultKind: 'compare' },
      { role: 'takeaway', description: 'Summary mental model formula', defaultKind: 'statement' },
    ],
  },
  'myth-buster': {
    title: 'Myth Buster (Debunking Misconceptions)',
    description: 'Challenges a widespread programming myth and replaces it with accurate engineering reality.',
    recommendedScenes: ['statement', 'mythReality', 'codeDemo', 'statement'],
    structure: [
      { role: 'hook', description: 'The widespread belief everyone takes for granted', defaultKind: 'statement' },
      { role: 'problem', description: 'Contrasting the Myth vs Proven Reality', defaultKind: 'mythReality' },
      { role: 'demo', description: 'Under-the-hood proof / visual inspection', defaultKind: 'codeDemo' },
      { role: 'takeaway', description: 'Actionable conclusion for daily coding', defaultKind: 'statement' },
    ],
  },
  'prediction-quiz': {
    title: 'Interactive Prediction Quiz (Engagement & Active Learning)',
    description: 'Shows a code snippet, invites the viewer to predict output, and reveals the answer with explanation.',
    recommendedScenes: ['statement', 'qa', 'codeDemo', 'statement'],
    structure: [
      { role: 'hook', description: 'Setup the question or challenge', defaultKind: 'statement' },
      { role: 'quiz', description: 'Code snippet with A/B/C options and timed answer reveal', defaultKind: 'qa' },
      { role: 'explanation', description: 'Execution breakdown explaining why the answer is correct', defaultKind: 'codeDemo' },
      { role: 'takeaway', description: 'Key rule of thumb to avoid this pitfall', defaultKind: 'statement' },
    ],
  },
  'algorithm-walkthrough': {
    title: 'Algorithm & Data Structure Walkthrough',
    description: 'Explains how a data structure or algorithm operates step-by-step.',
    recommendedScenes: ['statement', 'codeDemo', 'steps', 'codeDemo', 'statement'],
    structure: [
      { role: 'hook', description: 'Real-world use case or search challenge', defaultKind: 'statement' },
      { role: 'concept', description: 'Visual structure (e.g. linked list nodes, binary tree, sorted cells)', defaultKind: 'codeDemo' },
      { role: 'demo', description: 'Step-by-step traversal or pointer manipulation', defaultKind: 'steps' },
      { role: 'comparison', description: 'Big-O complexity comparison curve', defaultKind: 'codeDemo' },
      { role: 'takeaway', description: 'When to choose this data structure', defaultKind: 'statement' },
    ],
  },
};

/**
 * Creates a reviewable educational script template based on an educational arc.
 */
export const createScriptTemplate = (
  id: string,
  topic: string,
  learningObjective: string,
  arc: EducationalArcType = 'problem-solution',
): EducationalScript => {
  const arcDef = EDUCATIONAL_ARCS[arc];
  const segments: ScriptSegment[] = arcDef.structure.map((item, idx) => ({
    id: `seg-${idx + 1}-${item.role}`,
    role: item.role,
    goal: item.description,
    narration: '',
    suggestedSceneKind: item.defaultKind,
    suggestedAnchor: '',
    estimatedDurationSec: 6,
    deliveryNote: item.role === 'hook' ? 'High energy, direct eye contact' : item.role === 'takeaway' ? 'Deliberate, clear cadence' : undefined,
  }));

  return {
    id,
    title: topic,
    topic,
    targetAudience: 'Arabic Software Engineers & Web Developers',
    learningObjective,
    goldenTakeaway: '',
    arc,
    segments,
  };
};

/**
 * Performs a comprehensive Audio Choreography Audit on an episode:
 * - Validates scene durations against animation budgets (prevents cutoffs).
 * - Checks speaking rate (WPM) across segments.
 * - Detects dramatic audio pauses and silence gaps.
 * - Produces actionable recommendations for authors.
 */
export const analyzeChoreography = (episode: Episode, fps: number = FPS): ChoreographyAudit => {
  const words = episode.rawWords ?? episode.words;
  const timeline = resolveTimeline(episode, fps);
  const totalDurationSeconds = words.at(-1)?.end ?? 0;
  const totalWords = words.length;

  const overallWpm = totalDurationSeconds > 0 ? Math.round((totalWords / totalDurationSeconds) * 60) : 0;
  const pacingRating = rateSpeechPacing(overallWpm);

  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 1. Analyze scenes
  const scenes: SceneChoreographyReport[] = timeline.map((item, i) => {
    const { scene, from, durationInFrames, match } = item;
    const startSec = from / fps;
    const durationSec = durationInFrames / fps;
    const endSec = startSec + durationSec;

    // Count words spoken during this scene
    const sceneWords = words.filter((w) => w.start >= startSec && w.start < endSec);
    const wordCount = sceneWords.length;
    const wpm = durationSec > 0 ? Math.round((wordCount / durationSec) * 60) : 0;

    const minFramesNeeded = getMinSceneFrames(scene);

    let pacing: ScenePacingStatus = 'optimal';
    let note: string | undefined;

    if (durationInFrames < minFramesNeeded) {
      pacing = 'rushed';
      note = `Needs at least ${minFramesNeeded} frames (${(minFramesNeeded / fps).toFixed(1)}s) for animations to complete, but only has ${durationInFrames} frames (${durationSec.toFixed(1)}s).`;
      warnings.push(`Scene "${scene.id}" (${scene.kind}) is rushed: animation needs ${(minFramesNeeded / fps).toFixed(1)}s but scene only lasts ${durationSec.toFixed(1)}s.`);
    } else if (durationInFrames < minFramesNeeded + 15) {
      pacing = 'tight';
      note = 'Animation completes just in time with minimal buffer.';
    } else if (durationSec > 11.0) {
      pacing = 'stale';
      note = 'Scene on screen for over 11s. Consider splitting or adding line highlights / step progression to maintain visual interest.';
      warnings.push(`Scene "${scene.id}" may feel stale: lasts ${durationSec.toFixed(1)}s without scene transition.`);
    }

    if (wpm > 185 && durationSec > 3) {
      warnings.push(`Scene "${scene.id}" speech rate is very fast (${wpm} WPM). Technical explanation may be hard to follow.`);
    }

    return {
      sceneId: scene.id,
      sceneKind: scene.kind,
      label: scene.label,
      anchorText: match ? match.text : String(scene.at),
      startSeconds: Number(startSec.toFixed(2)),
      endSeconds: Number(endSec.toFixed(2)),
      durationSeconds: Number(durationSec.toFixed(2)),
      durationInFrames,
      minFramesNeeded,
      wordCount,
      wpm,
      pacing,
      note,
    };
  });

  // 2. Detect dramatic audio gaps / pauses between words
  const dramaticGaps: AudioGap[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const cur = words[i];
    const nxt = words[i + 1];
    const gap = nxt.start - cur.end;
    if (gap >= 0.45) {
      dramaticGaps.push({
        afterWordIndex: i,
        afterWordText: cur.text,
        gapSeconds: Number(gap.toFixed(2)),
        startSeconds: cur.end,
        endSeconds: nxt.start,
      });
    }
  }

  // 3. Overall recommendations
  if (overallWpm < 120) {
    recommendations.push('Overall speaking pace is relaxed. Good for deep concepts, but trim silences if aiming for TikTok/Reels retention.');
  } else if (overallWpm > 175) {
    recommendations.push('Overall speaking pace is very fast. Consider slowing down on code snippets and key takeaways.');
  } else {
    recommendations.push('Overall speaking pace is in the optimal range (120-165 WPM) for educational Reels.');
  }

  if (dramaticGaps.length > 0) {
    recommendations.push(
      `Detected ${dramaticGaps.length} natural speech pause(s) (>0.45s). These are ideal points for visual punchlines, code reveals, or pointer shifts.`,
    );
  }

  return {
    episodeId: episode.id,
    totalWords,
    totalDurationSeconds: Number(totalDurationSeconds.toFixed(2)),
    overallWpm,
    pacingRating,
    scenes,
    dramaticGaps,
    warnings,
    recommendations,
  };
};
