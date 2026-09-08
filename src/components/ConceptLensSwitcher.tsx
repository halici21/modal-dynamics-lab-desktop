import type { Lens } from "../app/state";
import { lenses } from "../education/content";
export function ConceptLensSwitcher({
  value,
  onChange,
}: {
  value: Lens;
  onChange(lens: Lens): void;
}) {
  return (
    <div className="lenses" role="group" aria-label="Concept lenses">
      {lenses.map((lens) => (
        <button
          key={lens}
          aria-label={lens}
          aria-pressed={value === lens}
          onClick={() => onChange(lens)}
        >
          {lens === "Phase Space"
            ? "Phase"
            : lens === "Mathematics"
              ? "Math"
              : lens}
        </button>
      ))}
    </div>
  );
}
