import { useEffect, useRef } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
export function StatusReadout({ clock }: { clock: SimulationClock }) {
  const ref = useRef<HTMLOutputElement>(null);
  useEffect(
    () =>
      clock.subscribe((t) => {
        if (ref.current)
          ref.current.textContent = t.toFixed(2).padStart(6, "0");
      }),
    [clock],
  );
  return (
    <div className="time-readout">
      <span className="eyebrow">Simulation time</span>
      <div>
        <output ref={ref} aria-label="Simulation time" aria-live="off">
          000.00
        </output>
        <span> s</span>
      </div>
    </div>
  );
}
