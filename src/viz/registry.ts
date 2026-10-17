import type { FC } from 'react';
import type { VizProps, VizType } from '../types';
import { BinarySearchViz } from './BinarySearchViz';
import { CallStackViz } from './CallStackViz';
import { ComplexityViz } from './ComplexityViz';
import { EventLoopViz } from './EventLoopViz';
import { ExecutionViz } from './ExecutionViz';
import { LinkedListViz } from './LinkedListViz';
import { LookupViz } from './LookupViz';
import { MemoryViz } from './MemoryViz';
import { ScanViz } from './ScanViz';

export const VIZ_REGISTRY = {
  scan: ScanViz,
  lookup: LookupViz,
  execution: ExecutionViz,
  eventLoop: EventLoopViz,
  callStack: CallStackViz,
  binarySearch: BinarySearchViz,
  memory: MemoryViz,
  complexity: ComplexityViz,
  linkedList: LinkedListViz,
} satisfies { [K in VizType]: FC<VizProps<K>> };


