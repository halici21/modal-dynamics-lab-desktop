/**
 * Modal Dynamics Studio — small chrome pieces.
 *
 * Transport, contextual tool strip, study selector, density switcher, status
 * line. Physical frequency (fₙ, ωₙ) and playback speed (1×, ½×) are kept
 * visually and verbally distinct: the transport never shows a frequency, and
 * the status line never shows a rate.
 */
import { useEffect, useState } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import { DENSITIES, type Density } from "./density";
import { STUDIES, STUDY_GROUPS, type Study } from "./model";

export function Transport({
  clock,
  reduced,
  onReset,
}: {
  clock: SimulationClock;
  reduced: boolean;
  onReset(): void;
}) {
  const [state, setState] = useState(() => clock.getState());
  const [time, setTime] = useState(() => clock.read());
  useEffect(() => clock.subscribeState(() => setState({ ...clock.getState() })), [clock]);
  useEffect(() => {
    // Time is sampled on a cheap interval rather than every frame so playback
    // never commits React. 4 Hz is enough to read a clock.
    const id = window.setInterval(() => setTime(clock.read()), 250);
    return () => window.clearInterval(id);
  }, [clock]);
  return (
    <div className="transport" role="group" aria-label="Simulation transport">
      <button
        className="transport-primary"
        aria-label={state.playing ? "Pause simulation" : "Play simulation"}
        disabled={reduced && !state.playing}
        onClick={() => (state.playing ? clock.pause() : clock.play())}
      >
        {state.playing ? "Pause" : "Play"}
      </button>
      <button aria-label="Reset simulation" onClick={onReset}>
        Reset
      </button>
      <button aria-label="Step forward" onClick={() => clock.step(0.05)}>
        Step
      </button>
      <div className="transport-rate" role="group" aria-label="Playback speed">
        {[0.25, 0.5, 1, 2].map((r) => (
          <button
            key={r}
            aria-label={`Playback speed ${r} times`}
            aria-pressed={state.rate === r}
            onClick={() => clock.setRate(r)}
          >
            {r === 0.25 ? "¼×" : r === 0.5 ? "½×" : r + "×"}
          </button>
        ))}
      </div>
      <span className="transport-time">
        <span className="transport-time-label">t</span>
        <output aria-label="Simulation time">{time.toFixed(2)}</output>
        <span className="transport-time-label">s</span>
      </span>
    </div>
  );
}

export function ToolStrip({
  tools,
  value,
  onChange,
}: {
  tools: string[];
  value: string;
  onChange(tool: string): void;
}) {
  return (
    <div className="tool-strip" role="group" aria-label="Contextual tools">
      {tools.map((tool) => (
        <button
          key={tool}
          aria-pressed={value === tool}
          onClick={() => onChange(tool)}
        >
          {tool}
        </button>
      ))}
    </div>
  );
}

export function StudySelector({
  study,
  onChange,
}: {
  study: Study;
  onChange(module: number): void;
}) {
  return (
    <label className="study-selector">
      <span className="visually-hidden">Study</span>
      <select
        aria-label="Study"
        value={study.module}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {STUDY_GROUPS.map((group) => (
          <optgroup key={group} label={group}>
            {STUDIES.filter((s) => s.group === group).map((s) => (
              <option key={s.module} value={s.module}>
                {s.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

export function DensitySwitcher({
  value,
  onChange,
}: {
  value: Density;
  onChange(d: Density): void;
}) {
  return (
    <div className="density" role="group" aria-label="Detail level">
      {DENSITIES.map((d) => (
        <button
          key={d.id}
          aria-pressed={value === d.id}
          title={d.hint}
          onClick={() => onChange(d.id)}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

export function StatusLine({ facts }: { facts: (string | null)[] }) {
  return (
    <>
      {facts.filter(Boolean).map((f, i) => (
        <span key={i}>{f}</span>
      ))}
    </>
  );
}
