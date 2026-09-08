/**
 * Modal Dynamics Studio — Property Manager.
 *
 * Contextual, per-selection, never a permanent form of every parameter
 * (SolidWorks PropertyManager / COMSOL Settings-window precedent). Editable
 * rows are a compact numeric field plus an optional scrub, plus a unit — not
 * label + box + slider + min/max text all at once.
 *
 * Live values (x, v, a) are written straight from the clock subscription into
 * <output> elements; they never travel through React state, so playback does
 * not commit React frames.
 */
import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import { NumericField } from "../components/NumericField";
import { format } from "../visualization/sdofGeometry";
import type { Density } from "./density";

export function PropertyRow({
  label,
  value,
  unit,
  token,
  active,
  min,
  max,
  step,
  onChange,
  validate,
}: {
  label: string;
  value: number;
  unit: string;
  token?: string;
  active?: boolean;
  min: number;
  max: number;
  step?: number;
  onChange(v: number): void;
  validate?(v: number): boolean;
}) {
  return (
    <div
      className={"prop-row" + (active ? " linked" : "")}
      data-token={token}
      data-linked={active || undefined}
    >
      <span className="prop-label">{label}</span>
      <NumericField
        label={label}
        value={value}
        min={min}
        max={max}
        unit={unit}
        strict
        validate={validate}
        onChange={onChange}
      />
      {step !== undefined && (
        <input
          className="prop-scrub"
          type="range"
          aria-label={label + " scrub"}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.currentTarget.valueAsNumber)}
        />
      )}
    </div>
  );
}

export function PropertyFact({
  label,
  children,
  token,
  active,
}: {
  label: string;
  children: ReactNode;
  token?: string;
  active?: boolean;
}) {
  return (
    <div
      className={"prop-fact" + (active ? " linked" : "")}
      data-token={token}
      data-linked={active || undefined}
    >
      <span className="prop-label">{label}</span>
      <span className="prop-value">{children}</span>
    </div>
  );
}

/** Live x / v / a for one coordinate, written outside React. */
export function PropertyState({
  clock,
  sample,
  index,
  units = ["m", "m/s", "m/s²"],
}: {
  clock: SimulationClock;
  sample(t: number): { x: number[]; v: number[]; a: number[] };
  index: number;
  units?: [string, string, string] | string[];
}) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () =>
      clock.subscribe((t) => {
        const s = sample(t);
        const el = root.current;
        if (!el) return;
        (["x", "v", "a"] as const).forEach((k) => {
          const out = el.querySelector<HTMLOutputElement>(`[data-state="${k}"]`);
          if (out) out.value = format(s[k][index] ?? 0, 4);
        });
      }),
    [clock, sample, index],
  );
  return (
    <div className="prop-state" ref={root}>
      {(["x", "v", "a"] as const).map((k, i) => (
        <div key={k}>
          <span className="prop-label">{k}</span>
          <output aria-label={`Current ${k} of coordinate ${index + 1}`} data-state={k} />
          <span className="prop-unit">{units[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function PropertyEmpty({ density }: { density: Density }) {
  return (
    <p className="prop-empty">
      {density === "learn"
        ? "Click a part in the viewport, or a row in the model browser, to see what it contributes to the equation."
        : "Nothing selected. Pick a mass, spring, damper, mode, node or element."}
    </p>
  );
}

export function PropertySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="prop-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
