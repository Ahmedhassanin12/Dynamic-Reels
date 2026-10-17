import type { FC } from 'react';
import type { VizProps, VizType } from '../types';
import { BinarySearchViz } from './BinarySearchViz';
import { CallStackViz } from './CallStackViz';
import { EventLoopViz } from './EventLoopViz';
import { ExecutionViz } from './ExecutionViz';
import { LookupViz } from './LookupViz';
import { ScanViz } from './ScanViz';

export const VIZ_REGISTRY = {
  scan: ScanViz,
  lookup: LookupViz,
  execution: ExecutionViz,
  eventLoop: EventLoopViz,
  callStack: CallStackViz,
  binarySearch: BinarySearchViz,
} satisfies { [K in VizType]: FC<VizProps<K>> };

