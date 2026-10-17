import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.json'];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('.mp3') || specifier.endsWith('.wav') || specifier.endsWith('.png')) {
      return {
        url: `data:text/javascript,export default ${JSON.stringify(specifier)};`,
        shortCircuit: true,
      };
    }

    if (specifier.startsWith('.') && context.parentURL && context.parentURL.startsWith('file:')) {
      const parentDir = dirname(fileURLToPath(context.parentURL));
      const basePath = resolve(parentDir, specifier);

      if (specifier.endsWith('.json') && existsSync(basePath)) {
        return {
          url: pathToFileURL(basePath).href,
          importAttributes: { ...context.importAttributes, type: 'json' },
          shortCircuit: true,
        };
      }

      if (!extname(specifier)) {
        for (const ext of EXTENSIONS) {
          const candidate = `${basePath}${ext}`;
          if (existsSync(candidate)) {
            return {
              url: pathToFileURL(candidate).href,
              importAttributes: ext === '.json' ? { ...context.importAttributes, type: 'json' } : context.importAttributes,
              shortCircuit: true,
            };
          }
        }
        for (const ext of EXTENSIONS) {
          const indexCandidate = resolve(basePath, `index${ext}`);
          if (existsSync(indexCandidate)) {
            return {
              url: pathToFileURL(indexCandidate).href,
              shortCircuit: true,
            };
          }
        }
      }
    }

    return nextResolve(specifier, context);
  },
});
