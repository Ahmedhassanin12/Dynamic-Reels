import type { FC } from 'react';
import { Sequence, useCurrentFrame } from 'remotion';
import { CodeSnap } from '../components/CodeSnap';
import { CALL_STACK, CODE_DEMO, EVENT_LOOP, EXECUTION } from '../config';
import { typingFrames } from '../lib/code';
import type { SceneOf, VizProps, VizType } from '../types';
import { VIZ_REGISTRY } from '../viz/registry';
import { SceneFrame } from './SceneFrame';

const DEFAULT_PILLS: Record<VizType, { pill: string; tone: 'good' | 'bad' | 'neutral' }> = {
  scan: { pill: 'BEFORE · LINEAR SCAN', tone: 'bad' },
  lookup: { pill: 'AFTER · HASH MAP', tone: 'good' },
  execution: { pill: 'EXECUTION TRACE', tone: 'neutral' },
  eventLoop: { pill: 'JS RUNTIME · EVENT LOOP', tone: 'neutral' },
  callStack: { pill: 'RECURSION · CALL STACK', tone: 'neutral' },
  binarySearch: { pill: 'BINARY SEARCH · O(LOG N)', tone: 'good' },
};

/** Code on top, and below it a live picture of what that code does, so it makes sense even without the voice. */
export const CodeDemoScene = ({
  label,
  title,
  code,
  language,
  filename,
  highlightLines,
  skipTyping,
  pill,
  pillTone,
  tagText,
  tagTone,
  viz,
  result,
}: SceneOf<'codeDemo'>) => {
  const frame = useCurrentFrame();
  const Viz = VIZ_REGISTRY[viz.type] as FC<VizProps<VizType>>;

  const defaultPill = DEFAULT_PILLS[viz.type];
  const resolvedTone = pillTone ?? defaultPill.tone;
  const resolvedPill = pill ?? defaultPill.pill;
  const resolvedTagTone = tagTone ?? resolvedTone;
  const resolvedTagText =
    tagText ??
    (result
      ? viz.type === 'scan'
        ? `${result} · slow`
        : viz.type === 'lookup' || viz.type === 'binarySearch'
          ? `${result} · fast`
          : result
      : undefined);

  const codeDelay = code && !skipTyping ? typingFrames(code) : 0;
  const vizStart = code ? codeDelay + CODE_DEMO.vizDelayFrames : 0;
  const vizFrame = Math.max(0, frame - vizStart);

  // Dynamically sync active code line when execution, eventLoop, or callStack steps specify a line number
  let activeHighlightLines = highlightLines;
  if (frame >= vizStart && (viz.type === 'execution' || viz.type === 'eventLoop')) {
    const fpsStep =
      viz.framesPerStep ?? (viz.type === 'execution' ? EXECUTION.framesPerStep : EVENT_LOOP.framesPerStep);
    const stepIndex = Math.min(viz.steps.length - 1, Math.floor(vizFrame / fpsStep));
    const stepLine = viz.steps[stepIndex]?.line;
    if (stepLine !== undefined) {
      activeHighlightLines = [stepLine];
    }
  } else if (frame >= vizStart && viz.type === 'callStack' && viz.lines?.length) {
    const fpsStep = viz.framesPerStep ?? CALL_STACK.framesPerStep;
    const stepIndex = Math.min(viz.lines.length - 1, Math.floor(vizFrame / fpsStep));
    const stepLine = viz.lines[stepIndex];
    if (stepLine !== undefined) {
      activeHighlightLines = [stepLine];
    }
  }

  return (
    <SceneFrame label={label} title={title} pill={resolvedPill} pillTone={resolvedTone}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {code && (
          <CodeSnap
            code={code}
            language={language}
            filename={filename}
            highlightLines={activeHighlightLines}
            skipTyping={skipTyping}
            tagText={resolvedTagText}
            tagTone={resolvedTagTone}
          />
        )}
        <div style={{ minHeight: CODE_DEMO.vizHeight }}>
          <Sequence from={vizStart} layout="none">
            <Viz viz={viz} result={result} />
          </Sequence>
        </div>
      </div>
    </SceneFrame>
  );
};


