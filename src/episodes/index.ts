import type { Episode } from '../types';
import { arrayVsHashMap } from './array-vs-hash-map';

/** Add new episodes here (one import + one entry). Each becomes a Composition in the Studio. */
export const EPISODES = [arrayVsHashMap] satisfies Episode[];
