import { Easing, interpolate, spring, type SpringConfig } from 'remotion';

export const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

/**
 * Standardized spring physics presets for educational reels.
 * - `enter`: Crisp card/table arrival with minimal overshoot.
 * - `snappy`: Fast UI focus rings, column/row highlights, active pointers.
 * - `emphasis`: Tactile pop for badges (PK, FK, Valid/Invalid).
 * - `gentle`: Critically damped push with zero bounce.
 */
export const SPRINGS = {
  enter: { damping: 18, stiffness: 170, mass: 0.9 },
  snappy: { damping: 22, stiffness: 260, mass: 0.8 },
  emphasis: { damping: 13, stiffness: 210, mass: 0.85 },
  gentle: { damping: 200, stiffness: 140, mass: 1 },
} as const satisfies Record<string, Partial<SpringConfig>>;

export type SpringPreset = keyof typeof SPRINGS;

/**
 * Standardized cubic-bezier easing curves for deterministic `interpolate()` animations.
 */
export const EASINGS = {
  /** Smooth exponential deceleration for entrances, line draws, and progress bars */
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  /** Clean cubic deceleration for opacity and subtle slides */
  outCubic: Easing.bezier(0.22, 1, 0.36, 1),
  /** Balanced acceleration/deceleration for state transitions and camera shifts */
  inOutCubic: Easing.bezier(0.65, 0, 0.35, 1),
} as const;

/**
 * Frame duration conventions (at 30fps).
 */
export const DURATIONS = {
  micro: 10,
  fast: 14,
  normal: 18,
  connector: 20,
  stagger: 8,
  beat: 14,
} as const;

/**
 * Computes clamped [0..1] spring progress starting at `delay` frames.
 */
export const enterProgress = (
  frame: number,
  fps: number,
  delay = 0,
  preset: SpringPreset = 'enter',
): number => {
  if (frame < delay) return 0;
  return Math.max(0, Math.min(1.08, spring({ frame: frame - delay, fps, config: SPRINGS[preset] })));
};

/**
 * Computes a directional slide + fade entrance style.
 */
export const fadeSlide = (
  frame: number,
  fps: number,
  options?: {
    delay?: number;
    distance?: number;
    axis?: 'x' | 'y';
    preset?: SpringPreset;
    fadeFrames?: number;
  },
) => {
  const delay = options?.delay ?? 0;
  const distance = options?.distance ?? 24;
  const axis = options?.axis ?? 'y';
  const preset = options?.preset ?? 'enter';
  const fadeFrames = options?.fadeFrames ?? DURATIONS.fast;

  const progress = enterProgress(frame, fps, delay, preset);
  const opacity = interpolate(frame, [delay, delay + fadeFrames], [0, 1], {
    ...CLAMP,
    easing: EASINGS.outCubic,
  });
  const offset = (1 - progress) * distance;
  const translate = axis === 'x' ? `${offset.toFixed(2)}px 0px` : `0px ${offset.toFixed(2)}px`;

  return {
    opacity,
    translate,
    transform: axis === 'x' ? `translateX(${offset.toFixed(2)}px)` : `translateY(${offset.toFixed(2)}px)`,
    progress,
  };
};

/**
 * Computes a perceptually uniform scale + opacity pop for badges, pills, and callouts.
 */
export const scalePop = (
  frame: number,
  fps: number,
  options?: {
    delay?: number;
    from?: number;
    preset?: SpringPreset;
  },
) => {
  const delay = options?.delay ?? 0;
  const from = options?.from ?? 0.84;
  const preset = options?.preset ?? 'emphasis';

  const progress = enterProgress(frame, fps, delay, preset);
  const opacity = interpolate(frame, [delay, delay + 8], [0, 1], {
    ...CLAMP,
    easing: EASINGS.outCubic,
  });
  const scale = interpolate(progress, [0, 1], [from, 1], {
    output: 'perceptual-scale',
  });

  return {
    opacity,
    scale,
    transform: `scale(${scale.toFixed(3)})`,
    progress,
  };
};

/**
 * Computes a clamped [0..1] draw progress for SVG connectors, arrows, and bars.
 */
export const drawProgress = (
  frame: number,
  options?: {
    delay?: number;
    duration?: number;
  },
): number => {
  const delay = options?.delay ?? 0;
  const duration = Math.max(1, options?.duration ?? DURATIONS.connector);
  return interpolate(frame, [delay, delay + duration], [0, 1], {
    ...CLAMP,
    easing: EASINGS.outExpo,
  });
};

/**
 * Computes an emphasis highlight state that activates at `atFrame` with a transient pulse ring
 * that settles into a steady highlighted state.
 */
export const emphasisPulse = (
  frame: number,
  options: {
    atFrame: number;
    rampFrames?: number;
    pulseFrames?: number;
  },
) => {
  const { atFrame, rampFrames = 10, pulseFrames = 22 } = options;
  const active = interpolate(frame, [atFrame, atFrame + rampFrames], [0, 1], {
    ...CLAMP,
    easing: EASINGS.outExpo,
  });
  const pulse =
    frame < atFrame
      ? 0
      : interpolate(
          frame,
          [atFrame, atFrame + Math.round(pulseFrames * 0.4), atFrame + pulseFrames],
          [0, 1, 0],
          {
            ...CLAMP,
            easing: EASINGS.outCubic,
          },
        );

  return {
    isActive: frame >= atFrame,
    active,
    pulse,
  };
};
