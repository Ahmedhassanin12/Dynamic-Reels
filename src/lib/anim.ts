/** Pure helpers for the `motion` scene animations (no React / Remotion imports, safe for Node scripts). */

/** Frame at which the packet arrives at each stop of a `packetFlow` animation. */
export const packetArrivals = (stopCount: number, arriveAt?: number[], hopFrames = 26): number[] =>
  Array.from({ length: stopCount }, (_, i) => arriveAt?.[i] ?? 12 + i * hopFrames);
