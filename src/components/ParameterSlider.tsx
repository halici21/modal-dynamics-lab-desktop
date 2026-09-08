import { useEffect, useId, useRef, type CSSProperties } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import { NumericField } from "./NumericField";
export function ParameterSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  clock,
  onChange,
  strict = false,
  validate,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  clock: SimulationClock;
  onChange(value: number): void;
  strict?: boolean;
  validate?(value: number): boolean;
}) {
  const id = useId();
  const key = useRef({});
  const callback = useRef(onChange);
  callback.current = onChange;
  useEffect(() => {
    const token = key.current;
    return () => clock.cancelJob(token);
  }, [clock]);
  function update(next: number) {
    if (Number.isFinite(next))
      clock.coalesce(key.current, () =>
        callback.current(Math.min(max, Math.max(min, next))),
      );
  }
  return (
    <div className="parameter">
      <label className="eyebrow" htmlFor={id}>
        {label}
      </label>
      <NumericField
        label={label}
        value={value}
        min={min}
        max={max}
        unit={unit}
        strict={strict}
        validate={validate}
        onChange={(next) => {
          clock.cancelJob(key.current);
          callback.current(next);
        }}
      />
      <input
        id={id}
        className="instrument-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={value + " " + unit}
        style={
          {
            "--fill": ((value - min) / (max - min)) * 100 + "%",
          } as CSSProperties
        }
        onChange={(e) => update(e.currentTarget.valueAsNumber)}
      />
      <div className="range-labels">
        <span>{min}</span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}
