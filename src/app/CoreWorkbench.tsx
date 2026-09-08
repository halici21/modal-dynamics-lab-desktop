import { modalFRFEntry, harmonicResponse } from "../physics/frequency";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import { Workbench } from "../components/Workbench";
import { PlaybackBar } from "../components/PlaybackBar";
import { StatusReadout } from "../components/StatusReadout";
import { NumericField } from "../components/NumericField";
import {
  CoreStage,
  CorePlot,
  Curve,
  type CoreSolution,
} from "../visualization/CoreViews";
import { format } from "../visualization/sdofGeometry";
import {
  chain,
  rayleigh,
  fitRayleigh,
  type Boundary,
  type System,
} from "../physics/systems";
import {
  solveModal,
  modalResponse,
  normalize,
  participation,
  trackModes,
  type Modal,
} from "../physics/modal";
import {
  directFRF,
  modalFRF,
  sdofFRF,
  baseResponse,
  baseAccelerationResponse,
  cx,
  magnitude,
  phase,
  transfer,
  type Complex,
} from "../physics/frequency";
import { forcedSdof } from "../physics/dynamics";
import { responseSpectrum, scalarPSD } from "../physics/spectra";
import { solveFE, uniformFE, type ElementKind } from "../physics/fem";
import { rigid2D, rigid3D } from "../physics/rigid";
import { zeros, type Mat } from "../physics/common";
export const CORE_NAMES = [
  "Undamped SDOF",
  "Damped SDOF",
  "2DOF",
  "Mode Browser / 3DOF",
  "MDOF",
  "Free-Free",
  "Forced SDOF",
  "FRF",
  "Base Excitation",
  "Participation / Effective Mass",
  "Spectrum fundamentals",
  "Random vibration",
  "FE modal playground",
];
type View =
  | "Response"
  | "Modes"
  | "Matrices"
  | "FRF"
  | "Participation"
  | "Spectrum"
  | "PSD"
  | "Rigid basis";
const defaults = (module: number): View =>
  module === 3
    ? "Modes"
    : module === 7
      ? "FRF"
      : module === 9
        ? "Participation"
        : module === 10
          ? "Spectrum"
          : module === 11
            ? "PSD"
            : module === 5
              ? "Modes"
              : "Response";
function Field({
  label,
  value,
  onChange,
  min = 0,
  max = 1e6,
  unit = "",
}: {
  label: string;
  value: number;
  onChange(v: number): void;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <label className="core-field">
      <span>{label}</span>
      <NumericField
        label={label}
        value={value}
        min={min}
        max={max}
        unit={unit}
        strict
        onChange={onChange}
      />
    </label>
  );
}
function MatrixView({
  name,
  a,
  labels,
  onSelect,
}: {
  name: string;
  a: Mat;
  labels: string[];
  onSelect(i: number): void;
}) {
  return (
    <div className="core-matrix">
      <h3>{name}</h3>
      <div className="core-table-scroll">
        <table>
          <caption>{name} · rows and columns follow DOF labels</caption>
          <thead>
            <tr>
              <th scope="col">DOF</th>
              {labels.map((l, i) => (
                <th scope="col" key={i}>
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a.map((r, i) => (
              <tr key={i}>
                <th scope="row">
                  <button onClick={() => onSelect(i)}>{labels[i]}</button>
                </th>
                {r.map((v, j) => (
                  <td key={j}>
                    <button
                      aria-label={
                        name +
                        " row " +
                        (i + 1) +
                        " column " +
                        (j + 1) +
                        " value " +
                        v
                      }
                      onClick={() => onSelect(i)}
                    >
                      {format(v, 3)}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export function CoreWorkbench({
  module,
  clock,
  reduced,
  onReset,
  rail,
  learning,
}: {
  module: number;
  clock: SimulationClock;
  reduced: boolean;
  onReset(): void;
  rail(expanded: boolean): ReactNode;
  learning?: ReactNode;
}) {
  const startN = module === 2 ? 2 : module === 6 ? 1 : module === 4 ? 5 : 3;
  const [n, setN] = useState(startN),
    [masses, setMasses] = useState(Array(10).fill(1)),
    [springs, setSprings] = useState<number[]>(
      Array.from({ length: 11 }, (_, i) => (module === 6 && i === 1 ? 0 : 100)),
    );
  const [boundary, setBoundary] = useState<Boundary>(
      module === 5 ? "free-free" : "fixed-fixed",
    ),
    [alpha, setAlpha] = useState(
      (module >= 7 && module <= 9) || module === 11 ? 0.2 : 0,
    ),
    [beta, setBeta] = useState(
      (module >= 7 && module <= 9) || module === 11 ? 0.002 : 0,
    );
  const [view, setView] = useState<View>(defaults(module)),
    [selected, setSelected] = useState(0),
    [mode, setMode] = useState(0),
    [normalization, setNormalization] = useState<"max" | "mass">("max"),
    [sign, setSign] = useState(1);
  const [preview, setPreview] = useState(
      module === 3 || module === 5 || module === 12,
    ),
    [amplitude, setAmplitude] = useState(0.1),
    [x0, setX0] = useState<number[]>(
      Array.from({ length: 10 }, (_, i) => (i === 0 ? 0.1 : 0)),
    ),
    [v0, setV0] = useState(Array(10).fill(0)),
    [mask, setMask] = useState(Array(64).fill(true));
  const [force, setForce] = useState(2),
    [omega, setOmega] = useState(7),
    [forcePhase, setForcePhase] = useState(0),
    [forcing, setForcing] = useState<"harmonic" | "constant">("harmonic"),
    [sdofC, setSdofC] = useState(4);
  const [input, setInput] = useState(0),
    [frfKind, setFrfKind] = useState<"receptance" | "mobility" | "accelerance">(
      "receptance",
    ),
    [baseAmplitude, setBaseAmplitude] = useState(0.01);
  const [element, setElement] = useState<ElementKind>("beam"),
    [mesh, setMesh] = useState(4),
    [feBoundary, setFeBoundary] = useState<
      "cantilever" | "fixed-fixed" | "pinned" | "free-free"
    >("cantilever"),
    [angle, setAngle] = useState(0);
  const [custom, setCustom] = useState<System | null>(null),
    [draft, setDraft] = useState(""),
    [error, setError] = useState(""),
    [inspect, setInspect] = useState<string | null>(null);
  const [zeta, setZeta] = useState(0.05),
    [recordDt, setRecordDt] = useState(0.02),
    [recordText, setRecordText] = useState(() =>
      Array.from(
        { length: 151 },
        (_, i) =>
          Math.sin(2 * Math.PI * 1.7 * i * 0.02) *
          Math.sin((Math.PI * i) / 150) ** 2,
      ).join(", "),
    );
  const [spectrum, setSpectrum] = useState<ReturnType<
      typeof responseSpectrum
    > | null>(null),
    [psdLevel, setPsdLevel] = useState(0.2),
    [psdMax, setPsdMax] = useState(20);
  const [tracking, setTracking] = useState(
      "Frequency order; no parameter change yet.",
    ),
    previous = useRef<Modal | null>(null);
  const edit = (f: () => void) => {
    setError("");
    clock.pause();
    f();
  };
  const result = useMemo(() => {
    try {
      const fe =
        module === 12
          ? {
              model: uniformFE(
                element,
                mesh,
                feBoundary,
                1,
                element === "frame" ? angle : 0,
              ),
            }
          : null;
      const assembly = fe ? solveFE(fe.model) : null;
      let system: System =
        custom ??
        assembly?.system ??
        chain(masses.slice(0, n), springs.slice(0, n + 1), boundary);
      system = {
        ...system,
        C: custom
          ? custom.C
          : module === 6
            ? [[sdofC]]
            : rayleigh(system.M, system.K, alpha, beta),
      };
      const start = performance.now(),
        modal = solveModal(system),
        solveMs = performance.now() - start;
      return {
        system,
        modal,
        fe:
          fe && assembly
            ? { model: fe.model, expand: assembly.expand }
            : undefined,
        solveMs,
        error: "",
      };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [
    module,
    element,
    mesh,
    feBoundary,
    angle,
    custom,
    masses,
    springs,
    n,
    boundary,
    alpha,
    beta,
    sdofC,
  ]);
  const modal = result.modal,
    system = result.system,
    count = system?.M.length ?? n;
  const chosen = Math.min(mode, count - 1),
    dof = Math.min(selected, count - 1),
    inDof = Math.min(input, count - 1);
  useEffect(() => {
    if (!modal) return;
    if (
      previous.current &&
      previous.current.modes.length === count &&
      count <= 10
    ) {
      const matches = trackModes(previous.current, modal),
        match = matches[Math.min(mode, count - 1)];
      setMode(match.next);
      setTracking(
        "Tracked MAC " +
          format(match.mac, 4) +
          (match.ambiguous
            ? " · ambiguous eigenspace; individual mode identity is not unique."
            : " · shape identity retained across frequency ordering."),
      );
    }
    previous.current = modal;
  }, [modal, count]);
  const shape = useMemo(
    () =>
      modal
        ? normalize(
            modal.modes[chosen].phi,
            modal.system.M,
            normalization,
            sign,
          )
        : [],
    [modal, chosen, normalization, sign],
  );
  const solution = useMemo<CoreSolution | null>(() => {
    if (!modal || !system) return null;
    const highest = Math.max(
      1,
      ...modal.modes.map((m) => m.omega),
      module === 6 || module === 8 ? omega : 0,
    );
    const horizon = Math.min(
      8,
      32 / (preview ? Math.max(1, modal.modes[chosen].omega) : highest),
    );
    if (module === 6) {
      const s = forcedSdof(
        {
          mass: system.M[0][0],
          stiffness: system.K[0][0],
          damping: sdofC,
          x0: x0[0],
          v0: v0[0],
        },
        forcing === "constant"
          ? { kind: "constant", value: force }
          : { kind: "harmonic", amplitude: force, omega, phase: forcePhase },
      );
      return {
        horizon,
        components(t) {
          const p = s.sample(t);
          return { transient: p.transient.x, steady: p.steady?.x ?? null };
        },
        label: s.boundedSteadyState
          ? "Forced total response · transient + steady"
          : "No bounded steady state · analytical growth",
        sample(t) {
          const q = s.sample(t);
          return { x: [q.x], v: [q.v], a: [q.a], energy: q.energy };
        },
      };
    }
    if (module === 8) {
      try {
        const response = baseResponse(system, omega, cx(baseAmplitude));
        return {
          horizon,
          energyMeaningful: false,
          label: "Harmonic base · absolute x; z = x − y in analysis",
          sample(t) {
            const co = Math.cos(omega * t),
              si = Math.sin(omega * t),
              x = response.absolute.map((z) => z.re * co - z.im * si),
              v = response.absolute.map(
                (z) => -omega * (z.re * si + z.im * co),
              );
            return { x, v, a: x.map((v) => -omega * omega * v), energy: 0 };
          },
        };
      } catch {
        return null;
      }
    }
    const physicalX = Array.from({ length: count }, (_, i) => x0[i] ?? 0),
      physicalV = Array.from({ length: count }, (_, i) => v0[i] ?? 0);
    if (preview) {
      const phi = normalize(modal.modes[chosen].phi, system.M, "max", sign),
        w = modal.modes[chosen].omega;
      return {
        horizon,
        energyMeaningful: false,
        visual: true,
        label:
          (w
            ? "Single mode · actual natural frequency"
            : "Zero mode · static, no restoring stiffness") +
          " · visual amplitude only",
        sample(t) {
          const x = phi.map((v) => amplitude * v * Math.cos(w * t));
          return {
            x,
            v: phi.map((v) => -amplitude * v * w * Math.sin(w * t)),
            a: x.map((v) => -w * w * v),
            energy: 0,
          };
        },
      };
    }
    if (!modal.classical) return null;
    const response = modalResponse(
      modal,
      physicalX,
      physicalV,
      Array.from({ length: count }, (_, i) => mask[i] ?? true),
    );
    return {
      horizon,
      label: "Initial-value modal superposition · x in m, rotations in rad",
      sample: response.sample,
    };
  }, [
    modal,
    system,
    chosen,
    count,
    preview,
    amplitude,
    sign,
    x0,
    v0,
    mask,
    module,
    omega,
    force,
    forcing,
    forcePhase,
    sdofC,
    baseAmplitude,
  ]);
  useLayoutEffect(() => {
    if (import.meta.env.DEV)
      Object.assign(window, {
        __coreDebug: { modal, solution, solveMs: result.solveMs, count },
      });
  }, [modal, solution, result.solveMs, count]);
  const chooseDof = (i: number) => {
    clock.pause();
    setSelected(i);
    setInspect("DOF " + (i + 1));
  };
  const results = useMemo(() => {
    if (!system || !modal) return null;
    if (view === "FRF" || module === 8) {
      const maxW = Math.max(
          30,
          Math.max(...modal.modes.map((m) => m.omega)) * 1.4,
        ),
        frequencies = Array.from({ length: 241 }, (_, i) => (maxW * i) / 240),
        values = frequencies.map((w) => {
          try {
            return magnitude(
              transfer(
                modal.classical
                  ? modalFRFEntry(modal, w, dof, inDof)
                  : harmonicResponse(
                      system,
                      w,
                      system.M.map((_, i) => cx(i === inDof ? 1 : 0)),
                    )[dof],
                w,
                frfKind,
              ),
            );
          } catch {
            return null;
          }
        });
      let current: Complex | null = null,
        difference: number | null = null,
        base: ReturnType<typeof baseResponse> | null = null;
      try {
        current = transfer(
          directFRF(system, omega)[dof][inDof],
          omega,
          frfKind,
        );
        if (modal.classical)
          difference = magnitude({
            re:
              directFRF(system, omega)[dof][inDof].re -
              modalFRF(modal, omega)[dof][inDof].re,
            im:
              directFRF(system, omega)[dof][inDof].im -
              modalFRF(modal, omega)[dof][inDof].im,
          });
        base = baseResponse(system, omega, cx(baseAmplitude));
      } catch {
        /* Singular points are gaps, never finite invented peaks. */
      }
      return { frequencies, values, current, difference, base };
    }
    return null;
  }, [system, modal, view, module, dof, inDof, frfKind, omega, baseAmplitude]);
  const psd = useMemo(() => {
    if (view !== "PSD" || !system) return null;
    try {
      if (
        modal!.modes.some(
          (m, i) => m.frequency <= psdMax && modal!.dampingGram[i][i] <= 1e-14,
        )
      )
        throw new Error(
          "Undamped pole in PSD band: stationary variance is not bounded.",
        );
      const f = Array.from({ length: 1001 }, (_, i) => (psdMax * i) / 1000);
      return {
        frequencies: f,
        ...scalarPSD(
          f,
          f.map(() => psdLevel),
          (w) =>
            modal!.classical
              ? modalFRFEntry(modal!, w, dof, inDof)
              : harmonicResponse(
                  system,
                  w,
                  system.M.map((_, i) => cx(i === inDof ? 1 : 0)),
                )[dof],
        ),
      };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [view, system, psdMax, psdLevel, dof, inDof]);
  const pi = useMemo(
    () =>
      modal && system
        ? participation(
            modal.modes.map((m) =>
              normalize(m.phi, system.M, normalization, sign),
            ),
            system.M,
            system.M.map((_, i) =>
              result.fe
                ? system.labels[i].endsWith(element === "beam" ? "v" : "u")
                  ? 1
                  : 0
                : 1,
            ),
          )
        : null,
    [modal, system, normalization, sign, result.fe, element],
  );
  const labels = system?.labels ?? [];
  const select = (
    <label className="core-select">
      Analysis{" "}
      <select
        aria-label="Physics analysis"
        value={view}
        onChange={(e) => setView(e.target.value as View)}
      >
        {(
          [
            "Response",
            "Modes",
            "Matrices",
            "FRF",
            "Participation",
            "Spectrum",
            "PSD",
            "Rigid basis",
          ] as View[]
        ).map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </label>
  );
  const physicalControls = (
    <>
      {module !== 12 && (
        <>
          <label className="core-select">
            DOF count
            <select
              aria-label="DOF count"
              value={n}
              disabled={module === 2 || module === 6}
              onChange={(e) =>
                edit(() => {
                  setN(+e.target.value);
                  setCustom(null);
                  setSelected(0);
                  setMode(0);
                })
              }
            >
              {Array.from({ length: 10 }, (_, i) => i + 1)
                .filter((i) => i >= 2 || module === 6)
                .map((i) => (
                  <option key={i}>{i}</option>
                ))}
            </select>
          </label>
          {module !== 6 && (
            <label className="core-select">
              Boundary
              <select
                aria-label="Boundary condition"
                value={boundary}
                onChange={(e) =>
                  edit(() => {
                    setBoundary(e.target.value as Boundary);
                    setCustom(null);
                  })
                }
              >
                {["fixed-fixed", "fixed-free", "free-free"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          )}
          {masses.slice(0, n).map((m, i) => (
            <Field
              key={"m" + i}
              label={"Mass " + (i + 1)}
              value={m}
              unit="kg"
              min={0.01}
              max={100}
              onChange={(v) =>
                edit(() => {
                  setMasses((a) => a.map((x, j) => (i === j ? v : x)));
                  setCustom(null);
                })
              }
            />
          ))}
          <details>
            <summary>Spring coefficients</summary>
            {springs.slice(0, n + 1).map((k, i) => (
              <Field
                key={i}
                label={"Spring " + (i + 1)}
                value={k}
                unit="N/m"
                max={10000}
                onChange={(v) =>
                  edit(() => {
                    setSprings((a) => a.map((x, j) => (i === j ? v : x)));
                    setCustom(null);
                  })
                }
              />
            ))}
          </details>
        </>
      )}
      {module === 12 && (
        <>
          <label className="core-select">
            Element
            <select
              aria-label="FE element"
              value={element}
              onChange={(e) =>
                edit(() => {
                  setElement(e.target.value as ElementKind);
                  setMode(0);
                })
              }
            >
              {["bar", "beam", "frame"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="core-select">
            Mesh elements
            <select
              aria-label="Mesh elements"
              value={mesh}
              onChange={(e) =>
                edit(() => {
                  setMesh(+e.target.value);
                  setMode(0);
                })
              }
            >
              {[1, 2, 4, 8].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="core-select">
            FE constraints
            <select
              aria-label="FE boundary"
              value={feBoundary}
              onChange={(e) =>
                edit(() => {
                  setFeBoundary(e.target.value as typeof feBoundary);
                  setMode(0);
                })
              }
            >
              {["cantilever", "fixed-fixed", "pinned", "free-free"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          {element === "frame" && (
            <Field
              label="Frame angle"
              value={angle}
              min={-1.5}
              max={1.5}
              unit="rad"
              onChange={(v) => edit(() => setAngle(v))}
            />
          )}
          <p>
            Length 1 m · E = 20 MPa · ρ = 1000 kg/m³ · A = 0.01 m² · I = 10⁻⁵
            m⁴. Consistent mass, small linear deformation; no shear deformation.
          </p>
        </>
      )}
      {module === 6 ? (
        <Field
          label="Viscous damping"
          value={sdofC}
          max={100}
          unit="N·s/m"
          onChange={(v) => edit(() => setSdofC(v))}
        />
      ) : (
        <details>
          <summary>Rayleigh damping</summary>
          <Field
            label="Rayleigh alpha"
            value={alpha}
            max={10}
            unit="s⁻¹"
            onChange={(v) => edit(() => setAlpha(v))}
          />
          <Field
            label="Rayleigh beta"
            value={beta}
            max={1}
            unit="s"
            onChange={(v) => edit(() => setBeta(v))}
          />
          <button
            onClick={() => {
              try {
                const e = modal!.modes.filter((m) => m.omega > 0);
                const f = fitRayleigh(e[0].omega, 0.03, e.at(-1)!.omega, 0.05);
                edit(() => {
                  setAlpha(f.alpha);
                  setBeta(f.beta);
                });
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Fit 3% first / 5% last elastic mode
          </button>
        </details>
      )}
    </>
  );
  const excitationControls = (module === 6 ||
    module === 8 ||
    view === "FRF") && (
    <>
      <Field
        label="Excitation omega"
        value={omega}
        unit="rad/s"
        max={10000}
        onChange={(v) => edit(() => setOmega(v))}
      />
      {module === 6 && (
        <>
          <label className="core-select">
            Forcing
            <select
              aria-label="Forcing kind"
              value={forcing}
              onChange={(e) =>
                edit(() => setForcing(e.target.value as typeof forcing))
              }
            >
              <option value="harmonic">Harmonic</option>
              <option value="constant">Constant</option>
            </select>
          </label>
          <Field
            label="Force amplitude"
            value={force}
            min={-100}
            max={100}
            unit="N"
            onChange={(v) => edit(() => setForce(v))}
          />
          <Field
            label="Force phase"
            value={forcePhase}
            min={-6.3}
            max={6.3}
            unit="rad"
            onChange={(v) => edit(() => setForcePhase(v))}
          />
        </>
      )}
      {module === 8 && (
        <Field
          label="Base amplitude"
          value={baseAmplitude}
          max={1}
          unit="m"
          onChange={(v) => edit(() => setBaseAmplitude(v))}
        />
      )}
    </>
  );
  function modeTable() {
    return (
      modal && (
        <>
          <p>
            Kφ = λMφ · ω = √λ · f = ω/(2π). φ and −φ describe the same physical
            mode.
          </p>
          <div className="core-table-scroll">
            <table aria-label="Natural modes">
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Type</th>
                  <th>λ (s⁻²)</th>
                  <th>ω (rad/s)</th>
                  <th>f (Hz)</th>
                  <th>ζ</th>
                  <th>Residual</th>
                  <th>Include</th>
                </tr>
              </thead>
              <tbody>
                {modal.modes.map((m, i) => (
                  <tr key={i}>
                    <th>
                      <button
                        aria-label={"Select mode " + (i + 1)}
                        aria-pressed={chosen === i}
                        onClick={() =>
                          edit(() => {
                            setMode(i);
                            setPreview(true);
                          })
                        }
                      >
                        {i + 1}
                      </button>
                    </th>
                    <td>{m.kind}</td>
                    <td>{format(m.lambda)}</td>
                    <td>{format(m.omega)}</td>
                    <td>{format(m.frequency)}</td>
                    <td>
                      {m.omega
                        ? format(modal.dampingGram[i][i] / (2 * m.omega), 4)
                        : "undefined at ω=0"}
                    </td>
                    <td>{m.residual.toExponential(2)}</td>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={"Include mode " + (i + 1)}
                        checked={mask[i] ?? true}
                        onChange={(e) =>
                          edit(() => {
                            setMask((a) => {
                              const next = [...a];
                              next[i] = e.target.checked;
                              return next;
                            });
                            setPreview(false);
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>{tracking}</p>
        </>
      )
    );
  }
  const forcedReference = module===6 && system && system.K[0][0]>0 ? sdofFRF(system.M[0][0],sdofC,system.K[0][0],0) : null;
  const analysis = (
    <div className="core-analysis">
      {view === "Response" && solution && (
        <>
          <CorePlot clock={clock} solution={solution} index={dof} />
          {forcedReference && <p>Natural ωn = {format(forcedReference.naturalOmega)} rad/s · excitation Ω = {omega} rad/s · displacement resonance peak Ωr = {forcedReference.resonanceOmega===null?"no positive interior peak":format(forcedReference.resonanceOmega)+" rad/s"}. X/(F₀/k) = k |H(Ω)|; a damped peak need not occur at ωn.</p>}
          {module === 6 && (
            <p>
              F(t) ={" "}
              {forcing === "constant"
                ? force
                : force + " cos(" + omega + "t + " + forcePhase + ")"}{" "}
              N. Total = transient + steady when bounded. At undamped resonance
              the secular particular solution grows with time.
            </p>
          )}
          {module === 8 && results?.base && (
            <p>
              At Ω={omega} rad/s: base |Y|={format(baseAmplitude)} m · relative
              |Z|={format(magnitude(results.base.relative[dof]))} m · absolute
              |X|={format(magnitude(results.base.absolute[dof]))} m · |X/Y|=
              {baseAmplitude
                ? format(magnitude(results.base.absolute[dof]) / baseAmplitude)
                : "undefined for zero input"}
              .
            </p>
          )}
          {!preview && modal && module !== 6 && module !== 8 && (
            <p>
              q₀ = ΦᵀMx₀, q̇₀ = ΦᵀMv₀ in the mass-normalized basis. Masked modes
              are deliberately omitted; restore all for exact IC reconstruction.
            </p>
          )}
        </>
      )}
      {view === "Modes" && modeTable()}
      {view === "Matrices" && system && modal && (
        <>
          {(["M", "C", "K"] as const).map((k) => (
            <MatrixView
              key={k}
              name={k}
              a={system[k]}
              labels={labels}
              onSelect={chooseDof}
            />
          ))}
          <MatrixView
            name="ΦᵀMΦ"
            a={modal.massGram}
            labels={modal.modes.map((_, i) => "mode " + (i + 1))}
            onSelect={() => {}}
          />
          <MatrixView
            name="ΦᵀKΦ"
            a={modal.stiffnessGram}
            labels={modal.modes.map((_, i) => "mode " + (i + 1))}
            onSelect={() => {}}
          />
          <p>
            Assembly:{" "}
            {system.links
              ?.map(
                (l) =>
                  (l.label ?? "link") +
                  ": DOF " +
                  (l.i + 1) +
                  " ↔ " +
                  (l.j === null ? "ground" : "DOF " + (l.j + 1)) +
                  "; k=" +
                  l.k,
              )
              .join(" · ") ??
              "Element matrices assembled by global DOF map; essential constraints eliminated."}
          </p>
        </>
      )}
      {view === "FRF" && results && (
        <>
          <label className="core-select">
            Input DOF
            <select
              aria-label="FRF input DOF"
              value={inDof}
              onChange={(e) => setInput(+e.target.value)}
            >
              {labels.map((l, i) => (
                <option key={i} value={i}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="core-select">
            Response type
            <select
              aria-label="FRF response type"
              value={frfKind}
              onChange={(e) => setFrfKind(e.target.value as typeof frfKind)}
            >
              {["receptance", "mobility", "accelerance"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <Curve
            x={results.frequencies}
            y={results.values}
            label={
              "|H| " +
              frfKind +
              " · excitation Ω (rad/s); singular points omitted"
            }
          />
          <p>
            Output {labels[dof]} / input {labels[inDof]}. Units{" "}
            {frfKind === "receptance"
              ? "m/N"
              : frfKind === "mobility"
                ? "(m/s)/N"
                : "(m/s²)/N"}{" "}
            for translation; rotation uses rad and moment input uses N·m.
          </p>
          {results.current ? (
            <p data-testid="frf-current">
              At Ω={omega}: Re {format(results.current.re)} · Im{" "}
              {format(results.current.im)} · magnitude{" "}
              {format(magnitude(results.current))} · phase{" "}
              {format(phase(results.current))} rad · direct/modal difference{" "}
              {results.difference?.toExponential(2) ?? "coupled damping"}
            </p>
          ) : (
            <p role="status">
              Singular dynamic stiffness: no bounded steady-state FRF at this
              frequency.
            </p>
          )}
        </>
      )}
      {view === "Participation" && pi && (
        <>
          <p>
            Γᵢ = (φᵢᵀMr)/(φᵢᵀMφᵢ), M_eff = (φᵢᵀMr)²/(φᵢᵀMφᵢ). Influence r = 1
            for chain translations; FE translation v for a beam, u for a bar/frame.
          </p>
          <table aria-label="Effective modal mass">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Γ</th>
                <th>Effective mass</th>
                <th>Ratio</th>
                <th>Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {pi.modes.map((m, i) => (
                <tr key={i}>
                  <th>{i + 1}</th>
                  <td>{format(m.gamma)}</td>
                  <td>{format(m.effectiveMass)}</td>
                  <td>{format(m.ratio)}</td>
                  <td>{format(m.cumulative)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Total participating mass rᵀMr = {format(pi.total)} kg · cumulative{" "}
            {format(pi.modes.at(-1)!.cumulative * 100, 3)}%
          </p>
        </>
      )}
      {view === "Spectrum" && (
        <>
          <p>
            Piecewise-linear base acceleration record, m/s². Zero initial state;
            maxima over record duration only. Newmark average acceleration; at
            least 80 steps per period.
          </p>
          <Field
            label="Record dt"
            value={recordDt}
            min={0.001}
            max={1}
            unit="s"
            onChange={setRecordDt}
          />
          <Field
            label="Spectrum damping ratio"
            value={zeta}
            max={2}
            onChange={setZeta}
          />
          <label className="core-select">
            Acceleration samples
            <textarea
              aria-label="Acceleration samples"
              value={recordText}
              onChange={(e) => setRecordText(e.target.value)}
            />
          </label>
          <button
            onClick={() => {
              try {
                const values = recordText
                  .split(",")
                  .map((s) => (s.trim() ? Number(s) : NaN));
                if (values.length > 2001)
                  throw new Error("Maximum 2001 record samples.");
                setSpectrum(
                  responseSpectrum(
                    values,
                    recordDt,
                    [0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3],
                    zeta,
                    8,
                  ),
                );
                setError("");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Compute response spectrum
          </button>
          {spectrum && (
            <>
              <Curve
                x={spectrum.map((r) => r.period)}
                y={spectrum.map((r) => r.pseudoSa)}
                label="Pseudo-acceleration Sa (m/s²) versus period T (s)"
              />
              <table aria-label="Response spectrum">
                <thead>
                  <tr>
                    <th>T (s)</th>
                    <th>Sd (m)</th>
                    <th>pseudo-Sv (m/s)</th>
                    <th>pseudo-Sa (m/s²)</th>
                  </tr>
                </thead>
                <tbody>
                  {spectrum.map((r) => (
                    <tr key={r.period}>
                      <th>{r.period}</th>
                      <td>{format(r.Sd)}</td>
                      <td>{format(r.pseudoSv)}</td>
                      <td>{format(r.pseudoSa)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
      {view === "PSD" && (
        <>
          <p>
            Independent force input at {labels[inDof]}. One-sided density per
            Hz; Sx = |H|² Sf, RMS = √∫Sx(f)df. Finite band, trapezoidal
            quadrature; narrow peaks require refinement.
          </p>
          <Field
            label="Force PSD"
            value={psdLevel}
            max={100}
            unit="N²/Hz"
            onChange={setPsdLevel}
          />
          <Field
            label="PSD upper frequency"
            value={psdMax}
            min={0.1}
            max={1000}
            unit="Hz"
            onChange={setPsdMax}
          />
          {psd &&
            ("error" in psd ? (
              <p role="status">
                {psd.error} Add positive damping or choose a supported band.
              </p>
            ) : (
              <>
                <Curve
                  x={psd.frequencies}
                  y={psd.output}
                  label="Output PSD per Hz versus frequency f (Hz)"
                />
                <p data-testid="psd-rms">
                  RMS = {format(psd.rms)} m · variance {format(psd.variance)} m²
                  · 1001 frequency points
                </p>
              </>
            ))}
        </>
      )}
      {view === "Rigid basis" && (
        <>
          <p>
            Conceptual kinematics; no 3D solid/shell solver. Rotation is
            infinitesimal θ×(r−r_c); zero eigenvalues in actual structural
            models determine zero modes, not their index.
          </p>
          {[
            rigid2D(
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
              ],
              [0.5, 0.5],
            ),
            rigid3D(
              [
                [0, 0, 0],
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
              ],
              [0.25, 0.25, 0.25],
            ),
          ].map((r, i) => (
            <div key={i}>
              <h3>{i ? "3D: six rigid motions" : "2D: three rigid motions"}</h3>
              {r.names.map((name, j) => (
                <p key={name}>
                  {name}: [{r.vectors[j].map((v) => format(v, 2)).join(", ")}]
                </p>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
  return (
    <Workbench
      title={CORE_NAMES[module]}
      subtitle="Linear structural dynamics · pure numerical core · offline"
      selected={inspect}
      lens="Motion"
      hint="Select a coordinate or mode to inspect its physical meaning."
      rail={rail}
      toolbar={select}
      parameters={
        <div className="core-controls">
          {physicalControls}
          {excitationControls}
          {module !== 6 && module !== 8 && (
            <>
              <label>
                <input
                  type="checkbox"
                  checked={preview}
                  onChange={(e) => edit(() => setPreview(e.target.checked))}
                />{" "}
                Single mode preview
              </label>
              <Field
                label="Visual amplitude"
                value={amplitude}
                min={0.001}
                max={0.5}
                onChange={(v) => edit(() => setAmplitude(v))}
              />
            </>
          )}
          <label className="core-select">
            Selected coordinate
            <select
              aria-label="Selected coordinate"
              value={dof}
              onChange={(e) => setSelected(+e.target.value)}
            >
              {labels.map((l, i) => (
                <option key={i} value={i}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="core-select">
            Mode normalization
            <select
              aria-label="Mode normalization"
              value={normalization}
              onChange={(e) =>
                setNormalization(e.target.value as typeof normalization)
              }
            >
              <option value="max">max |φ| = 1</option>
              <option value="mass">φᵀMφ = 1</option>
            </select>
          </label>
          <button onClick={() => setSign(-sign)}>Flip mode sign</button>
          <details>
            <summary>Initial conditions</summary>
            {Array.from({ length: Math.min(count, 10) }, (_, i) => (
              <div key={i}>
                <Field
                  label={"x0 DOF " + (i + 1)}
                  value={x0[i] ?? 0}
                  min={-1}
                  max={1}
                  unit="m/rad"
                  onChange={(v) =>
                    edit(() => {
                      setX0((a) => a.map((x, j) => (i === j ? v : x)));
                      setPreview(false);
                    })
                  }
                />
                <Field
                  label={"v0 DOF " + (i + 1)}
                  value={v0[i] ?? 0}
                  min={-10}
                  max={10}
                  unit="m/s"
                  onChange={(v) =>
                    edit(() => {
                      setV0((a) => a.map((x, j) => (i === j ? v : x)));
                      setPreview(false);
                    })
                  }
                />
              </div>
            ))}
          </details>
          {module !== 6 && module !== 12 && (
            <details>
              <summary>Full matrix model</summary>
              <p>
                JSON with M, C, K and labels. Symmetric SPD M; PSD K/C. Direct
                FRF handles coupled viscous damping.
              </p>
              <textarea
                aria-label="Matrix model JSON"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button onClick={() => setDraft(JSON.stringify(system, null, 2))}>
                Copy current model to editor
              </button>
              <button
                onClick={() => {
                  try {
                    const candidate = JSON.parse(draft);
                    solveModal(candidate);
                    setCustom(candidate);
                    setSelected(0);
                    setMode(0);
                    setError("");
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Apply matrix model
              </button>
            </details>
          )}
          <p>
            Edits pause and re-evaluate the initial-value problem at the same
            time. Playback rate is separate from physical frequency.
          </p>
        </div>
      }
      stage={
        <div className="stage-column">
          {(error || result.error) && (
            <p className="core-error" role="alert">
              {error || result.error}
            </p>
          )}
          {solution ? (
            <CoreStage
              clock={clock}
              solution={solution}
              labels={labels}
              selected={dof}
              onSelect={chooseDof}
              fe={result.fe}
              links={system?.links}
              shape={
                modal
                  ? normalize(
                      modal.modes[chosen].phi,
                      modal.system.M,
                      "max",
                      sign,
                    ).map((v) => v * amplitude)
                  : []
              }
              staticShape={reduced && preview}
            />
          ) : (
            <p className="core-error" role="status">
              No supported response for this configuration. Inspect matrices or
              choose a nonsingular frequency.
            </p>
          )}
          <PlaybackBar clock={clock} reduced={reduced} onReset={onReset} />
          <div className="stage-results">
            <StatusReadout clock={clock} />
            <span>{count} DOF</span>
            {modal && (
              <span>
                Mode {chosen + 1}: {format(modal.modes[chosen].frequency)} Hz
              </span>
            )}
          </div>
        </div>
      }
      inspector={
        <div className="core-inspector">
          <h3>
            {labels[dof]} · mode {chosen + 1}
          </h3>
          <p>φ = [{shape.map((v) => format(v, 3)).join(", ")}]</p>
          {modal && (
            <>
              <p>
                Eigen residual {modal.modes[chosen].residual.toExponential(3)}
              </p>
              <p>max |ΦᵀMΦ − I| {modal.massError.toExponential(3)}</p>
              <p>max |ΦᵀKΦ − Λ| {modal.stiffnessError.toExponential(3)}</p>
              <p>Zero threshold {modal.zeroTolerance.toExponential(3)} s⁻²</p>
              <p>
                {modal.classical
                  ? "Classical damping: modal equations decouple."
                  : "Coupled damping: use direct FRF or numerical time integration."}
              </p>
              <p>{tracking}</p>
            </>
          )}
          {modeTable()}
        </div>
      }
      analysis={analysis}
      learning={learning}
    />
  );
}



