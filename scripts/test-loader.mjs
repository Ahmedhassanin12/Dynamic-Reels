import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RESOLVABLE_EXTENSIONS = ['.ts', '.js', '.mjs', '.json'];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('.mp3') || specifier.endsWith('.wav') || specifier.endsWith('.png')) {
      return {
        url: `data:text/javascript,export default ${JSON.stringify(specifier)};`,
        shortCircuit: true,
      };
    }

    if (specifier.endsWith('.tsx')) {
      throw new Error(
        `[test-loader] Attempted to import "${specifier}" in Node test runner. ` +
          `Node native type-stripping only executes TypeScript (.ts) files without JSX. ` +
          `Keep pure business logic, calculations, and schemas in .ts files under src/lib/ to test them without UI bundling.`,
      );
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
        for (const ext of RESOLVABLE_EXTENSIONS) {
          const candidate = `${basePath}${ext}`;
          if (existsSync(candidate)) {
            return {
              url: pathToFileURL(candidate).href,
              importAttributes: ext === '.json' ? { ...context.importAttributes, type: 'json' } : context.importAttributes,
              shortCircuit: true,
            };
          }
        }
        for (const ext of RESOLVABLE_EXTENSIONS) {
          const indexCandidate = resolve(basePath, `index${ext}`);
          if (existsSync(indexCandidate)) {
            return {
              url: pathToFileURL(indexCandidate).href,
              shortCircuit: true,
            };
          }
        }

        // If a .tsx file is matched when no extension was provided
        if (existsSync(`${basePath}.tsx`) || existsSync(resolve(basePath, 'index.tsx'))) {
          throw new Error(
            `[test-loader] Specifier "${specifier}" resolved to a .tsx file. ` +
              `Node native type-stripping cannot parse JSX (.tsx). ` +
              `Keep pure functions, schemas, and validators in .ts files under src/lib/.`,
          );
        }
      }
    }

    return nextResolve(specifier, context);
  },
});
