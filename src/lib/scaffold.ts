export function isValidEpisodeId(id: string): boolean {
  return typeof id === 'string' && /^[a-z][a-z0-9-]*$/.test(id);
}

export function idToVariableName(id: string): string {
  return id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export function registerEpisodeInSource(source: string, id: string, name: string): string {
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const lines = source.split(/\r?\n/);

  if (lines.some((line) => line.includes(`from './${id}'`))) {
    throw new Error(`'${id}' is already imported in episodes index.`);
  }

  let lastImport = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('import ')) {
      lastImport = i;
      break;
    }
  }

  if (lastImport === -1) {
    throw new Error('Could not find any import lines in episodes index.');
  }

  lines.splice(lastImport + 1, 0, `import { ${name} } from './${id}';`);

  const content = lines.join(eol);
  const episodesMatch = content.match(/export\s+const\s+EPISODES(?:\s*:\s*[^=]+)?\s*=\s*\[/);
  if (!episodesMatch || episodesMatch.index === undefined) {
    throw new Error('Could not find "export const EPISODES = [...]" in episodes index.');
  }

  const arrayStart = episodesMatch.index + episodesMatch[0].length;
  const arrayEnd = content.indexOf(']', arrayStart);
  if (arrayEnd === -1) {
    throw new Error('Could not find closing "]" for EPISODES array.');
  }

  const innerContent = content.slice(arrayStart, arrayEnd);
  const trimmed = innerContent.trim().replace(/,\s*$/, '');
  const newInner = trimmed ? `${trimmed}, ${name}` : name;

  return content.slice(0, arrayStart) + newInner + content.slice(arrayEnd);
}
