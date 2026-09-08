export type Experiment = {
  kind: "stiffness" | "mass";
  step: number;
  paused: boolean;
} | null;
export function GuidedExperiment({
  value,
  onStart,
  onAdvance,
  onPause,
  onClose,
}: {
  value: Experiment;
  onStart(kind: "stiffness" | "mass"): void;
  onAdvance(): void;
  onPause(): void;
  onClose(): void;
}) {
  if (!value)
    return (
      <div className="guided-start">
        <span className="eyebrow">TRY A RELATIONSHIP</span>
        <button onClick={() => onStart("stiffness")}>
          Increase stiffness ↗
        </button>
        <button onClick={() => onStart("mass")}>Increase mass ↗</button>
      </div>
    );
  const messages =
    value.kind === "stiffness"
      ? [
          "Observe m = 1 kg, k = 100 N/m. Keep the mass fixed.",
          "Now k = 400 N/m. The natural frequency doubles.",
        ]
      : [
          "Observe m = 1 kg, k = 100 N/m. Keep stiffness fixed.",
          "Now m = 4 kg. The natural frequency halves.",
        ];
  return (
    <section className="guided-experiment" aria-label="Guided experiment">
      <span className="eyebrow">
        EXPERIMENT {value.step + 1}/2 {value.paused ? "· PAUSED" : ""}
      </span>
      <p>{messages[value.step]} Playback remains under your control.</p>
      <div>
        <button onClick={onPause}>
          {value.paused ? "Resume experiment" : "Pause experiment"}
        </button>
        <button onClick={onAdvance} disabled={value.paused || value.step === 1}>
          Apply change
        </button>
        <button onClick={onClose}>Skip / Finish</button>
      </div>
    </section>
  );
}
