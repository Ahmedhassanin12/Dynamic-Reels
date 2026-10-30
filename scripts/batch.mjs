// Usage: npm run batch -- <series-file> [--only <episode-id>] [--force] [--scaffold-only] [--cuda]
// For every episode listed in the series file (e.g. series/behind-the-app.json):
//   1. scaffolds src/episodes/<id> if it doesn't exist yet
//   2. runs ElevenLabs TTS      (script.txt -> voice.mp3)  if voice.mp3 is missing (or --force)
//   3. runs Whisper transcribe  (voice.mp3 -> words.json)  if it was just generated or words.json is still the placeholder
// Existing audio is never regenerated unless --force is passed, so re-running costs no extra ElevenLabs credits.
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);
const seriesFile = argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));

if (!seriesFile || !existsSync(seriesFile)) {
  console.error('Usage: npm run batch -- <series-file> [--only <id>] [--force] [--scaffold-only] [--cuda]');
  process.exit(1);
}

const series = JSON.parse(readFileSync(seriesFile, 'utf-8'));
const only = flag('only');
const episodes = series.episodes.filter((e) => !only || e.id === only);
if (episodes.length === 0) {
  console.error(only ? `Episode '${only}' is not in ${seriesFile}` : `No episodes in ${seriesFile}`);
  process.exit(1);
}

const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit' }).status === 0;
const isPlaceholderWords = (path) => {
  if (!existsSync(path)) return true;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')).length <= 1;
  } catch {
    return true;
  }
};

const failed = [];
for (const [n, { id }] of episodes.entries()) {
  const dir = `src/episodes/${id}`;
  console.log(`\n=== [${n + 1}/${episodes.length}] ${id} ===`);

  if (!existsSync(dir) && !run('node', ['scripts/new-episode.mjs', id])) {
    failed.push(id);
    continue;
  }
  if (has('scaffold-only')) continue;

  if (!existsSync(`${dir}/script.txt`)) {
    console.error(`Skipping: ${dir}/script.txt is missing`);
    failed.push(id);
    continue;
  }

  let generated = false;
  if (has('force') || !existsSync(`${dir}/voice.mp3`)) {
    if (!run('node', ['scripts/tts.mjs', id])) {
      failed.push(id);
      continue;
    }
    generated = true;
  } else {
    console.log('voice.mp3 exists, skipping TTS (use --force to regenerate)');
  }

  if (generated || isPlaceholderWords(`${dir}/words.json`)) {
    const args = ['scripts/transcribe.py', id];
    if (has('cuda')) args.push('--cuda');
    if (!run('python', args)) failed.push(id);
  } else {
    console.log('words.json exists, skipping transcription');
  }
}

console.log(failed.length ? `\nFailed: ${failed.join(', ')}` : '\nAll episodes processed.');
process.exit(failed.length ? 1 : 0);
