/** A triangular calibration sweep, NOT a vibration response or physical solution. */
export const DEMO_DURATION = 8;
export function previewPosition(time: number, travel: number) {
  const phase =
    (((time % DEMO_DURATION) + DEMO_DURATION) % DEMO_DURATION) / DEMO_DURATION;
  return (
    (phase < 0.25 ? phase * 4 : phase < 0.75 ? 2 - phase * 4 : phase * 4 - 4) *
    travel
  );
}
