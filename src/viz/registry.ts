import type { FC } from 'react';
import type { VizProps, VizType } from '../types';
import { LookupViz } from './LookupViz';
import { ScanViz } from './ScanViz';

export const VIZ_REGISTRY = {
  scan: ScanViz,
  lookup: LookupViz,
} satisfies { [K in VizType]: FC<VizProps<K>> };
