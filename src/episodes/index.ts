import type { Episode } from '../types';
import { arrayVsHashMap } from './array-vs-hash-map';
import { eventLoop } from './event-loop';

/** Add new episodes here (one import + one entry). Each becomes a Composition in the Studio. */
export const EPISODES = [arrayVsHashMap, eventLoop] satisfies Episode[];
