/**
 * Modal Dynamics Studio — analysis dock bodies.
 *
 * Every quantitative view stays 2D (`mdl-scientific-visualization`: 3D for
 * physical intuition, 2D for evidence). FRF, spectrum and PSD keep separate
 * plots and separate legends; mode-shape views carry an explicit visualization
 * scale so an amplitude is never read as a physical displacement.
 *
 * Plot components are reused from the validated R2 visualization layer rather
 * than re-implemented.
 */
import { useLayoutEffect, useMemo, useRef, useState, type DependencyList } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import { CorePlot, Curve } from "../visualization/CoreViews";
import { format } from "../visualization/sdofGeometry";
import { modalFRFEntry, harmonicResponse, directFRF, modalFRF, cx, magnitude, phase, transfer, baseResponse, type Complex } from "../physics/frequency";
import { responseSpectrum, scalarPSD } from "../physics/spectra";
import { normalize, participation, type Modal } from "../physics/modal";
import type { System } from "../physics/systems";
import { MatrixProvenance, MatrixView } from "./math/MatrixView";
import { DerivationNavigator, EquationBlock, type DerivationStep } from "./math/LiveMath";
import { token, type LinkRef, type StudioSelection } from "./selection";
import type { Sampler } from "./physics";
import type { Density } from "./density";

/**
 * Frame-driven DOM writes. The dock's live numbers are written straight from
 * the clock subscription into <output> elements, so playback never commits
 * React. There is no second RAF: this is the same clock everything else uses.
 */
function useSubscribe(
  clock: SimulationClock,
  fn: (t: number) => void,
  deps: DependencyList,
) {
  const latest = useRef(fn);
  latest.current = fn;
  useLayoutEffect(
    () => clock.subscribe((t) => latest.current(t)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clock, ...deps],
  );
}

export function EquationsTab({
  steps,
  step,
  onStep,
  overview,
  onOverview,
  active,
  onSelect,
  reduced,
  fallback,
}: {
  steps: DerivationStep[] | null;
  step: number;
  onStep(n: number): void;
  overview: boolean;
  onOverview(v: boolean): void;
  active: Set<string>;
  onSelect(s: StudioSelection): void;
  reduced: boolean;
  fallback: { lines: DerivationStep["lines"]; note: string } | null;
}) {
  if (steps?.length)
    return (
      <DerivationNavigator
        steps={steps}
        step={step}
        onStep={onStep}
        active={active}
        onSelect={onSelect}
        reduced={reduced}
        overview={overview}
        onOverview={onOverview}
      />
    );
  if (fallback)
    return (
      <div className="derivation">
        <EquationBlock
          lines={fallback.lines}
          active={active}
          onSelect={onSelect}
          step={0}
          reduced={reduced}
        />
        <p className="derivation-explain">{fallback.note}</p>
      </div>
    );
  return <p>No derivation is defined for this study.</p>;
}

export function ModesTab({
  modal,
  system,
  chosen,
  onChoose,
  normalization,
  onNormalization,
  sign,
  onSign,
  amplitude,
  mask,
  onMask,
  density,
  tracking,
  active,
}: {
  modal: Modal;
  system: System;
  chosen: number;
  onChoose(i: number): void;
  normalization: "max" | "mass";
  onNormalization(v: "max" | "mass"): void;
  sign: 1 | -1;
  onSign(): void;
  amplitude: number;
  mask: boolean[];
  onMask(i: number, on: boolean): void;
  density: Density;
  tracking: string;
  active: Set<string>;
}) {
  const shapes = useMemo(
    () => modal.modes.map((m) => normalize(m.phi, system.M, normalization, sign)),
    [modal, system, normalization, sign],
  );
  return (
    <div className="dock-modes">
      <p className="dock-lede">
        Kφ = ω²Mφ · f = ω/2π. φ and −φ describe the same physical mode. The
        animated amplitude is a visualization scale of {format(amplitude, 3)}, not a
        physical displacement.
      </p>
      {density !== "learn" && (
        <div className="dock-controls">
          <label className="dock-field">
            Normalization
            <select
              aria-label="Mode normalization"
              value={normalization}
              onChange={(e) => onNormalization(e.target.value as "max" | "mass")}
            >
              <option value="max">max |φ| = 1</option>
              <option value="mass">φᵀMφ = 1</option>
            </select>
          </label>
          <button onClick={onSign}>Flip mode sign</button>
          <span className="dock-hint">
            Switching normalization changes the numbers, never the relative pattern.
          </span>
        </div>
      )}
      <div className="dock-table-scroll">
        <table aria-label="Natural modes">
          <thead>
            <tr>
              <th scope="col">Mode</th>
              <th scope="col">Type</th>
              <th scope="col">f (Hz)</th>
              <th scope="col">ω (rad/s)</th>
              <th scope="col">φ</th>
              {density === "inspect" && <th scope="col">λ (s⁻²)</th>}
              {density === "inspect" && <th scope="col">ζ</th>}
              {density === "inspect" && <th scope="col">Residual</th>}
              <th scope="col">Include</th>
            </tr>
          </thead>
          <tbody>
            {modal.modes.map((m, i) => {
              const lit = active.has(token.mode(i));
              return (
                <tr key={i} data-linked={lit || undefined} className={lit ? "linked" : ""}>
                  <th scope="row">
                    <button
                      data-token={token.mode(i)}
                      aria-label={"Select mode " + (i + 1)}
                      aria-pressed={chosen === i}
                      className={chosen === i ? "selected" : ""}
                      onClick={() => onChoose(i)}
                    >
                      {i + 1}
                    </button>
                  </th>
                  <td>{m.kind}</td>
                  <td>{format(m.frequency)}</td>
                  <td>{format(m.omega)}</td>
                  <td className="mode-vector">
                    [{shapes[i].map((v) => format(v, 3)).join(", ")}]
                  </td>
                  {density === "inspect" && <td>{format(m.lambda)}</td>}
                  {density === "inspect" && (
                    <td>
                      {m.omega
                        ? format(modal.dampingGram[i][i] / (2 * m.omega), 4)
                        : "undefined at ω=0"}
                    </td>
                  )}
                  {density === "inspect" && <td>{m.residual.toExponential(2)}</td>}
                  <td>
                    <input
                      type="checkbox"
                      aria-label={"Include mode " + (i + 1)}
                      checked={mask[i] ?? true}
                      onChange={(e) => onMask(i, e.target.checked)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {density === "inspect" && (
        <p className="dock-diagnostics">
          max |ΦᵀMΦ − I| {modal.massError.toExponential(3)} · max |ΦᵀKΦ − Λ|{" "}
          {modal.stiffnessError.toExponential(3)} · zero threshold{" "}
          {modal.zeroTolerance.toExponential(3)} s⁻² ·{" "}
          {modal.classical
            ? "classical damping: modal equations decouple"
            : "coupled damping: use direct FRF or time integration"}
          . {tracking}
        </p>
      )}
    </div>
  );
}

export function MatricesTab({
  system,
  modal,
  links,
  selection,
  active,
  onSelect,
  density,
}: {
  system: System;
  modal: Modal;
  links: LinkRef[];
  selection: StudioSelection;
  active: Set<string>;
  onSelect(s: StudioSelection): void;
  density: Density;
}) {
  return (
    <div className="dock-matrices">
      <MatrixProvenance selection={selection} links={links} labels={system.labels} />
      <div className="matrix-row">
        {(["M", "K"] as const).map((name) => (
          <MatrixView
            key={name}
            name={name}
            values={system[name]}
            labels={system.labels}
            active={active}
            onSelect={onSelect}
          />
        ))}
        {system.C.some((r) => r.some((v) => v !== 0)) && (
          <MatrixView
            name="C"
            values={system.C}
            labels={system.labels}
            active={active}
            onSelect={onSelect}
          />
        )}
      </div>
      {density === "inspect" && (
        <div className="matrix-row">
          <figure className="matrix">
            <figcaption>
              <span className="matrix-name">ΦᵀMΦ</span>should be the identity
            </figcaption>
            <div className="matrix-scroll">
              <table>
                <tbody>
                  {modal.massGram.map((r, i) => (
                    <tr key={i}>
                      {r.map((v, j) => (
                        <td key={j}>{format(v, 3)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
          <figure className="matrix">
            <figcaption>
              <span className="matrix-name">ΦᵀKΦ</span>should be diagonal, holding ω²
            </figcaption>
            <div className="matrix-scroll">
              <table>
                <tbody>
                  {modal.stiffnessGram.map((r, i) => (
                    <tr key={i}>
                      {r.map((v, j) => (
                        <td key={j}>{format(v, 3)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
        </div>
      )}
    </div>
  );
}

export function AssemblyTab({
  system,
  links,
  active,
  onSelect,
  selection,
  fe,
}: {
  system: System;
  links: LinkRef[];
  active: Set<string>;
  onSelect(s: StudioSelection): void;
  selection: StudioSelection;
  fe?: {
    elements: { dofs: number[]; K: number[][]; M: number[][]; L: number }[];
    labels: string[];
    fixed: number[];
    free: number[];
  };
}) {
  if (fe) {
    const index = selection?.kind === "element" ? selection.index : null;
    const element = index !== null ? fe.elements[index] : null;
    return (
      <div className="dock-assembly">
        <ol className="assembly-path">
          {[
            "Element matrices",
            "DOF mapping",
            "Global K and M",
            "Boundary conditions",
            "Reduced K and M",
            "Generalized eigenproblem",
            "Mode shape",
          ].map((s, i) => (
            <li key={s} aria-current={i === (element ? 1 : 0) ? "step" : undefined}>
              {s}
            </li>
          ))}
        </ol>
        {element ? (
          <>
            <p>
              Element {index! + 1}, length {format(element.L, 4)} m, maps its local
              DOFs onto global{" "}
              {element.dofs.map((d) => fe.labels[d] ?? "dof " + (d + 1)).join(", ")}.
            </p>
            <div className="matrix-row">
              <figure className="matrix">
                <figcaption>
                  <span className="matrix-name">Kₑ</span>local stiffness
                </figcaption>
                <div className="matrix-scroll">
                  <table>
                    <tbody>
                      {element.K.map((r, i) => (
                        <tr key={i}>
                          {r.map((v, j) => (
                            <td key={j}>{v.toExponential(2)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </figure>
              <figure className="matrix">
                <figcaption>
                  <span className="matrix-name">Mₑ</span>consistent mass
                </figcaption>
                <div className="matrix-scroll">
                  <table>
                    <tbody>
                      {element.M.map((r, i) => (
                        <tr key={i}>
                          {r.map((v, j) => (
                            <td key={j}>{v.toExponential(2)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </figure>
            </div>
            <p>
              {fe.fixed.length
                ? `${fe.fixed.length} constrained DOF (${fe.fixed
                    .map((d) => fe.labels[d])
                    .join(", ")}) are eliminated, leaving ${fe.free.length} free DOF in the reduced eigenproblem.`
                : `No essential constraint: all ${fe.free.length} DOF stay free, so rigid-body modes survive.`}
            </p>
          </>
        ) : (
          <p>Select an element in the model browser or the viewport to trace it.</p>
        )}
      </div>
    );
  }
  return (
    <div className="dock-assembly">
      <p className="dock-lede">
        Each connector adds a rank-one block into the global matrices. Select one to
        see exactly which entries it populates.
      </p>
      <ul className="assembly-links">
        {links.map((l, i) => {
          const lit = active.has(token.spring(i));
          return (
            <li key={i}>
              <button
                data-token={token.spring(i)}
                data-linked={lit || undefined}
                className={lit ? "linked" : ""}
                aria-pressed={lit}
                onClick={() => onSelect({ kind: "spring", index: i })}
              >
                {l.label ?? "k" + (i + 1)} = {l.k} N/m
              </button>
              <span>
                {system.labels[l.i]} ↔{" "}
                {l.j === null ? "ground" : system.labels[l.j]} · adds +{l.k} to K
                {l.i + 1}
                {l.i + 1}
                {l.j !== null
                  ? `, −${l.k} to K${l.i + 1}${l.j + 1} and K${l.j + 1}${l.i + 1}, +${l.k} to K${l.j + 1}${l.j + 1}`
                  : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ResponseTab({
  clock,
  sampler,
  index,
  labels,
}: {
  clock: SimulationClock;
  sampler: Sampler;
  index: number;
  labels: string[];
}) {
  return (
    <div className="dock-response">
      <CorePlot clock={clock} solution={sampler} index={index} />
      <p className="dock-hint">
        Showing {labels[index] ?? "coordinate " + (index + 1)}. {sampler.label}.
      </p>
    </div>
  );
}

export function FrfTab({
  system,
  modal,
  out,
  input,
  onInput,
  kind,
  onKind,
  omega,
  labels,
}: {
  system: System;
  modal: Modal;
  out: number;
  input: number;
  onInput(i: number): void;
  kind: "receptance" | "mobility" | "accelerance";
  onKind(k: "receptance" | "mobility" | "accelerance"): void;
  omega: number;
  labels: string[];
}) {
  const data = useMemo(() => {
    const maxW = Math.max(30, Math.max(...modal.modes.map((m) => m.omega)) * 1.4);
    const frequencies = Array.from({ length: 241 }, (_, i) => (maxW * i) / 240);
    const values = frequencies.map((w) => {
      try {
        return magnitude(
          transfer(
            modal.classical
              ? modalFRFEntry(modal, w, out, input)
              : harmonicResponse(
                  system,
                  w,
                  system.M.map((_, i) => cx(i === input ? 1 : 0)),
                )[out],
            w,
            kind,
          ),
        );
      } catch {
        return null;
      }
    });
    let current: Complex | null = null;
    let difference: number | null = null;
    try {
      current = transfer(directFRF(system, omega)[out][input], omega, kind);
      if (modal.classical)
        difference = magnitude({
          re: directFRF(system, omega)[out][input].re - modalFRF(modal, omega)[out][input].re,
          im: directFRF(system, omega)[out][input].im - modalFRF(modal, omega)[out][input].im,
        });
    } catch {
      /* Singular points are gaps, never invented finite peaks. */
    }
    return { frequencies, values, current, difference };
  }, [system, modal, out, input, kind, omega]);

  return (
    <div className="dock-frf">
      <div className="dock-controls">
        <label className="dock-field">
          Input DOF
          <select
            aria-label="FRF input DOF"
            value={input}
            onChange={(e) => onInput(+e.target.value)}
          >
            {labels.map((l, i) => (
              <option key={i} value={i}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="dock-field">
          Response type
          <select
            aria-label="FRF response type"
            value={kind}
            onChange={(e) => onKind(e.target.value as typeof kind)}
          >
            {["receptance", "mobility", "accelerance"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
      <Curve
        x={data.frequencies}
        y={data.values}
        label={`|H| ${kind} · excitation Ω (rad/s); singular points omitted`}
      />
      <p>
        Output {labels[out]} per input {labels[input]}, in{" "}
        {kind === "receptance" ? "m/N" : kind === "mobility" ? "(m/s)/N" : "(m/s²)/N"} for
        translation. An FRF peak is an input-output property, not a mode shape.
      </p>
      {data.current ? (
        <p data-testid="frf-current">
          At Ω={omega}: Re {format(data.current.re)} · Im {format(data.current.im)} ·
          magnitude {format(magnitude(data.current))} · phase{" "}
          {format(phase(data.current))} rad · direct/modal difference{" "}
          {data.difference?.toExponential(2) ?? "coupled damping"}
        </p>
      ) : (
        <p role="status">
          Singular dynamic stiffness: no bounded steady-state FRF at this frequency.
        </p>
      )}
    </div>
  );
}

export function SpectrumTab({ zeta }: { zeta: number }) {
  const [dt, setDt] = useState(0.02);
  const [ratio, setRatio] = useState(zeta);
  const [text, setText] = useState(() =>
    Array.from(
      { length: 151 },
      (_, i) =>
        Math.sin(2 * Math.PI * 1.7 * i * 0.02) * Math.sin((Math.PI * i) / 150) ** 2,
    ).join(", "),
  );
  const [result, setResult] = useState<ReturnType<typeof responseSpectrum> | null>(null);
  const [error, setError] = useState("");
  return (
    <div className="dock-spectrum">
      <p className="dock-lede">
        A response spectrum is the set of maxima an elastic oscillator reaches over one
        record. It is not a power spectral density — the two answer different questions
        and never share a plot.
      </p>
      <div className="dock-controls">
        <label className="dock-field">
          Record dt (s)
          <input
            type="number"
            aria-label="Record dt"
            value={dt}
            step={0.001}
            onChange={(e) => setDt(e.currentTarget.valueAsNumber)}
          />
        </label>
        <label className="dock-field">
          Damping ratio
          <input
            type="number"
            aria-label="Spectrum damping ratio"
            value={ratio}
            step={0.01}
            onChange={(e) => setRatio(e.currentTarget.valueAsNumber)}
          />
        </label>
        <button
          onClick={() => {
            try {
              const values = text.split(",").map((s) => (s.trim() ? Number(s) : NaN));
              if (values.length > 2001) throw new Error("Maximum 2001 record samples.");
              setResult(
                responseSpectrum(values, dt, [0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3], ratio, 8),
              );
              setError("");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Compute response spectrum
        </button>
      </div>
      <label className="dock-field wide">
        Acceleration samples (m/s²)
        <textarea
          aria-label="Acceleration samples"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      {result && (
        <>
          <Curve
            x={result.map((r) => r.period)}
            y={result.map((r) => r.pseudoSa)}
            label="Pseudo-acceleration Sa (m/s²) versus period T (s)"
          />
          <div className="dock-table-scroll">
            <table aria-label="Response spectrum">
              <thead>
                <tr>
                  <th scope="col">T (s)</th>
                  <th scope="col">Sd (m)</th>
                  <th scope="col">pseudo-Sv (m/s)</th>
                  <th scope="col">pseudo-Sa (m/s²)</th>
                </tr>
              </thead>
              <tbody>
                {result.map((r) => (
                  <tr key={r.period}>
                    <th scope="row">{r.period}</th>
                    <td>{format(r.Sd)}</td>
                    <td>{format(r.pseudoSv)}</td>
                    <td>{format(r.pseudoSa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function PsdTab({
  system,
  modal,
  out,
  input,
  labels,
}: {
  system: System;
  modal: Modal;
  out: number;
  input: number;
  labels: string[];
}) {
  const [level, setLevel] = useState(0.2);
  const [max, setMax] = useState(20);
  const psd = useMemo(() => {
    try {
      if (
        modal.modes.some(
          (m, i) => m.frequency <= max && modal.dampingGram[i][i] <= 1e-14,
        )
      )
        throw new Error(
          "Undamped pole in PSD band: stationary variance is not bounded.",
        );
      const f = Array.from({ length: 1001 }, (_, i) => (max * i) / 1000);
      return {
        frequencies: f,
        ...scalarPSD(
          f,
          f.map(() => level),
          (w) =>
            modal.classical
              ? modalFRFEntry(modal, w, out, input)
              : harmonicResponse(
                  system,
                  w,
                  system.M.map((_, i) => cx(i === input ? 1 : 0)),
                )[out],
        ),
      };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [system, modal, out, input, level, max]);
  return (
    <div className="dock-psd">
      <p className="dock-lede">
        A power spectral density is a distribution of variance per hertz. Sx = |H|² Sf,
        RMS = √∫Sx df. Independent force input at {labels[input]}.
      </p>
      <div className="dock-controls">
        <label className="dock-field">
          Force PSD (N²/Hz)
          <input
            type="number"
            aria-label="Force PSD"
            value={level}
            step={0.05}
            onChange={(e) => setLevel(e.currentTarget.valueAsNumber)}
          />
        </label>
        <label className="dock-field">
          Upper frequency (Hz)
          <input
            type="number"
            aria-label="PSD upper frequency"
            value={max}
            step={1}
            onChange={(e) => setMax(e.currentTarget.valueAsNumber)}
          />
        </label>
      </div>
      {"error" in psd ? (
        <p role="status">{psd.error} Add positive damping or choose a supported band.</p>
      ) : (
        <>
          <Curve
            x={psd.frequencies}
            y={psd.output}
            label="Output PSD per Hz versus frequency f (Hz)"
          />
          <p data-testid="psd-rms">
            RMS = {format(psd.rms)} m · variance {format(psd.variance)} m² · 1001
            frequency points
          </p>
        </>
      )}
    </div>
  );
}

export function ResultsTab({
  system,
  modal,
  normalization,
  sign,
  influence,
  extra,
}: {
  system: System;
  modal: Modal;
  normalization: "max" | "mass";
  sign: 1 | -1;
  influence: number[];
  extra?: React.ReactNode;
}) {
  const pi = useMemo(
    () =>
      participation(
        modal.modes.map((m) => normalize(m.phi, system.M, normalization, sign)),
        system.M,
        influence,
      ),
    [modal, system, normalization, sign, influence],
  );
  return (
    <div className="dock-results">
      {extra}
      <p className="dock-lede">
        Γᵢ = (φᵢᵀMr)/(φᵢᵀMφᵢ), M_eff = (φᵢᵀMr)²/(φᵢᵀMφᵢ). Effective mass is not one
        component's mass; it is how much of the total the mode actually moves in this
        direction.
      </p>
      <div className="dock-table-scroll">
        <table aria-label="Effective modal mass">
          <thead>
            <tr>
              <th scope="col">Mode</th>
              <th scope="col">Γ</th>
              <th scope="col">Effective mass</th>
              <th scope="col">Ratio</th>
              <th scope="col">Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {pi.modes.map((m, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td>{format(m.gamma)}</td>
                <td>{format(m.effectiveMass)}</td>
                <td>{format(m.ratio)}</td>
                <td>{format(m.cumulative)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Total participating mass rᵀMr = {format(pi.total)} kg · cumulative{" "}
        {format(pi.modes.at(-1)!.cumulative * 100, 3)}%
      </p>
    </div>
  );
}

/** Energy exchange over the response window — 2D evidence, never the viewport. */
export function EnergyTab({
  clock,
  sampler,
  index,
}: {
  clock: SimulationClock;
  sampler: Sampler;
  index: number;
}) {
  const series = useMemo(() => {
    const times = Array.from({ length: 241 }, (_, i) => (sampler.horizon * i) / 240);
    return { times, energy: times.map((t) => sampler.sample(t).energy) };
  }, [sampler]);
  if (!sampler.energyMeaningful)
    return (
      <p role="status">
        Mechanical energy is not a meaningful scalar for this study: the support does
        work on the system, so the energy stored inside it is not conserved or
        monotonic.
      </p>
    );
  const decays = series.energy.at(-1)! < series.energy[0] * 0.999;
  return (
    <div className="dock-energy">
      <Curve x={series.times} y={series.energy} label="Total mechanical energy E (J) versus time t (s)" />
      <p>
        {decays
          ? "Energy falls because the damper dissipates it at Pd = cv². It is highest where the mass moves fastest, and zero at each turning point."
          : "Energy is constant: kinetic and potential exchange without loss. Nothing removes energy from an undamped free system."}
      </p>
      <LiveScalars clock={clock} sampler={sampler} index={index} />
    </div>
  );
}

/** Phase portrait for one coordinate. */
export function PhaseTab({
  clock,
  sampler,
  index,
  label,
}: {
  clock: SimulationClock;
  sampler: Sampler;
  index: number;
  label: string;
}) {
  const dot = useRef<SVGCircleElement | null>(null);
  const data = useMemo(() => {
    const points = Array.from({ length: 501 }, (_, i) => {
      const s = sampler.sample((sampler.horizon * i) / 500);
      return [s.x[index] ?? 0, s.v[index] ?? 0] as const;
    });
    const xe = Math.max(1e-6, ...points.map((p) => Math.abs(p[0])));
    const ve = Math.max(1e-6, ...points.map((p) => Math.abs(p[1])));
    return { points, xe, ve };
  }, [sampler, index]);
  useSubscribe(
    clock,
    (t) => {
      const s = sampler.sample(t);
      dot.current?.setAttribute("cx", String(300 + ((s.x[index] ?? 0) / data.xe) * 240));
      dot.current?.setAttribute("cy", String(110 - ((s.v[index] ?? 0) / data.ve) * 84));
    },
    [sampler, index, data],
  );
  return (
    <div className="dock-phase">
      <svg viewBox="0 0 600 220" role="img" aria-label={`Position velocity trajectory of ${label}`} className="phase-svg">
        <line x1="50" x2="550" y1="110" y2="110" className="zero-line" />
        <line x1="300" x2="300" y1="20" y2="200" className="zero-line" />
        <polyline
          className="phase-trace"
          points={data.points
            .map(
              (p) =>
                `${300 + (p[0] / data.xe) * 240},${110 - (p[1] / data.ve) * 84}`,
            )
            .join(" ")}
        />
        <circle ref={dot} r="5" className="phase-dot" />
        <text x="548" y="128" className="svg-micro" textAnchor="end">
          x ±{format(data.xe, 3)} m
        </text>
        <text x="306" y="30" className="svg-micro">
          v ±{format(data.ve, 3)} m/s
        </text>
      </svg>
      <p>
        A closed orbit means energy is conserved. A spiral toward the origin means it is
        being dissipated. This is what makes damping regimes distinguishable beyond
        &ldquo;it looks slower&rdquo;.
      </p>
    </div>
  );
}

/** Instantaneous force balance for one coordinate. */
export function ForcesTab({
  clock,
  sampler,
  system,
  index,
  labels,
}: {
  clock: SimulationClock;
  sampler: Sampler;
  system: System | undefined;
  index: number;
  labels: string[];
}) {
  return (
    <div className="dock-forces">
      <p className="dock-lede">
        Newton&rsquo;s second law, evaluated at the shared simulation time for{" "}
        {labels[index] ?? "coordinate " + (index + 1)}. Inertia, damping and stiffness
        terms sum to zero in free vibration.
      </p>
      <LiveForces clock={clock} sampler={sampler} system={system} index={index} />
    </div>
  );
}

function LiveForces({
  clock,
  sampler,
  system,
  index,
}: {
  clock: SimulationClock;
  sampler: Sampler;
  system: System | undefined;
  index: number;
}) {
  const root = useRef<HTMLDListElement>(null);
  useSubscribe(clock, (t) => {
    const s = sampler.sample(t);
    const el = root.current;
    if (!el || !system) return;
    const n = system.M.length;
    const dotRow = (a: number[][]) =>
      Array.from({ length: n }, (_, j) => a[index]?.[j] ?? 0);
    const inertia = dotRow(system.M).reduce((sum, m, j) => sum + m * (s.a[j] ?? 0), 0);
    const damping = dotRow(system.C).reduce((sum, c, j) => sum + c * (s.v[j] ?? 0), 0);
    const stiffness = dotRow(system.K).reduce((sum, k, j) => sum + k * (s.x[j] ?? 0), 0);
    const write = (key: string, value: number) => {
      const out = el.querySelector<HTMLOutputElement>(`[data-force="${key}"]`);
      if (out) out.value = format(value, 4);
    };
    write("inertia", inertia);
    write("damping", damping);
    write("stiffness", stiffness);
    write("residual", inertia + damping + stiffness);
  }, [sampler, system, index]);
  return (
    <dl className="force-balance" ref={root}>
      {[
        ["inertia", "m ẍ", "N"],
        ["damping", "c ẋ", "N"],
        ["stiffness", "k x", "N"],
        ["residual", "sum", "N"],
      ].map(([key, label, unit]) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd>
            <output data-force={key} aria-label={label + " term"} /> <span>{unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function LiveScalars({
  clock,
  sampler,
  index,
}: {
  clock: SimulationClock;
  sampler: Sampler;
  index: number;
}) {
  const root = useRef<HTMLDListElement>(null);
  useSubscribe(clock, (t) => {
    const s = sampler.sample(t);
    const el = root.current;
    if (!el) return;
    const set = (k: string, v: number) => {
      const out = el.querySelector<HTMLOutputElement>(`[data-scalar="${k}"]`);
      if (out) out.value = format(v, 4);
    };
    set("E", s.energy);
    set("x", s.x[index] ?? 0);
    set("v", s.v[index] ?? 0);
  }, [sampler, index]);
  return (
    <dl className="live-scalars" ref={root}>
      {[
        ["E", "E", "J"],
        ["x", "x", "m"],
        ["v", "v", "m/s"],
      ].map(([key, label, unit]) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd>
            <output data-scalar={key} aria-label={label + " live value"} />{" "}
            <span>{unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function BaseExcitationNote({
  system,
  omega,
  baseAmplitude,
  index,
}: {
  system: System;
  omega: number;
  baseAmplitude: number;
  index: number;
}) {
  try {
    const base = baseResponse(system, omega, cx(baseAmplitude));
    return (
      <p>
        At Ω={omega} rad/s: base |Y|={format(baseAmplitude)} m · relative |Z|=
        {format(magnitude(base.relative[index]))} m · absolute |X|=
        {format(magnitude(base.absolute[index]))} m · |X/Y|=
        {baseAmplitude
          ? format(magnitude(base.absolute[index]) / baseAmplitude)
          : "undefined for zero input"}
        .
      </p>
    );
  } catch {
    return <p role="status">No bounded base-excitation response at this frequency.</p>;
  }
}
