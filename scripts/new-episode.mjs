// Usage: npm run new-episode -- my-episode-id
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';

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

mkdirSync(dir, { recursive: true });
mkdirSync(`public/episodes/${id}`, { recursive: true });
writeFileSync(`${dir}/words.json`, JSON.stringify([{ text: 'مرحبا', start: 0.2, end: 0.8 }], null, 1));
writeFileSync(
  `${dir}/index.ts`,
  `import { defineEpisode } from '../../lib/episode';
import words from './words.json';

export const ${name} = defineEpisode({
  id: '${id}',
  title: '${id}',
  voice: null,
  words,
  scenes: [{ id: 'hook', kind: 'statement', at: 0, text: 'اكتب الهوك هنا' }],
});
`,
);

console.log(`Created ${dir} and public/episodes/${id}\n\nNow register it in src/episodes/index.ts:\n  import { ${name} } from './${id}';\n  export const EPISODES = [..., ${name}] satisfies Episode[];`);
