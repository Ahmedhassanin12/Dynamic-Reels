import type { FC } from 'react';
import { Sequence } from 'remotion';
import { CodeSnap } from '../components/CodeSnap';
import { CODE_DEMO } from '../config';
import { typingFrames } from '../lib/code';
import type { SceneOf, VizProps, VizType } from '../types';
import { VIZ_REGISTRY } from '../viz/registry';
import { SceneFrame } from './SceneFrame';

/** Code on top, and below it a live picture of what that code does, so it makes sense even without the voice. */
export const CodeDemoScene = ({ label, title, code, language, filename, highlightLines, viz, result }: SceneOf<'codeDemo'>) => {
  const Viz = VIZ_REGISTRY[viz.type] as FC<VizProps<VizType>>;

  return (
    <SceneFrame label={label} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        <CodeSnap code={code} language={language} filename={filename} highlightLines={highlightLines} />
        <div style={{ minHeight: CODE_DEMO.vizHeight }}>
          <Sequence from={typingFrames(code) + CODE_DEMO.vizDelayFrames} layout="none">
            <Viz viz={viz} result={result} />
          </Sequence>
        </div>
      </div>
    </SceneFrame>
  );
};
