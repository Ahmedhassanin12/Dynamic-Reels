import type { Episode } from '../types';
import { arrayVsHashMap } from './array-vs-hash-map';
import { eventLoop } from './event-loop';
import { sceneShowcase } from './scene-showcase';
import { naming1 } from './naming-1';
import { cleanCodeFunction } from './clean-code-function';
import { usePronounceableNames } from './use-pronounceable-names';

/** Add new episodes here (one import + one entry). Each becomes a Composition in the Studio. */
export const EPISODES = [arrayVsHashMap, eventLoop, sceneShowcase, naming1, cleanCodeFunction, usePronounceableNames] satisfies Episode[];

