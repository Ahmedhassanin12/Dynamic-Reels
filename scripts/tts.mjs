// Usage: npm run tts -- <episode-id> [--voice <voiceId>] [--model <modelId>]
// Reads  src/episodes/<id>/script.txt  (the voiceover text)
// Writes src/episodes/<id>/voice.mp3   (ElevenLabs text-to-speech)
// Config comes from .env (see .env.example): ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

// Minimal .env loader (no extra dependency). Real environment variables win.
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const episode = argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));

if (!episode) {
  console.error('Usage: npm run tts -- <episode-id> [--voice <voiceId>] [--model <modelId>]');
  process.exit(1);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = flag('voice') ?? process.env.ELEVENLABS_VOICE_ID;
const model = flag('model') ?? process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';

if (!apiKey) {
  console.error('Missing ELEVENLABS_API_KEY. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (!voiceId) {
  console.error('Missing voice id. Set ELEVENLABS_VOICE_ID in .env or pass --voice <voiceId>.');
  process.exit(1);
}

const dir = `src/episodes/${episode}`;
const scriptPath = `${dir}/script.txt`;
if (!existsSync(scriptPath)) {
  console.error(`Script not found: ${scriptPath} (put the voiceover text there)`);
  process.exit(1);
}
const text = readFileSync(scriptPath, 'utf-8').trim();
if (!text) {
  console.error(`${scriptPath} is empty`);
  process.exit(1);
}

console.log(`ElevenLabs TTS: ${text.length} chars, model=${model}, voice=${voiceId}`);
const res = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
  {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
    }),
  },
);

if (!res.ok) {
  console.error(`ElevenLabs error ${res.status}: ${await res.text()}`);
  process.exit(1);
}

writeFileSync(`${dir}/voice.mp3`, Buffer.from(await res.arrayBuffer()));
console.log(`Wrote ${dir}/voice.mp3\nNext: npm run transcribe -- ${episode}`);
