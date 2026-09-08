import { useEffect, useId, useRef, useState } from "react";
export function validateNumber(
  raw: string,
  min: number,
  max: number,
): number | null {
  if (!raw.trim() || !Number.isFinite(Number(raw))) return null;
  return Math.min(max, Math.max(min, Number(raw)));
}
export function NumericField({
  label,
  value,
  min,
  max,
  unit,
  onChange,
  strict = false,
  validate,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange(value: number): void;
  strict?: boolean;
  validate?(value: number): boolean;
}) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState(false);
  const id = useId();
  const editing = useRef(false);
  useEffect(() => {
    if (editing.current) return;
    setDraft(String(value));
    setError(false);
  }, [value]);
  function commit() {
    const next = validateNumber(draft, min, max);
    if (
      next === null ||
      (strict && (Number(draft) < min || Number(draft) > max)) ||
      (next !== null && validate && !validate(next))
    ) {
      setError(true);
      return;
    }
    setError(false);
    setDraft(String(next));
    onChange(next);
  }
  return (
    <div className="numeric-wrap">
      <div className="numeric-field">
        <input
          aria-label={label + " value"}
          aria-invalid={error}
          aria-describedby={error ? id : undefined}
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => {
            editing.current = true;
          }}
          onBlur={() => {
            editing.current = false;
            commit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(String(value));
              setError(false);
            }
          }}
        />
        <span>{unit}</span>
      </div>
      <span className="validation" id={id} role={error ? "alert" : undefined}>
        {error
          ? strict
            ? `Enter a supported finite number in [${min}, ${max}].`
            : "Enter a finite number."
          : "\u00a0"}
      </span>
    </div>
  );
}
