#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { EPISODES } from '../src/episodes/index.ts';
import { exportSrt, exportVtt } from '../src/lib/captions.ts';
import { formatQAReport, runEpisodeQA } from '../src/lib/qa.ts';

const args = process.argv.slice(2);

const printHelp = () => {
  console.log(`
Arabic Reel — Production Video Rendering & Export CLI

Usage:
  npm run render -- <episode-id>                   Render full production video (1080x1920, 30fps)
  npm run render -- <episode-id> --preview         Render fast draft preview (540x960, fast CRF)
  npm run render -- <episode-id> --scene <scene>   Render isolated single scene
  npm run render -- <episode-id> --still <frame>   Render still frame PNG
  npm run render -- <episode-id> --subtitles-only  Export .srt and .vtt subtitle tracks only
  npm run render -- <episode-id> --skip-qa         Bypass pre-render QA gate

Available Episodes:
  ${EPISODES.map((e) => `• ${e.id} (${e.title})`).join('\n  ')}
`);
};

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const isPreview = args.includes('--preview');
const isSubtitlesOnly = args.includes('--subtitles-only');
const isSkipQa = args.includes('--skip-qa');
const sceneIdx = args.indexOf('--scene');
const targetScene = sceneIdx !== -1 ? args[sceneIdx + 1] : undefined;
const stillIdx = args.indexOf('--still');
const isStill = stillIdx !== -1;
const stillFrame = isStill ? (args[stillIdx + 1] && !args[stillIdx + 1].startsWith('-') ? args[stillIdx + 1] : '30') : undefined;

// First positional argument that isn't a flag
const episodeId = args.find((a) => !a.startsWith('-'));

const episode = EPISODES.find((e) => e.id === episodeId);
if (!episode) {
  console.error(`\x1b[31mError: Episode "${episodeId}" not found.\x1b[0m`);
  printHelp();
  process.exit(1);
}

console.log('\n\x1b[1m\x1b[36m======================================================\x1b[0m');
console.log(`  ARABIC REEL EXPORT PIPELINE: ${episode.id} (${episode.title})`);
console.log('\x1b[1m\x1b[36m======================================================\x1b[0m\n');

// 1. Pre-Render QA Gate
if (!isSkipQa) {
  console.log('Running Pre-Render Quality Assurance audit...');
  const qaReport = runEpisodeQA(episode);
  if (!qaReport.passed) {
    console.error('\n\x1b[31m✖ PRE-RENDER QA AUDIT FAILED:\x1b[0m\n');
    console.error(formatQAReport(qaReport));
    console.error('\n\x1b[31mFix the fatal error(s) above or pass --skip-qa to force render.\x1b[0m\n');
    process.exit(1);
  }
  console.log(`\x1b[32m✔ Pre-render QA passed (${qaReport.passCount} passed, ${qaReport.warnCount} warnings).\x1b[0m\n`);
}

// 2. Setup Output Directory
const outDir = resolve(`out/${episode.id}`);
mkdirSync(outDir, { recursive: true });

// 3. Subtitles Generation (SRT & VTT)
if (episode.words && episode.words.length > 0) {
  const srtContent = exportSrt(episode.words);
  const vttContent = exportVtt(episode.words);
  const srtPath = `${outDir}/${episode.id}.srt`;
  const vttPath = `${outDir}/${episode.id}.vtt`;

  writeFileSync(srtPath, srtContent, 'utf-8');
  writeFileSync(vttPath, vttContent, 'utf-8');
  console.log(`\x1b[32m✔ Exported Subtitles:\x1b[0m`);
  console.log(`  • SRT: ${srtPath}`);
  console.log(`  • VTT: ${vttPath}\n`);

  if (isSubtitlesOnly) {
    console.log('Subtitles export complete.');
    process.exit(0);
  }
}

// 4. Determine Composition & Output Path
let compositionId = episode.id;
let outputPath = `${outDir}/${episode.id}${isPreview ? '-preview' : ''}.mp4`;

if (targetScene) {
  compositionId = `${episode.id}--${targetScene}`;
  outputPath = `${outDir}/${episode.id}-${targetScene}.mp4`;
}

if (isStill) {
  outputPath = `${outDir}/${episode.id}-frame-${stillFrame}.png`;
}

// 5. Construct Remotion Command
const remotionArgs = isStill
  ? [
      'still',
      compositionId,
      outputPath,
      `--frame=${stillFrame}`,
      '--overwrite',
    ]
  : [
      'render',
      'src/index.ts',
      compositionId,
      outputPath,
      '--codec=h264',
      '--audio-codec=aac',
      '--pixel-format=yuv420p',
      '--overwrite',
      isPreview ? '--scale=0.5' : '--scale=1',
      isPreview ? '--crf=28' : '--crf=18',
    ];

const commandStr = `npx remotion ${remotionArgs.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' ')}`;
console.log(`Executing Remotion command:`);
console.log(`${commandStr}\n`);

const startTime = Date.now();
const result = spawnSync(commandStr, {
  stdio: 'inherit',
  shell: true,
});

const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

// 6. Post-Render Verification
if (result.status !== 0) {
  console.error(`\n\x1b[31m✖ Render failed with status code ${result.status}.\x1b[0m`);
  process.exit(result.status ?? 1);
}

if (!existsSync(outputPath)) {
  console.error(`\n\x1b[31m✖ Post-render check failed: Output file "${outputPath}" does not exist.\x1b[0m`);
  process.exit(1);
}

const stats = statSync(outputPath);
if (stats.size === 0) {
  console.error(`\n\x1b[31m✖ Post-render check failed: Output file "${outputPath}" is empty (0 bytes).\x1b[0m`);
  process.exit(1);
}

const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log('\n\x1b[1m\x1b[32m======================================================\x1b[0m');
console.log(`  RENDER COMPLETE & VERIFIED`);
console.log(`  File: ${outputPath} (${sizeMB} MB)`);
console.log(`  Time Elapsed: ${elapsedSeconds}s`);
console.log('\x1b[1m\x1b[32m======================================================\x1b[0m\n');
