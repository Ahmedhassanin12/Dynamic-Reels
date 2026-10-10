import { CodeSnap } from '../components/CodeSnap';
import type { SceneOf } from '../types';
import { SceneFrame } from './SceneFrame';

export const CodeScene = ({ label, title, code, language, filename, highlightLines }: SceneOf<'code'>) => (
  <SceneFrame label={label} title={title}>
    <CodeSnap code={code} language={language} filename={filename} highlightLines={highlightLines} />
  </SceneFrame>
);
