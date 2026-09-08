import type { SimulationClock } from "../animation/SimulationClock";
import {
  createSdof,
  type SdofParameters,
  type SdofSolution,
} from "../physics/sdof";
import {
  coefficientFromRatio,
  type DampingAuthority,
} from "../physics/dampingControl";
import { ParameterSlider } from "./ParameterSlider";
import { format } from "../visualization/sdofGeometry";
export function DampingControls({
  clock,
  parameters,
  authority,
  onAuthority,
  onChange,
  onPreset,
}: {
  clock: SimulationClock;
  parameters: SdofParameters;
  authority: DampingAuthority;
  onAuthority(a: DampingAuthority): void;
  onChange(c: number): void;
  onPreset(z: number): void;
}) {
  const s = createSdof(parameters),
    ratio = authority === "zeta" && s.zeta !== null;
  return (
    <div className="damping-controls">
      <label>
        Control authority
        <select
          aria-label="Damping control authority"
          value={ratio ? "zeta" : "c"}
          onChange={(e) => onAuthority(e.target.value as DampingAuthority)}
        >
          <option value="c">Coefficient c</option>
          <option value="zeta" disabled={!parameters.stiffness}>
            Ratio ζ
          </option>
        </select>
      </label>
      <ParameterSlider
        key={authority}
        clock={clock}
        label={ratio ? "Damping ratio" : "Damping coefficient"}
        unit={ratio ? "dimensionless" : "N·s/m"}
        value={ratio ? s.zeta! : s.damping}
        min={0}
        max={ratio ? Math.max(3, s.zeta!) : Math.max(500, s.damping)}
        step={ratio ? 0.01 : 0.1}
        strict
        onChange={(v) =>
          onChange(ratio ? coefficientFromRatio(parameters, v) : v)
        }
      />
      <p className="parameter-policy">
        {parameters.stiffness === 0
          ? "No restoring stiffness: ζ is undefined. Coefficient c is retained; ratio control is disabled."
          : ratio
            ? "ζ stays fixed when mass or stiffness changes; c is derived. ζ = 1 marks critical damping."
            : "c stays fixed when mass or stiffness changes; ζ is derived."}
      </p>
      <div className="presets" aria-label="Damping presets">
        {[
          [0, "Undamped"],
          [0.1, "Light damping"],
          [0.4, "Moderate damping"],
          [1, "Critical damping"],
          [2, "Overdamped"],
        ].map(([z, label]) => (
          <button key={z} onClick={() => onPreset(Number(z))}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
export function DampingSummary({ solution: s }: { solution: SdofSolution }) {
  return (
    <section className="damping-summary" aria-label="Damping results">
      <strong data-testid="regime">{s.regime}</strong>
      <div>
        ζ{" "}
        <output data-testid="zeta">
          {s.zeta === null ? "—" : format(s.zeta, 4)}
        </output>{" "}
        · c critical <output>{format(s.criticalDamping)}</output> N·s/m
      </div>
      <div>
        {s.dampedOmega !== null ? (
          <>
            ωd{" "}
            <output data-testid="damped-omega">
              {format(s.dampedOmega, 4)}
            </output>{" "}
            rad/s · fd {format(s.dampedOmega / (2 * Math.PI), 4)} Hz
          </>
        ) : (
          <span>Non-oscillatory response</span>
        )}
      </div>
      <div>
        Roots r₁, r₂:{" "}
        {s.roots
          .map(
            (r) =>
              format(r.real, 4) +
              (r.imaginary
                ? (r.imaginary > 0 ? "+" : "") + format(r.imaginary, 4) + "i"
                : ""),
          )
          .join("; ")}{" "}
        s⁻¹
      </div>
    </section>
  );
}
type Guide = { kind: "add" | "critical"; step: number; paused: boolean } | null;
export function DampingExperiment({
  value,
  onStart,
  onAdvance,
  onPause,
  onClose,
}: {
  value: Guide;
  onStart(kind: "add" | "critical"): void;
  onAdvance(): void;
  onPause(): void;
  onClose(): void;
}) {
  if (!value)
    return (
      <div className="guided-start">
        <span className="eyebrow">TRY A RELATIONSHIP</span>
        <button onClick={() => onStart("add")}>Add damping ↗</button>
        <button onClick={() => onStart("critical")}>
          Find critical damping ↗
        </button>
      </div>
    );
  const messages =
    value.kind === "add"
      ? [
          "Play the undamped release. Open Energy or Phase Space and observe the constant energy and closed orbit.",
          "Now ζ = 0.2. Play again: peaks decay, mechanical energy decreases and the phase path spirals inward. Fd always opposes velocity.",
        ]
      : [
          "Release from rest with ζ = 0.4: observe overshoot.",
          "ζ = 1: the repeated real roots remove oscillation. For this release from rest, compare the return without overshoot.",
          "ζ = 2: the slow real root delays return. This comparison keeps x₀ = 0.1 m and v₀ = 0.",
        ];
  return (
    <section
      className="guided-experiment"
      aria-label="Damping guided experiment"
    >
      <span className="eyebrow">
        EXPERIMENT {value.step + 1}/{messages.length}{" "}
        {value.paused ? "· PAUSED" : ""}
      </span>
      <p>{messages[value.step]} Playback stays under your control.</p>
      <div>
        <button onClick={onPause}>
          {value.paused ? "Resume experiment" : "Pause experiment"}
        </button>
        <button
          onClick={onAdvance}
          disabled={value.paused || value.step === messages.length - 1}
        >
          Apply change
        </button>
        <button onClick={onClose}>Skip / Finish</button>
      </div>
    </section>
  );
}
