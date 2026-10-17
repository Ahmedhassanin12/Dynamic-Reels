import type { FC } from 'react';
import type { SceneKind, SceneOf } from '../types';
import { ArrayScene } from './ArrayScene';
import { CodeDemoScene } from './CodeDemoScene';
import { CodeScene } from './CodeScene';
import { CompareScene } from './CompareScene';
import { DiagramScene } from './DiagramScene';
import { MythRealityScene } from './MythRealityScene';
import { QaScene } from './QaScene';
import { StatementScene } from './StatementScene';
import { StepsScene } from './StepsScene';
import { TransitionScene } from './TransitionScene';

export const SCENE_REGISTRY = {
  statement: StatementScene,
  array: ArrayScene,
  code: CodeScene,
  codeDemo: CodeDemoScene,
  steps: StepsScene,
  compare: CompareScene,
  diagram: DiagramScene,
  qa: QaScene,
  transition: TransitionScene,
  mythReality: MythRealityScene,
} satisfies { [K in SceneKind]: FC<SceneOf<K>> };

