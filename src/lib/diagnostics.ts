import { CAPTION, FPS, STAGE } from '../config';
import type { Episode, SceneConfig } from '../types';
import { getMinSceneFrames, resolveTimeline, type TimelineItem } from './timeline';

export type DiagnosticSeverity = 'info' | 'warn' | 'error';

export type AuthoringIssue = {
  sceneId?: string;
  severity: DiagnosticSeverity;
  category: 'code-readability' | 'text-length' | 'timing-budget' | 'anchor' | 'captions';
  message: string;
  suggestion?: string;
};

export type SceneTimingSummary = {
  sceneId: string;
  sceneKind: string;
  label?: string;
  at: string | number;
  fromFrame: number;
  durationFrames: number;
  startSeconds: number;
  endSeconds: number;
  matchedWord?: {
    rawIndex: number;
    text: string;
    rawText: string;
    startSeconds: number;
  };
  minFramesNeeded: number;
  status: 'optimal' | 'rushed' | 'tight' | 'stale';
};

export type AuthoringAuditResult = {
  episodeId: string;
  timeline: SceneTimingSummary[];
  issues: AuthoringIssue[];
  hasErrors: boolean;
  hasWarnings: boolean;
};

/**
 * Audits an episode for mobile readability, text overflow, and authoring quality.
 */
export const auditEpisodeAuthoring = (episode: Episode, fps: number = FPS): AuthoringAuditResult => {
  const issues: AuthoringIssue[] = [];
  let resolvedItems: TimelineItem[] = [];

  // 1. Resolve timeline and check anchors
  try {
    resolvedItems = resolveTimeline(episode, fps);
  } catch (err) {
    issues.push({
      severity: 'error',
      category: 'anchor',
      message: err instanceof Error ? err.message : String(err),
      suggestion: 'Check the "at" anchor spelling in words.json or use explicit occurrence { text, occurrence }',
    });
  }

  // 2. Inspect scene-by-scene timing and authoring issues
  const timeline: SceneTimingSummary[] = resolvedItems.map((item) => {
    const { scene, from, durationInFrames, match } = item;
    const minNeeded = getMinSceneFrames(scene);
    const startSec = Number((from / fps).toFixed(2));
    const endSec = Number(((from + durationInFrames) / fps).toFixed(2));

    let status: SceneTimingSummary['status'] = 'optimal';
    if (durationInFrames < minNeeded) {
      status = 'rushed';
      issues.push({
        sceneId: scene.id,
        severity: 'error',
        category: 'timing-budget',
        message: `Scene animation needs at least ${minNeeded} frames (${(minNeeded / fps).toFixed(1)}s), but only has ${durationInFrames} frames (${(durationInFrames / fps).toFixed(1)}s).`,
        suggestion: 'Move the next scene anchor later or trim animations in this scene.',
      });
    } else if (durationInFrames < minNeeded + 15) {
      status = 'tight';
    } else if (durationInFrames > fps * 11) {
      status = 'stale';
      issues.push({
        sceneId: scene.id,
        severity: 'warn',
        category: 'timing-budget',
        message: `Scene stays on screen for ${(durationInFrames / fps).toFixed(1)}s without scene transition.`,
        suggestion: 'Consider highlighting lines progressively or splitting into two consecutive scenes.',
      });
    }

    // Code readability checks
    inspectSceneCode(scene, issues);

    // Text length & overflow checks
    inspectSceneText(scene, issues);

    return {
      sceneId: scene.id,
      sceneKind: scene.kind,
      label: scene.label,
      at: typeof scene.at === 'object' ? `${scene.at.text} (#${scene.at.occurrence ?? 1})` : scene.at,
      fromFrame: from,
      durationFrames: durationInFrames,
      startSeconds: startSec,
      endSeconds: endSec,
      matchedWord: match
        ? {
            rawIndex: match.rawIndex,
            text: match.text,
            rawText: match.rawText,
            startSeconds: match.startSeconds,
          }
        : undefined,
      minFramesNeeded: minNeeded,
      status,
    };
  });

  // 3. Caption chunking readability
  const words = episode.words ?? [];
  const maxWordsPerChunk = CAPTION.wordsPerChunk;
  if (words.length > 0 && maxWordsPerChunk > 5) {
    issues.push({
      severity: 'info',
      category: 'captions',
      message: `wordsPerChunk is set to ${maxWordsPerChunk}. 2-4 words per chunk is ideal for high-impact vertical Reels.`,
      suggestion: 'Set CAPTION.wordsPerChunk between 2 and 4 in config.ts.',
    });
  }

  return {
    episodeId: episode.id,
    timeline,
    issues,
    hasErrors: issues.some((i) => i.severity === 'error'),
    hasWarnings: issues.some((i) => i.severity === 'warn'),
  };
};

const inspectSceneCode = (scene: SceneConfig, issues: AuthoringIssue[]) => {
  let codeStr: string | undefined;

  if (scene.kind === 'code' || scene.kind === 'codeDemo') {
    codeStr = scene.code;
  } else if (scene.kind === 'statement' && scene.codePreview) {
    codeStr = scene.codePreview.code;
  } else if (scene.kind === 'mythReality') {
    const mythCode = typeof scene.myth === 'object' ? scene.myth.code : undefined;
    const realityCode = typeof scene.reality === 'object' ? scene.reality.code : undefined;
    if (mythCode) checkCodeSnippet(scene.id, mythCode, 'Myth Code', issues);
    if (realityCode) checkCodeSnippet(scene.id, realityCode, 'Reality Code', issues);
    return;
  }

  if (codeStr) {
    checkCodeSnippet(scene.id, codeStr, 'Code', issues);
  }
};

const checkCodeSnippet = (sceneId: string, code: string, label: string, issues: AuthoringIssue[]) => {
  const lines = code.split('\n');

  if (lines.length > 9) {
    issues.push({
      sceneId,
      severity: 'warn',
      category: 'code-readability',
      message: `${label} has ${lines.length} lines. On vertical 9:16 mobile reels, >9 lines leaves insufficient space for visualizers or titles.`,
      suggestion: 'Trim boilerplate or split the code example across two scenes.',
    });
  }

  lines.forEach((line, idx) => {
    if (line.length > 44) {
      issues.push({
        sceneId,
        severity: 'warn',
        category: 'code-readability',
        message: `${label} line ${idx + 1} is ${line.length} characters long. Code lines longer than 44 characters risk clipping horizontally on mobile.`,
        suggestion: `Break line ${idx + 1} into shorter lines or shorten identifiers.`,
      });
    }
  });
};

const inspectSceneText = (scene: SceneConfig, issues: AuthoringIssue[]) => {
  if (scene.title && scene.title.length > 48) {
    issues.push({
      sceneId: scene.id,
      severity: 'warn',
      category: 'text-length',
      message: `Scene title is ${scene.title.length} characters long. Long titles take up vertical stage space.`,
      suggestion: 'Keep scene titles under 40 characters.',
    });
  }

  if (scene.kind === 'statement') {
    if (scene.text.length > 110) {
      issues.push({
        sceneId: scene.id,
        severity: 'warn',
        category: 'text-length',
        message: `Statement text is ${scene.text.length} characters long. Large 72px text may overflow the stage canvas.`,
        suggestion: 'Shorten statement text to under 90 characters for maximum visual punch.',
      });
    }
  }

  if (scene.kind === 'qa') {
    if (scene.question.length > 85) {
      issues.push({
        sceneId: scene.id,
        severity: 'warn',
        category: 'text-length',
        message: `Question is ${scene.question.length} characters long. Long questions make option cards crowded.`,
        suggestion: 'Keep question text under 75 characters.',
      });
    }
  }
};
