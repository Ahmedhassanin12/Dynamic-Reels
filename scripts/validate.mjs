#!/usr/bin/env node
import { EPISODES } from '../src/episodes/index.ts';
import { formatQAReport, runEpisodeQA } from '../src/lib/qa.ts';

const args = process.argv.slice(2);

const printHelp = () => {
  console.log(`
Arabic Reel — Automated Quality Assurance & Pre-Render Verification CLI

Usage:
  npm run validate                        Audit all registered episodes
  npm run validate -- <episode-id>        Audit a specific episode
  npm run validate -- --json              Output raw JSON report

Registered Episodes:
  ${EPISODES.map((e) => `• ${e.id} (${e.title})`).join('\n  ')}
`);
};

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const isJson = args.includes('--json');
const targetId = args.find((a) => !a.startsWith('-'));

const targetEpisodes = targetId
  ? EPISODES.filter((e) => e.id === targetId)
  : EPISODES;

if (targetId && targetEpisodes.length === 0) {
  console.error(`\x1b[31mError: Episode "${targetId}" not found.\x1b[0m`);
  printHelp();
  process.exit(1);
}

const reports = targetEpisodes.map((ep) => runEpisodeQA(ep));

if (isJson) {
  console.log(JSON.stringify(reports, null, 2));
} else {
  console.log('\n\x1b[1m\x1b[35m=== ARABIC REEL — AUTOMATED QA PRE-RENDER AUDIT ===\x1b[0m\n');
  for (const report of reports) {
    console.log(formatQAReport(report));
    console.log('');
  }

  const allPassed = reports.every((r) => r.passed);
  const totalFails = reports.reduce((acc, r) => acc + r.failCount, 0);
  const totalWarns = reports.reduce((acc, r) => acc + r.warnCount, 0);

  if (allPassed) {
    console.log(`\x1b[32m✔ ALL ${reports.length} EPISODE(S) PASSED PRE-RENDER QA AUDIT (${totalWarns} warnings, 0 fatal errors).\x1b[0m\n`);
    process.exit(0);
  } else {
    console.error(`\x1b[31m✖ QA AUDIT FAILED: ${totalFails} fatal error(s) found across episodes. Fix before rendering.\x1b[0m\n`);
    process.exit(1);
  }
}
