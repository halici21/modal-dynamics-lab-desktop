import type { SimulationClock } from "../src/animation/SimulationClock";
import type { ViewportStats } from "../src/studio/viewport/CadViewport";

declare global {
  interface Window {
    /** Dev-only handle on the single simulation clock. */
    __labClock: SimulationClock;
    /** Dev-only React commit counter (see src/main.tsx Profiler). */
    __labCommits(): number;
    /** Dev-only handle on the live Three.js renderer statistics. */
    __studioViewport?: {
      renderer: "webgl";
      stats(): ViewportStats;
    };
  }
}
export {};
