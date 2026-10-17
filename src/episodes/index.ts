import type { Episode } from '../types';
import { arrayVsHashMap } from './array-vs-hash-map';
import { eventLoop } from './event-loop';
import { sceneShowcase } from './scene-showcase';

/** Add new episodes here (one import + one entry). Each becomes a Composition in the Studio. */
export const EPISODES = [arrayVsHashMap, eventLoop, sceneShowcase] satisfies Episode[];

