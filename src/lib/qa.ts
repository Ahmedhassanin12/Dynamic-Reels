import { CHARACTER, FPS, THEMES, TIMELINE } from '../config';
import type { Episode } from '../types';
import { auditEpisodeAuthoring } from './diagnostics';
import { validateEpisode } from './episode';
import { getDurationInFrames, resolveTimeline, type TimelineItem } from './timeline';

export type QASeverity = 'pass' | 'warn' | 'fail';

export type QACheck = {
  id: string;
  category: 'schema' | 'timestamps' | 'anchors' | 'scenes' | 'assets' | 'duration' | 'mobile-bounds';
  name: string;
  status: QASeverity;
  message: string;
  details?: unknown;
};

export type EpisodeQAReport = {
  episodeId: string;
  title: string;
  passed: boolean;
  totalChecks: number;
  failCount: number;
  warnCount: number;
  passCount: number;
  checks: QACheck[];
  durationSeconds: number;
  durationFrames: number;
  sceneCount: number;
};

/**
 * Runs a deterministic, comprehensive automated quality assurance audit
 * on an episode before rendering.
 */
export const runEpisodeQA = (episode: Episode, fps: number = FPS): EpisodeQAReport => {
  const checks: QACheck[] = [];

  const addPass = (id: string, category: QACheck['category'], name: string, message: string) => {
    checks.push({ id, category, name, status: 'pass', message });
  };

  const addWarn = (id: string, category: QACheck['category'], name: string, message: string, details?: unknown) => {
    checks.push({ id, category, name, status: 'warn', message, details });
  };

  const addFail = (id: string, category: QACheck['category'], name: string, message: string, details?: unknown) => {
    checks.push({ id, category, name, status: 'fail', message, details });
  };

  // 1. Schema & Episode Integrity
  const schemaErrors = validateEpisode(episode);
  if (schemaErrors.length === 0) {
    addPass('schema-integrity', 'schema', 'Episode Schema & Configuration', 'Episode structure, scenes, and visualizers passed validation.');
  } else {
    for (const err of schemaErrors) {
      addFail('schema-error', 'schema', 'Episode Schema Error', err);
    }
  }

  // 1b. Theme validity
  if (episode.theme && !THEMES[episode.theme]) {
    addFail(
      'theme-validity',
      'schema',
      'Theme Verification',
      `Theme "${episode.theme}" is not defined in THEMES (${Object.keys(THEMES).join(', ')}).`,
    );
  } else {
    addPass('theme-validity', 'schema', 'Theme Verification', `Theme "${episode.theme ?? 'default'}" is valid.`);
  }

  // 2. Transcripts & Timestamps
  const words = episode.words ?? [];
  if (words.length === 0) {
    addFail('transcript-empty', 'timestamps', 'Transcript Availability', 'Episode has no transcript words.');
  } else {
    addPass('transcript-presence', 'timestamps', 'Transcript Availability', `Transcript contains ${words.length} synchronized words.`);

    // Check for extreme audio gaps (> 4.0 seconds silence)
    const longGaps: { fromWord: string; toWord: string; gapSec: number }[] = [];
    for (let i = 1; i < words.length; i++) {
      const gap = words[i].start - words[i - 1].end;
      if (gap > 4.0) {
        longGaps.push({
          fromWord: words[i - 1].text,
          toWord: words[i].text,
          gapSec: Number(gap.toFixed(2)),
        });
      }
    }
    if (longGaps.length > 0) {
      addWarn(
        'speech-gap',
        'timestamps',
        'Excessive Speech Silence Gap',
        `Found ${longGaps.length} silence pause(s) exceeding 4.0 seconds. May cause visual dead air.`,
        longGaps,
      );
    } else {
      addPass('speech-gap', 'timestamps', 'Speech Continuity', 'Speech flow has natural pauses without excessive dead air.');
    }
  }

  // 3. Anchor Resolution & Timeline Continuity
  let timelineItems: TimelineItem[] = [];
  try {
    timelineItems = resolveTimeline(episode, fps);
    addPass(
      'anchor-resolution',
      'anchors',
      'Timeline Anchor Resolution',
      `Successfully resolved all ${timelineItems.length} scenes to monotonic timestamps.`,
    );
  } catch (err) {
    addFail(
      'anchor-resolution',
      'anchors',
      'Timeline Anchor Resolution',
      err instanceof Error ? err.message : String(err),
    );
  }

  // 4. Asset Verification
  checkAssets(episode, addPass, addWarn, addFail);

  // 5. Audio / Video Duration Mismatch & Dead Air
  const totalFrames = getDurationInFrames(episode, fps);
  const totalSeconds = Number((totalFrames / fps).toFixed(2));
  const lastWord = words.at(-1);

  if (lastWord) {
    const speechEnd = lastWord.end;
    const postSpeechTail = totalSeconds - speechEnd;
    if (postSpeechTail > 4.0) {
      addWarn(
        'duration-dead-air',
        'duration',
        'Post-Narration Dead Air',
        `Video duration (${totalSeconds}s) extends ${postSpeechTail.toFixed(1)}s past the last voiceover word (${speechEnd}s). Keep tail within 1-2s.`,
      );
    } else {
      addPass('duration-tail', 'duration', 'Video Tail Alignment', `Video concludes ${postSpeechTail.toFixed(1)}s after final voiceover word.`);
    }
  }

  // 6. Authoring, Mobile Bounds & Readability Diagnostics
  const authoring = auditEpisodeAuthoring(episode, fps);
  for (const issue of authoring.issues) {
    if (issue.severity === 'error') {
      addFail(
        `authoring-${issue.category}`,
        issue.category === 'timing-budget' ? 'duration' : 'mobile-bounds',
        `Authoring ${issue.category.toUpperCase()}`,
        `${issue.sceneId ? `[Scene ${issue.sceneId}] ` : ''}${issue.message}`,
      );
    } else if (issue.severity === 'warn') {
      addWarn(
        `authoring-${issue.category}`,
        issue.category === 'timing-budget' ? 'duration' : 'mobile-bounds',
        `Authoring ${issue.category.toUpperCase()}`,
        `${issue.sceneId ? `[Scene ${issue.sceneId}] ` : ''}${issue.message}`,
      );
    }
  }

  const failCount = checks.filter((c) => c.status === 'fail').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const passCount = checks.filter((c) => c.status === 'pass').length;

  return {
    episodeId: episode.id,
    title: episode.title,
    passed: failCount === 0,
    totalChecks: checks.length,
    failCount,
    warnCount,
    passCount,
    checks,
    durationSeconds: totalSeconds,
    durationFrames: totalFrames,
    sceneCount: episode.scenes.length,
  };
};

/** Checks assets on disk when running in Node.js environments. */
const checkAssets = (
  episode: Episode,
  addPass: (id: string, category: QACheck['category'], name: string, message: string) => void,
  addWarn: (id: string, category: QACheck['category'], name: string, message: string, details?: unknown) => void,
  addFail: (id: string, category: QACheck['category'], name: string, message: string, details?: unknown) => void,
) => {
  // Check Character Avatar Asset
  if (CHARACTER.src) {
    // If in Node.js environment with fs available
    try {
      // Dynamic check for node environment
      if (typeof process !== 'undefined' && process.versions?.node) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = typeof require !== 'undefined' ? require('node:fs') : null;
        if (fs) {
          const charPath = `public/${CHARACTER.src}`;
          if (fs.existsSync(charPath)) {
            addPass('asset-character', 'assets', 'Character Avatar Asset', `Character graphic verified at ${charPath}.`);
          } else {
            addFail(
              'asset-character',
              'assets',
              'Character Avatar Asset',
              `Character file "${charPath}" does not exist in the public directory.`,
            );
          }
        }
      }
    } catch {
      // In browser bundler runtime, skip disk check
    }
  }

  // Check Voice Asset
  if (episode.voice === null) {
    addWarn(
      'asset-voice',
      'assets',
      'Audio Voice Asset',
      `Episode has voice: null (silent preview). For final production render, add voice.mp3.`,
    );
  } else if (typeof episode.voice === 'string' && episode.voice.length > 0) {
    addPass('asset-voice', 'assets', 'Audio Voice Asset', `Voice audio asset is configured (${episode.voice.slice(0, 30)}...).`);
  } else {
    addFail('asset-voice', 'assets', 'Audio Voice Asset', 'Voice asset is invalid.');
  }
};

/** Formats an EpisodeQAReport for human-readable terminal display. */
export const formatQAReport = (report: EpisodeQAReport): string => {
  const statusBadge = report.passed ? '✓ PASSED' : '✗ FAILED';
  const divider = '─'.repeat(72);
  const lines: string[] = [
    divider,
    `  EPISODE QA AUDIT: ${report.episodeId} [${statusBadge}]`,
    `  Title: ${report.title} | Scenes: ${report.sceneCount} | Duration: ${report.durationSeconds}s (${report.durationFrames}f)`,
    `  Checks: ${report.totalChecks} total (${report.passCount} passed, ${report.warnCount} warnings, ${report.failCount} errors)`,
    divider,
  ];

  for (const check of report.checks) {
    let icon = '✔';
    if (check.status === 'fail') icon = '✖';
    if (check.status === 'warn') icon = '⚠';

    lines.push(`  ${icon} [${check.category.toUpperCase()}] ${check.name}: ${check.message}`);
  }

  lines.push(divider);
  return lines.join('\n');
};
