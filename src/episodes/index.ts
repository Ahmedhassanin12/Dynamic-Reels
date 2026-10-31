import type { Episode } from '../types';
import { arrayVsHashMap } from './array-vs-hash-map';
import { eventLoop } from './event-loop';


import { naming1 } from './naming-1';
import { cleanCodeFunction } from './clean-code-function';
import { foreignKey } from './foreign-key';
import { usePronounceableNames } from './use-pronounceable-names';

import { behind01OneTap } from './behind-01-one-tap';
import { behind02Api } from './behind-02-api';
import { behind03Database } from './behind-03-database';
import { behind04Index } from './behind-04-index';
import { behind05HashMap } from './behind-05-hash-map';
import { behind06Cache } from './behind-06-cache';
import { behind07Memory } from './behind-07-memory';
import { behind08Async } from './behind-08-async';
import { behind09BigO } from './behind-09-big-o';
import { behind10Recap } from './behind-10-recap';

/** Add new episodes here (one import + one entry). Each becomes a Composition in the Studio. */
export const EPISODES = [arrayVsHashMap,
  eventLoop,
  naming1,
  cleanCodeFunction,
  usePronounceableNames,
  foreignKey, behind01OneTap, behind02Api, behind03Database, behind04Index, behind05HashMap, behind06Cache, behind07Memory, behind08Async, behind09BigO, behind10Recap] satisfies Episode[];

