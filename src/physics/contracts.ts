/** Future solver boundary. V0 intentionally provides no solver or physical results. */
export interface PhysicalSnapshot {
  time: number;
  positions: readonly number[];
  velocities: readonly number[];
  accelerations: readonly number[];
}
export interface PhysicalSolution {
  sample(time: number): PhysicalSnapshot;
}
