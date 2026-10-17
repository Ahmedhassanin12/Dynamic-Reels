#!/usr/bin/env node
import { EPISODES } from '../src/episodes/index.ts';
import { analyzeChoreography, createScriptTemplate, EDUCATIONAL_ARCS } from '../src/lib/choreography.ts';

const args = process.argv.slice(2);

const printHelp = () => {
  console.log(`
Arabic Reel — Audio Choreography & Educational Storytelling CLI

Usage:
  npm run choreograph -- <episode-id>               Audit scene durations, WPM & animation budget
  npm run choreograph -- --template <arc-type>      Generate a reviewable educational script scaffold
  npm run choreograph -- --arcs                     List available educational arc blueprints

Available Episodes:
  ${EPISODES.map((e) => `• ${e.id} (${e.title})`).join('\n  ')}

Available Educational Arcs:
  ${Object.entries(EDUCATIONAL_ARCS)
    .map(([key, arc]) => `• ${key.padEnd(24)} : ${arc.title}`)
    .join('\n  ')}
`);
};

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

if (args.includes('--arcs')) {
  console.log('\n--- Educational Storytelling Arcs ---\n');
  for (const [key, arc] of Object.entries(EDUCATIONAL_ARCS)) {
    console.log(`\x1b[1m\x1b[36m[${key}]\x1b[0m ${arc.title}`);
    console.log(`  \x1b[90m${arc.description}\x1b[0m`);
    console.log(`  Recommended Scenes: ${arc.recommendedScenes.join(' -> ')}`);
    console.log('  Segments:');
    arc.structure.forEach((s, idx) => {
      console.log(`    ${idx + 1}. \x1b[33m${s.role.padEnd(12)}\x1b[0m (${s.defaultKind}) - ${s.description}`);
    });
    console.log('');
  }
  process.exit(0);
}

const templateIdx = args.indexOf('--template');
if (templateIdx !== -1) {
  const arcType = args[templateIdx + 1] ?? 'problem-solution';
  const topicIdx = args.indexOf('--topic');
  const topic = topicIdx !== -1 ? args[topicIdx + 1] : 'New Computer Science Topic';
  const script = createScriptTemplate('new-topic', topic, `Mastering ${topic} in 60 seconds`, arcType);

  console.log('\n======================================================');
  console.log(`  EDUCATIONAL SCRIPT BLUEPRINT: ${script.title}`);
  console.log(`  Arc: ${script.arc} | Target: ${script.targetAudience}`);
  console.log('======================================================\n');
  console.log(`Learning Objective: ${script.learningObjective}\n`);
  console.log('Segments Breakdown:\n');

  script.segments.forEach((seg, i) => {
    console.log(`\x1b[1m${i + 1}. [${seg.role.toUpperCase()}] -> ${seg.suggestedSceneKind}\x1b[0m (~${seg.estimatedDurationSec}s)`);
    console.log(`   Goal: \x1b[90m${seg.goal}\x1b[0m`);
    if (seg.deliveryNote) console.log(`   Delivery Tip: \x1b[33m${seg.deliveryNote}\x1b[0m`);
    console.log('');
  });

  console.log('\x1b[32mTip: Use this scaffold to write your natural Egyptian Arabic narration before recording audio.\x1b[0m\n');
  process.exit(0);
}

const episodeId = args[0];
const episode = EPISODES.find((e) => e.id === episodeId);

if (!episode) {
  console.error(`\x1b[31mError: Episode "${episodeId}" not found.\x1b[0m`);
  console.log(`Available episodes: ${EPISODES.map((e) => e.id).join(', ')}`);
  process.exit(1);
}

const audit = analyzeChoreography(episode);

console.log('\n================================================================================');
console.log(`  AUDIO CHOREOGRAPHY AUDIT: ${episode.title} (${episode.id})`);
console.log('================================================================================\n');

console.log(`Total Duration: \x1b[1m${audit.totalDurationSeconds}s\x1b[0m (${Math.round(audit.totalDurationSeconds * 30)} frames @ 30 FPS)`);
console.log(`Total Spoken Words: \x1b[1m${audit.totalWords}\x1b[0m`);
console.log(`Speaking Rate: \x1b[1m${audit.overallWpm} WPM\x1b[0m (${audit.pacingRating.toUpperCase()})\n`);

console.log('--- SCENE CHOREOGRAPHY & TIMELINE BREAKDOWN ---');
console.log(
  'Scene ID'.padEnd(20) +
  'Kind'.padEnd(14) +
  'Time (s)'.padEnd(16) +
  'Frames'.padEnd(10) +
  'Min Need'.padEnd(10) +
  'WPM'.padEnd(8) +
  'Pacing',
);
console.log('-'.repeat(86));

for (const s of audit.scenes) {
  const timeRange = `${s.startSeconds}s - ${s.endSeconds}s`;
  const frameText = `${s.durationInFrames}`;
  const minText = `${s.minFramesNeeded}`;
  const wpmText = `${s.wpm}`;
  
  let pacingColor = '\x1b[32m'; // green
  if (s.pacing === 'rushed') pacingColor = '\x1b[31m'; // red
  else if (s.pacing === 'tight') pacingColor = '\x1b[33m'; // yellow
  else if (s.pacing === 'stale') pacingColor = '\x1b[35m'; // magenta

  console.log(
    s.sceneId.padEnd(20) +
    s.sceneKind.padEnd(14) +
    timeRange.padEnd(16) +
    frameText.padEnd(10) +
    minText.padEnd(10) +
    wpmText.padEnd(8) +
    `${pacingColor}${s.pacing.toUpperCase()}\x1b[0m`,
  );
  if (s.note) {
    console.log(`  \x1b[90m↳ ${s.note}\x1b[0m`);
  }
}

console.log('');

if (audit.dramaticGaps.length > 0) {
  console.log('--- NATURAL AUDIO PAUSES (>0.45s) ---');
  audit.dramaticGaps.slice(0, 5).forEach((gap) => {
    console.log(
      `• At ${gap.startSeconds.toFixed(2)}s: \x1b[36m${gap.gapSeconds}s silence\x1b[0m after word "${gap.afterWordText}" (ideal reveal/punchline point)`,
    );
  });
  console.log('');
}

if (audit.warnings.length > 0) {
  console.log('\x1b[33m--- WARNINGS ---\x1b[0m');
  audit.warnings.forEach((w) => console.log(`\x1b[33m⚠ ${w}\x1b[0m`));
  console.log('');
}

console.log('\x1b[32m--- RECOMMENDATIONS ---\x1b[0m');
audit.recommendations.forEach((r) => console.log(`✓ ${r}`));
console.log('\n');
