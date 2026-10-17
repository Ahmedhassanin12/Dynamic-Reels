// Usage: npm run new-episode -- my-episode-id
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { idToVariableName, isValidEpisodeId, registerEpisodeInSource } from '../src/lib/scaffold.ts';

const id = process.argv[2];
if (!isValidEpisodeId(id)) {
  console.error('Usage: npm run new-episode -- <kebab-case-id> (must start with a letter and contain only lowercase letters, digits, and hyphens)');
  process.exit(1);
}

const dir = `src/episodes/${id}`;
if (existsSync(dir)) {
  console.error(`${dir} already exists`);
  process.exit(1);
}

const name = idToVariableName(id);

// Plan the src/episodes/index.ts edit first, so nothing is created if it can't be registered.
const indexFile = 'src/episodes/index.ts';
let indexContent;
try {
  const original = readFileSync(indexFile, 'utf-8');
  indexContent = registerEpisodeInSource(original, id, name);
} catch (err) {
  console.error(`${err.message}\nNothing was created. Fix ${indexFile} or register the episode by hand.`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/words.json`, JSON.stringify([{ text: 'مرحبا', start: 0.2, end: 0.8 }], null, 2));
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
