import { useSyncExternalStore } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
export function PlaybackBar({
  clock,
  reduced,
  onReset,
}: {
  clock: SimulationClock;
  reduced: boolean;
  onReset(): void;
}) {
  const { playing, rate, suspended } = useSyncExternalStore(
    clock.subscribeState,
    clock.getState,
  );
  return (
    <div className="playback">
      <div className="transport">
        <button
          className="play-button"
          onClick={playing ? clock.pause : clock.play}
          disabled={reduced}
          aria-label={playing ? "Pause" : "Play"}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={onReset} title="Reset · R">
          Reset
        </button>
        <button
          onClick={() => clock.step()}
          title="Step 0.1 seconds · Right arrow"
        >
          Step <span aria-hidden="true">↦</span>
        </button>
      </div>
      <div className="rates" role="group" aria-label="Playback speed">
        {[0.25, 0.5, 1, 2].map((value, i) => (
          <button
            aria-pressed={rate === value}
            onClick={() => clock.setRate(value)}
            key={value}
          >
            {["¼×", "½×", "1×", "2×"][i]}
          </button>
        ))}
      </div>
      <span className="playback-note">
        {reduced
          ? "Reduced motion · step to inspect"
          : suspended
            ? "Suspended while inactive"
            : "Visual playback speed"}
      </span>
    </div>
  );
}
