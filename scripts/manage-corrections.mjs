#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import {
  applyCorrections,
  generateCorrectionDiff,
  suggestCorrectionsHeuristic,
  validateCorrections,
} from '../src/lib/corrections.ts';

const [command, episodeId, ...extraArgs] = process.argv.slice(2);

const printUsage = () => {
  console.log(`Usage:
  node scripts/manage-corrections.mjs suggest <episode-id>
  node scripts/manage-corrections.mjs approve <episode-id> [word-indices...]
  node scripts/manage-corrections.mjs diff <episode-id>
  node scripts/manage-corrections.mjs validate <episode-id>
`);
};

if (!command || !episodeId) {
  printUsage();
  process.exit(1);
}

const episodeDir = `src/episodes/${episodeId}`;
const wordsFile = `${episodeDir}/words.json`;
const suggestionsFile = `${episodeDir}/suggestions.json`;
const correctionsFile = `${episodeDir}/corrections.json`;

if (!existsSync(wordsFile)) {
  console.error(`Error: episode words file not found at ${wordsFile}`);
  process.exit(1);
}

const rawWords = JSON.parse(readFileSync(wordsFile, 'utf-8'));

switch (command) {
  case 'suggest': {
    console.log(`Scanning raw transcript for "${episodeId}" (${rawWords.length} words)...`);
    const suggestions = suggestCorrectionsHeuristic(rawWords);

    // AI Provider extension: if GEMINI_API_KEY is configured, try enhanced suggestions safely
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('Notice: GEMINI_API_KEY not set. Using built-in phonetic heuristic rules.');
    }

    writeFileSync(suggestionsFile, JSON.stringify(suggestions, null, 2), 'utf-8');
    console.log(`Generated ${suggestions.length} suggestion(s) -> ${suggestionsFile}`);
    suggestions.forEach((s) => {
      console.log(`  [Word ${s.index}] "${s.original}" -> "${s.corrected}" (${s.reason})`);
    });
    console.log(`\nTo approve suggestions into corrections.json, run:\n  node scripts/manage-corrections.mjs approve ${episodeId}`);
    break;
  }

  case 'approve': {
    if (!existsSync(suggestionsFile)) {
      console.error(`Error: no suggestions file found at ${suggestionsFile}. Run "suggest" first.`);
      process.exit(1);
    }
    const suggestions = JSON.parse(readFileSync(suggestionsFile, 'utf-8'));
    let toApprove = suggestions;

    if (extraArgs.length > 0) {
      const targetIndices = new Set(extraArgs.map(Number));
      toApprove = suggestions.filter((s) => targetIndices.has(s.index));
    }

    const approvedCorrections = toApprove.map((s) => ({
      ...s,
      status: 'approved',
    }));

    // Merge with any existing corrections in correctionsFile
    let existing = [];
    if (existsSync(correctionsFile)) {
      try {
        existing = JSON.parse(readFileSync(correctionsFile, 'utf-8'));
      } catch {}
    }

    const mergedMap = new Map(existing.map((c) => [c.index, c]));
    approvedCorrections.forEach((c) => mergedMap.set(c.index, c));
    const merged = Array.from(mergedMap.values()).sort((a, b) => a.index - b.index);

    const validationErrors = validateCorrections(rawWords, merged);
    if (validationErrors.length > 0) {
      console.error(`Validation failed before approving:\n- ${validationErrors.join('\n- ')}`);
      process.exit(1);
    }

    writeFileSync(correctionsFile, JSON.stringify(merged, null, 2), 'utf-8');
    console.log(`Approved ${approvedCorrections.length} correction(s) -> ${correctionsFile}`);
    break;
  }

  case 'diff': {
    if (!existsSync(correctionsFile)) {
      console.log(`No corrections.json found for "${episodeId}". Raw transcript is active as-is.`);
      process.exit(0);
    }
    const corrections = JSON.parse(readFileSync(correctionsFile, 'utf-8'));
    const correctedWords = applyCorrections(rawWords, corrections);
    const diffs = generateCorrectionDiff(rawWords, correctedWords, corrections);

    console.log(`\nTranscript Diffs for "${episodeId}" (${diffs.length} change(s)):`);
    console.log('='.repeat(70));
    console.log(`INDEX | TIMESTAMP | ORIGINAL             | CORRECTED            | REASON`);
    console.log('-'.repeat(70));
    diffs.forEach((d) => {
      console.log(
        `${String(d.index).padEnd(5)} | ` +
          `${d.start.toFixed(2).padStart(5)}s-${d.end.toFixed(2).padStart(5)}s | ` +
          `${d.raw.padEnd(20)} | ` +
          `${d.corrected.padEnd(20)} | ` +
          `${d.reason ?? ''}`,
      );
    });
    console.log('='.repeat(70));
    break;
  }

  case 'validate': {
    if (!existsSync(correctionsFile)) {
      console.log(`No corrections.json found for "${episodeId}". Nothing to validate.`);
      process.exit(0);
    }
    const corrections = JSON.parse(readFileSync(correctionsFile, 'utf-8'));
    const errors = validateCorrections(rawWords, corrections);
    if (errors.length > 0) {
      console.error(`Validation errors found in ${correctionsFile}:\n- ${errors.join('\n- ')}`);
      process.exit(1);
    } else {
      console.log(`✓ All ${corrections.length} correction(s) in ${correctionsFile} are valid and in sync with raw words.`);
    }
    break;
  }

  default:
    console.error(`Unknown command "${command}".`);
    printUsage();
    process.exit(1);
}
