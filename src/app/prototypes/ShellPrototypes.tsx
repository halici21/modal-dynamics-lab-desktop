/**
 * CAD EXPERIENCE R3 — GATE 3 shell prototypes (A / B / C).
 *
 * These are controlled prototypes, not mockups: all three render the SAME real
 * 2DOF system solved by the frozen physics engine (chain -> solveModal ->
 * modalResponse) and animated by the SAME SimulationClock the production app
 * uses. Only the SHELL differs, so the comparison isolates information
 * architecture from physics and from renderer technology.
 *
 * Reachable at ?r3=shell-a | shell-b | shell-c. Removed after GATE 4 selects a
 * winner (the brief requires rejected shell runtime paths to be deleted).
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { SimulationClock } from "../../animation/SimulationClock";
import { chain } from "../../physics/systems";
import { modalResponse, normalize, solveModal } from "../../physics/modal";
import { format } from "../../visualization/sdofGeometry";

export type ShellPrototype = "shell-a" | "shell-b" | "shell-c";

type PartId = "ground-l" | "k1" | "m1" | "k2" | "m2" | "k3" | "ground-r";

const PARTS: { id: PartId; label: string; kind: string }[] = [
  { id: "ground-l", label: "Ground (left)", kind: "Support" },
  { id: "k1", label: "Spring k₁", kind: "Spring" },
  { id: "m1", label: "Mass m₁", kind: "Mass" },
  { id: "k2", label: "Spring k₂", kind: "Spring" },
  { id: "m2", label: "Mass m₂", kind: "Mass" },
  { id: "k3", label: "Spring k₃", kind: "Spring" },
  { id: "ground-r", label: "Ground (right)", kind: "Support" },
];

/** One real solved model shared by all three shells. */
function usePrototypeModel(masses: number[], springs: number[]) {
  return useMemo(() => {
    const system = chain(masses, springs, "fixed-fixed");
    const modal = solveModal(system);
    const response = modalResponse(modal, [0.08, -0.02], [0, 0]);
    return { system, modal, response };
  }, [masses, springs]);
}

/** Shared live stage. Subscribes to the production clock; no second RAF. */
function PrototypeStage({
  clock,
  model,
  selected,
  onSelect,
  compact,
}: {
  clock: SimulationClock;
  model: ReturnType<typeof usePrototypeModel>;
  selected: PartId | null;
  onSelect(id: PartId): void;
  compact?: boolean;
}) {
  const root = useRef<SVGSVGElement>(null);
  useEffect(
    () =>
      clock.subscribe((t) => {
        const s = model.response.sample(t);
        const el = root.current;
        if (!el) return;
        const px = s.x.map((v) => Math.max(-46, Math.min(46, v * 380)));
        el.querySelectorAll<SVGGElement>("[data-part-mass]").forEach((g, i) => {
          g.setAttribute("transform", `translate(${px[i] ?? 0} 0)`);
        });
        const centers = [260 + (px[0] ?? 0), 520 + (px[1] ?? 0)];
        const ends: [number, number][] = [
          [60, centers[0] - 46],
          [centers[0] + 46, centers[1] - 46],
          [centers[1] + 46, 720],
        ];
        el.querySelectorAll<SVGPathElement>("[data-part-spring]").forEach(
          (p, i) => {
            const [a, b] = ends[i];
            let d = `M${a} 180`;
            for (let k = 1; k <= 14; k++)
              d += ` L${a + ((b - a) * k) / 14} ${k === 14 ? 180 : 180 + (k % 2 ? 11 : -11)}`;
            p.setAttribute("d", d);
          },
        );
        const readout = el.querySelector<SVGTextElement>("[data-part-readout]");
        if (readout)
          readout.textContent = `x₁ ${format(s.x[0], 4)} m   x₂ ${format(s.x[1], 4)} m`;
      }),
    [clock, model],
  );
  return (
    <svg
      ref={root}
      className={"proto-stage" + (compact ? " compact" : "")}
      viewBox="0 40 780 260"
      aria-label="Two degree of freedom chain at the shared simulation time"
    >
      <path d="M60 90V270M720 90V270" className="proto-support" />
      <path d="M60 240H720" className="proto-rail" />
      {[0, 1, 2].map((i) => (
        <path key={i} data-part-spring={i} className="proto-spring" />
      ))}
      {[0, 1].map((i) => {
        const id = (i ? "m2" : "m1") as PartId;
        const cx = i ? 520 : 260;
        return (
          <g key={id} data-part-mass={i}>
            <g
              role="button"
              tabIndex={0}
              aria-label={`Select ${i ? "mass m2" : "mass m1"}`}
              aria-pressed={selected === id}
              className={"proto-mass" + (selected === id ? " selected" : "")}
              onClick={() => onSelect(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(id);
                }
              }}
            >
              <rect x={cx - 46} y={130} width={92} height={100} rx={3} />
              <text x={cx} y={186} textAnchor="middle">
                {i ? "m₂" : "m₁"}
              </text>
            </g>
          </g>
        );
      })}
      <text
        data-part-readout=""
        x={60}
        y={288}
        className="proto-readout"
      />
    </svg>
  );
}

function Tree({
  selected,
  onSelect,
  dense,
}: {
  selected: PartId | null;
  onSelect(id: PartId): void;
  dense?: boolean;
}) {
  return (
    <div className={"proto-tree" + (dense ? " dense" : "")} role="tree" aria-label="Model browser">
      <div className="proto-tree-group" role="presentation">
        <span className="proto-tree-head">Model · 2DOF chain</span>
        {PARTS.map((p) => (
          <button
            key={p.id}
            role="treeitem"
            aria-selected={selected === p.id}
            className={selected === p.id ? "selected" : ""}
            onClick={() => onSelect(p.id)}
          >
            <span className="proto-tree-kind">{p.kind}</span>
            {p.label}
          </button>
        ))}
      </div>
      <div className="proto-tree-group" role="presentation">
        <span className="proto-tree-head">Study · Modal</span>
        <button role="treeitem" aria-selected={false}>Mode 1</button>
        <button role="treeitem" aria-selected={false}>Mode 2</button>
      </div>
    </div>
  );
}

function Properties({
  selected,
  model,
}: {
  selected: PartId | null;
  model: ReturnType<typeof usePrototypeModel>;
}) {
  const part = PARTS.find((p) => p.id === selected);
  if (!part)
    return (
      <p className="proto-empty">
        Select a part in the viewport or the model browser to edit it.
      </p>
    );
  const i = part.id === "m2" ? 1 : 0;
  return (
    <dl className="proto-props">
      <dt>Type</dt>
      <dd>{part.kind}</dd>
      {part.kind === "Mass" ? (
        <>
          <dt>Mass</dt>
          <dd>{model.system.M[i][i]} kg</dd>
          <dt>Equation term</dt>
          <dd>m{i + 1} ẍ{i + 1}</dd>
        </>
      ) : part.kind === "Spring" ? (
        <>
          <dt>Stiffness</dt>
          <dd>
            {model.system.links?.find((l) => l.label === part.id)?.k ?? "—"} N/m
          </dd>
          <dt>Restoring force</dt>
          <dd>Fs = −k·Δx</dd>
        </>
      ) : (
        <>
          <dt>Constraint</dt>
          <dd>All DOF fixed</dd>
        </>
      )}
    </dl>
  );
}

function Modes({ model }: { model: ReturnType<typeof usePrototypeModel> }) {
  return (
    <table className="proto-modes">
      <caption>Natural modes · Kφ = ω²Mφ</caption>
      <thead>
        <tr>
          <th scope="col">Mode</th>
          <th scope="col">f (Hz)</th>
          <th scope="col">φ (max-normalised)</th>
        </tr>
      </thead>
      <tbody>
        {model.modal.modes.map((m, i) => (
          <tr key={i}>
            <th scope="row">{i + 1}</th>
            <td>{format(m.frequency, 4)}</td>
            <td>
              [
              {normalize(m.phi, model.system.M, "max")
                .map((v) => format(v, 3))
                .join(", ")}
              ]
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Transport({ clock }: { clock: SimulationClock }) {
  const [playing, setPlaying] = useState(() => clock.getState().playing);
  useEffect(
    () => clock.subscribeState(() => setPlaying(clock.getState().playing)),
    [clock],
  );
  return (
    <div className="proto-transport">
      <button onClick={() => (playing ? clock.pause() : clock.play())}>
        {playing ? "Pause" : "Play"}
      </button>
      <button onClick={() => clock.reset()}>Reset</button>
      <button onClick={() => clock.step(0.05)}>Step</button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* A — Shapr3D-heavy minimalist: full-bleed viewport, floating overlays */
/* ------------------------------------------------------------------ */
function ShellA({ clock, model }: { clock: SimulationClock; model: ReturnType<typeof usePrototypeModel> }) {
  const [selected, setSelected] = useState<PartId | null>(null);
  const [tree, setTree] = useState(false);
  const [math, setMath] = useState(false);
  return (
    <div className="proto proto-a">
      <div className="proto-a-viewport">
        <PrototypeStage clock={clock} model={model} selected={selected} onSelect={setSelected} />
      </div>
      <div className="proto-a-anchor-left">
        <button aria-expanded={tree} onClick={() => setTree(!tree)}>
          Items
        </button>
        {tree && (
          <div className="proto-float">
            <Tree selected={selected} onSelect={setSelected} />
          </div>
        )}
      </div>
      <div className="proto-a-anchor-right">
        {selected && (
          <div className="proto-float">
            <Properties selected={selected} model={model} />
          </div>
        )}
      </div>
      <div className="proto-a-foot">
        <Transport clock={clock} />
        <button aria-expanded={math} onClick={() => setMath(!math)}>
          Mathematics
        </button>
      </div>
      {math && (
        <div className="proto-a-sheet">
          <p>M ẍ + K x = 0 · det(K − ω²M) = 0</p>
          <Modes model={model} />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* B — Fusion/SolidWorks-heavy CAE: everything permanent and visible */
/* ---------------------------------------------------------------- */
function ShellB({ clock, model }: { clock: SimulationClock; model: ReturnType<typeof usePrototypeModel> }) {
  const [selected, setSelected] = useState<PartId | null>("m1");
  const groups: [string, string[]][] = [
    ["Study", ["New", "Duplicate", "Solve", "Presets"]],
    ["Model", ["Mass", "Spring", "Damper", "Constraint"]],
    ["View", ["Front", "Top", "Iso", "Fit"]],
    ["Display", ["Grid", "Vectors", "Labels", "Ghost"]],
    ["Inspect", ["Measure", "Residual", "MAC", "Gram"]],
    ["Results", ["Modes", "FRF", "Energy", "Export"]],
  ];
  return (
    <div className="proto proto-b">
      <div className="proto-b-ribbon">
        {groups.map(([g, items]) => (
          <div key={g} className="proto-b-group">
            <div className="proto-b-commands">
              {items.map((i) => (
                <button key={i}>{i}</button>
              ))}
            </div>
            <span>{g}</span>
          </div>
        ))}
      </div>
      <div className="proto-b-body">
        <aside className="proto-b-tree">
          <h2>Model browser</h2>
          <Tree selected={selected} onSelect={setSelected} dense />
        </aside>
        <div className="proto-b-center">
          <PrototypeStage clock={clock} model={model} selected={selected} onSelect={setSelected} compact />
          <Transport clock={clock} />
        </div>
        <aside className="proto-b-props">
          <h2>Property manager</h2>
          <Properties selected={selected} model={model} />
          <h2>System matrices</h2>
          <table className="proto-matrix">
            <caption>K (N/m)</caption>
            <tbody>
              {model.system.K.map((r, i) => (
                <tr key={i}>
                  {r.map((v, j) => (
                    <td key={j}>{format(v, 3)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </aside>
      </div>
      <div className="proto-b-dock">
        <div className="proto-b-tabs">
          {["Equations", "Response", "Forces", "Energy", "Phase", "Matrices", "Modes", "FRF", "Spectrum", "PSD", "Assembly", "Results"].map((t) => (
            <button key={t} aria-pressed={t === "Modes"}>
              {t}
            </button>
          ))}
        </div>
        <Modes model={model} />
      </div>
      <div className="proto-b-status">
        <span>2 DOF</span>
        <span>fixed-fixed</span>
        <span>classical damping</span>
        <span>residual 1.4e-14</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* C — Modal Dynamics Studio hybrid: compact tree, dominant viewport,      */
/*     contextual properties, first-class resizable equation/analysis dock */
/* ---------------------------------------------------------------------- */
function ShellC({ clock, model }: { clock: SimulationClock; model: ReturnType<typeof usePrototypeModel> }) {
  const [selected, setSelected] = useState<PartId | null>(null);
  const [dock, setDock] = useState(true);
  const [browser, setBrowser] = useState(true);
  return (
    <div
      className={
        "proto proto-c" +
        (browser ? "" : " no-browser") +
        (selected ? "" : " no-props") +
        (dock ? "" : " no-dock")
      }
    >
      <header className="proto-c-bar">
        <span className="proto-c-brand">Modal Dynamics Studio</span>
        <span className="proto-c-study">Study · 2DOF coupled chain</span>
        <div className="proto-c-tools">
          <button aria-pressed={browser} onClick={() => setBrowser(!browser)}>
            Browser
          </button>
          <button aria-pressed={dock} onClick={() => setDock(!dock)}>
            Equations
          </button>
        </div>
      </header>
      {browser && (
        <aside className="proto-c-browser">
          <Tree selected={selected} onSelect={setSelected} dense />
        </aside>
      )}
      <main className="proto-c-viewport">
        <div className="proto-c-strip">
          {["Select", "Force", "Energy", "Equation", "Measure"].map((t, i) => (
            <button key={t} aria-pressed={i === 0}>
              {t}
            </button>
          ))}
        </div>
        <PrototypeStage clock={clock} model={model} selected={selected} onSelect={setSelected} />
        <div className="proto-c-cube" aria-label="View orientation">
          {["Front", "Top", "Iso"].map((v) => (
            <button key={v}>{v}</button>
          ))}
        </div>
        <div className="proto-c-transport">
          <Transport clock={clock} />
        </div>
      </main>
      {selected && (
        <aside className="proto-c-props">
          <h2>{PARTS.find((p) => p.id === selected)?.label}</h2>
          <Properties selected={selected} model={model} />
        </aside>
      )}
      {dock && (
        <section className="proto-c-dock">
          <div className="proto-c-dock-tabs">
            {["Equations", "Matrices", "Modes", "Response"].map((t, i) => (
              <button key={t} aria-pressed={i === 0}>
                {t}
              </button>
            ))}
          </div>
          <div className="proto-c-dock-body">
            <p className="proto-c-eq">
              m₁ẍ₁ + (k₁+k₂)x₁ − k₂x₂ = 0 &nbsp;·&nbsp; m₂ẍ₂ − k₂x₁ + (k₂+k₃)x₂ = 0
            </p>
            <Modes model={model} />
          </div>
        </section>
      )}
    </div>
  );
}

export function ShellPrototypes({
  clock,
  which,
}: {
  clock: SimulationClock;
  which: ShellPrototype;
}) {
  const masses = useMemo(() => [1, 1], []);
  const springs = useMemo(() => [100, 60, 100], []);
  const model = usePrototypeModel(masses, springs);
  useEffect(() => {
    clock.play();
    return () => clock.pause();
  }, [clock]);
  const shells: Record<ShellPrototype, ReactNode> = {
    "shell-a": <ShellA clock={clock} model={model} />,
    "shell-b": <ShellB clock={clock} model={model} />,
    "shell-c": <ShellC clock={clock} model={model} />,
  };
  return <>{shells[which]}</>;
}
