// Usage: npm run new-episode -- my-episode-id
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const id = process.argv[2];
if (!id || !/^[a-z0-9-]+$/.test(id)) {
  console.error('Usage: npm run new-episode -- <kebab-case-id>');
  process.exit(1);
}

const dir = `src/episodes/${id}`;
if (existsSync(dir)) {
  console.error(`${dir} already exists`);
  process.exit(1);
}

const name = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

// Plan the src/episodes/index.ts edit first, so nothing is created if it can't be registered.
const indexFile = 'src/episodes/index.ts';
const fail = (msg) => {
  console.error(`${msg}\nNothing was created. Fix ${indexFile} or register the episode by hand.`);
  process.exit(1);
};

const original = readFileSync(indexFile, 'utf-8');
const eol = original.includes('\r\n') ? '\r\n' : '\n';
const lines = original.split(/\r?\n/);

if (lines.some((line) => line.includes(`from './${id}'`))) fail(`'${id}' is already imported in ${indexFile}.`);

const lastImport = lines.findLastIndex((line) => line.startsWith('import '));
if (lastImport === -1) fail(`Could not find any import lines in ${indexFile}.`);
lines.splice(lastImport + 1, 0, `import { ${name} } from './${id}';`);

const EPISODES_RE = /(export const EPISODES = \[)([\s\S]*?)(\])/;
let indexContent = lines.join(eol);
if (!EPISODES_RE.test(indexContent)) fail(`Could not find "export const EPISODES = [...]" in ${indexFile}.`);
indexContent = indexContent.replace(EPISODES_RE, (_, open, items, close) => {
  const kept = items.replace(/[\s,]*$/, '');
  return `${open}${kept ? `${kept}, ` : ''}${name}${close}`;
});

mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/words.json`, JSON.stringify([{ text: 'مرحبا', start: 0.2, end: 0.8 }], null, 1));
writeFileSync(
  `${dir}/index.ts`,
  `import { defineEpisode } from '../../lib/episode';
import words from './words.json';
// After recording, put voice.mp3 in this folder, then uncomment:
// import voice from './voice.mp3';

export const ${name} = defineEpisode({
  id: '${id}',
  title: '${id}',
  voice: null, // -> voice
  words,
  scenes: [{ id: 'hook', kind: 'statement', at: 0, text: 'اكتب الهوك هنا' }],
});
`,
);
writeFileSync(indexFile, indexContent);

console.log(`Created ${dir} and registered '${name}' in ${indexFile}`);
