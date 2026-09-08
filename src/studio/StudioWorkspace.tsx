/**
 * Modal Dynamics Studio — the workspace container.
 *
 * Owns study state, calls the frozen physics engine once (via ./physics), and
 * hands the same solved objects to every surface: model browser, viewport,
 * property manager, equations, matrices and evidence plots. One selection, one
 * solve, one clock.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import { beamInterpolate } from "../physics/fem";
import { trackModes, type Modal } from "../physics/modal";
import type { Boundary } from "../physics/systems";
import { SDOF_LIMITS } from "../physics/sdof";
import { format } from "../visualization/sdofGeometry";
import {
  DensitySwitcher,
  StatusLine,
  StudySelector,
  ToolStrip,
  Transport,
} from "./Chrome";
import {
  AssemblyTab,
  AssemblyTab as _Assembly,
  BaseExcitationNote,
  EnergyTab,
  EquationsTab,
  ForcesTab,
  FrfTab,
  MatricesTab,
  ModesTab,
  PhaseTab,
  PsdTab,
  ResponseTab,
  ResultsTab,
  SpectrumTab,
} from "./DockContent";
import { rulesFor, type Density } from "./density";
import { chainTree, feTree, studyFor, type DockTab, type TreeGroup } from "./model";
import { ModelBrowser } from "./ModelBrowser";
import { extentOf, solveStudio, type StudioInputs } from "./physics";
import { Properties, propertyTitle, type PropertyContext } from "./Properties";
import {
  activeTokens,
  selectionForToken,
  selectionKey,
  type LinkRef,
  type StudioSelection,
} from "./selection";
import { StudioShell, type ShellPanes } from "./StudioShell";
import { CadViewport } from "./viewport/CadViewport";
import type { FrameData, ViewportModel } from "./viewport/scene";
import {
  dampedSdofSteps,
  femSteps,
  forcedSdofSteps,
  freeFreeSteps,
  mdofSteps,
  twoDofSteps,
  undampedSdofSteps,
} from "./math/derivations";

void _Assembly;

const SPAN = 8;
const RIGID_DOFS = ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz"];

function defaultsFor(module: number) {
  const n = module === 2 ? 2 : module === 6 ? 1 : module === 4 ? 5 : 3;
  return {
    n,
    boundary: (module === 5 ? "free-free" : "fixed-fixed") as Boundary,
    alpha: (module >= 7 && module <= 9) || module === 11 ? 0.2 : 0,
    beta: (module >= 7 && module <= 9) || module === 11 ? 0.002 : 0,
    preview: module === 3 || module === 5 || module === 12 || module === 4,
  };
}

export function StudioWorkspace({
  clock,
  module,
  onModule,
  density,
  onDensity,
  theme,
  onTheme,
  reduced,
  forceSvg,
  nativeError,
}: {
  clock: SimulationClock;
  module: number;
  onModule(m: number): void;
  density: Density;
  onDensity(d: Density): void;
  theme: "dark" | "light";
  onTheme(t: "dark" | "light"): void;
  reduced: boolean;
  forceSvg: boolean;
  nativeError: boolean;
}) {
  const study = studyFor(module);
  const rules = rulesFor(density);
  const seed = defaultsFor(module);

  /* ---------------- state ---------------- */
  const [revision, setRevision] = useState(0);
  const [selection, setSelection] = useState<StudioSelection>(null);
  const [tool, setTool] = useState(study.tools[0]);
  const [tab, setTab] = useState<DockTab>(study.tabs[0]);
  const [panes, setPanes] = useState<ShellPanes>({
    browser: true,
    properties: true,
    dock: true,
  });
  const [step, setStep] = useState(0);
  const [overview, setOverview] = useState(false);

  const [sdof, setSdof] = useState({
    mass: 1,
    stiffness: 100,
    x0: 0.1,
    v0: 0,
    damping: 4,
  });
  const [n, setN] = useState(seed.n);
  const [masses, setMasses] = useState<number[]>(() => Array(10).fill(1));
  const [springs, setSprings] = useState<number[]>(() =>
    Array.from({ length: 11 }, (_, i) => (module === 6 && i === 1 ? 0 : 100)),
  );
  const [boundary, setBoundary] = useState<Boundary>(seed.boundary);
  const [alpha, setAlpha] = useState(seed.alpha);
  const [beta, setBeta] = useState(seed.beta);
  const [sdofC, setSdofC] = useState(4);
  const [x0, setX0] = useState<number[]>(() =>
    Array.from({ length: 10 }, (_, i) => (i === 0 ? 0.1 : 0)),
  );
  const [v0, setV0] = useState<number[]>(() => Array(10).fill(0));
  const [mask, setMask] = useState<boolean[]>(() => Array(16).fill(true));
  const [preview, setPreview] = useState(seed.preview);
  const [mode, setMode] = useState(0);
  const [normalization, setNormalization] = useState<"max" | "mass">("max");
  const [sign, setSign] = useState<1 | -1>(1);
  const [amplitude, setAmplitude] = useState(0.1);
  const [dofIndex, setDofIndex] = useState(0);
  const [inputDof, setInputDof] = useState(0);
  const [frfKind, setFrfKind] = useState<"receptance" | "mobility" | "accelerance">(
    "receptance",
  );
  const [omega, setOmega] = useState(7);
  const [force, setForce] = useState(2);
  const [forcePhase, setForcePhase] = useState(0);
  const [forcing] = useState<"harmonic" | "constant">("harmonic");
  const [baseAmplitude, setBaseAmplitude] = useState(0.01);
  const [element, setElement] = useState<"bar" | "beam" | "frame">("beam");
  const [mesh, setMesh] = useState(4);
  const [feBoundary, setFeBoundary] = useState<
    "cantilever" | "fixed-fixed" | "pinned" | "free-free"
  >("cantilever");
  const [angle] = useState(0);
  const [rigidDof, setRigidDof] = useState(0);
  const [tracking, setTracking] = useState(
    "Frequency order; no parameter change yet.",
  );
  const [settingsError, setSettingsError] = useState("");
  const previousModal = useRef<Modal | null>(null);

  /* Study switch resets the study-scoped state but keeps density and panes. */
  useEffect(() => {
    const next = defaultsFor(module);
    setN(next.n);
    setBoundary(next.boundary);
    setAlpha(next.alpha);
    setBeta(next.beta);
    setPreview(next.preview);
    setSelection(null);
    setMode(0);
    setDofIndex(0);
    setInputDof(0);
    setStep(0);
    setOverview(false);
    setSprings(Array.from({ length: 11 }, (_, i) => (module === 6 && i === 1 ? 0 : 100)));
    previousModal.current = null;
    clock.pause();
    clock.setTime(0);
  }, [module, clock]);

  useEffect(() => {
    setTool(study.tools[0]);
    setTab(study.tabs[0]);
  }, [study]);

  /* ---------------- physics (one call) ---------------- */
  const inputs: StudioInputs = useMemo(
    () => ({
      module,
      stage: study.stage,
      sdof,
      n,
      masses,
      springs,
      boundary,
      alpha,
      beta,
      sdofC,
      x0,
      v0,
      mask,
      preview,
      mode,
      amplitude,
      sign,
      force,
      omega,
      forcePhase,
      forcing,
      baseAmplitude,
      element,
      mesh,
      feBoundary,
      angle,
      rigidDof,
    }),
    [
      module, study.stage, sdof, n, masses, springs, boundary, alpha, beta, sdofC,
      x0, v0, mask, preview, mode, amplitude, sign, force, omega, forcePhase,
      forcing, baseAmplitude, element, mesh, feBoundary, angle, rigidDof,
    ],
  );
  const physics = useMemo(() => solveStudio(inputs), [inputs]);
  const { system, modal, sdof: sdofSolution, assembly, sampler, error } = physics;
  const count = system?.M.length ?? (sdofSolution ? 1 : n);
  const chosen = Math.min(mode, Math.max(0, (modal?.modes.length ?? 1) - 1));
  const dof = Math.min(dofIndex, count - 1);
  const inDof = Math.min(inputDof, count - 1);
  const links = (system?.links ?? []) as LinkRef[];

  /* Mode tracking across parameter changes — reuses the frozen trackModes. */
  useEffect(() => {
    if (!modal) return;
    const prev = previousModal.current;
    if (prev && prev.modes.length === modal.modes.length && modal.modes.length <= 10) {
      try {
        const matches = trackModes(prev, modal);
        const match = matches[Math.min(mode, modal.modes.length - 1)];
        if (match) {
          setMode(match.next);
          setTracking(
            "Tracked MAC " +
              format(match.mac, 4) +
              (match.ambiguous
                ? " · ambiguous eigenspace; individual mode identity is not unique."
                : " · shape identity retained across frequency ordering."),
          );
        }
      } catch {
        setTracking("Mode tracking unavailable for this configuration.");
      }
    }
    previousModal.current = modal;
    // mode is deliberately excluded: tracking sets it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  const extent = useMemo(() => extentOf(sampler), [sampler]);

  /* ---------------- selection ---------------- */
  const active = useMemo(() => activeTokens(selection, links), [selection, links]);
  const select = useCallback(
    (next: StudioSelection) => {
      setSelection((current) => (selectionKey(current) === selectionKey(next) ? null : next));
      if (next && (next.kind === "mode")) {
        setMode(next.index);
        setPreview(true);
      }
      if (next && (next.kind === "mass" || next.kind === "dof")) setDofIndex(next.index);
      setPanes((p) => ({ ...p, properties: true }));
    },
    [],
  );
  const selectByKey = useCallback(
    (key: string) => {
      const [kind, index] = key.split(":");
      if (kind === "ground") select({ kind: "ground", index: Number(index) });
      else if (kind === "mass") select({ kind: "mass", index: Number(index) });
      else if (kind === "spring") select({ kind: "spring", index: Number(index) });
      else if (kind === "damper") select({ kind: "damper", index: Number(index) });
      else if (kind === "node") select({ kind: "node", index: Number(index) });
      else if (kind === "element") select({ kind: "element", index: Number(index) });
      else select(selectionForToken(key));
    },
    [select],
  );
  const viewportSelectionKey = selection
    ? selection.kind === "mass" ||
      selection.kind === "spring" ||
      selection.kind === "damper" ||
      selection.kind === "node" ||
      selection.kind === "element" ||
      selection.kind === "ground"
      ? `${selection.kind}:${selection.index}`
      : selection.kind === "dof"
        ? `mass:${selection.index}`
        : null
    : null;

  /* ---------------- viewport model ---------------- */
  const viewportModel = useMemo<ViewportModel>(() => {
    if (study.stage === "rigid")
      return { kind: "rigid", span: SPAN };
    if (study.stage === "fe" && assembly)
      return {
        kind: "fe",
        nodes: assembly.nodes.map((p) => [p[0], p[1]] as [number, number]),
        elements: assembly.elementData.map(
          (e) => [e.nodes[0], e.nodes[1]] as [number, number],
        ),
        fixed: assembly.fixed,
        perNode: assembly.perNode,
        span: SPAN,
      };
    const total = study.stage === "sdof" ? 1 : count;
    const size = Math.min(1.25, (SPAN / (total + 1)) * 0.62);
    const positions = Array.from(
      { length: total },
      (_, i) => -SPAN / 2 + (SPAN * (i + 1)) / (total + 1),
    );
    const labels =
      system?.labels.slice(0, total) ??
      Array.from({ length: total }, (_, i) => "x" + (i + 1));
    const springSpecs =
      study.stage === "sdof"
        ? [{ from: null, to: 0, index: 0 }]
        : links.map((l, index) =>
            l.j === null
              ? l.i === 0
                ? { from: null, to: 0, index }
                : { from: l.i, to: null, index }
              : { from: l.i, to: l.j, index },
          );
    const damperSpecs =
      study.stage === "sdof"
        ? module === 1
          ? [{ from: null, to: 0, index: 0 }]
          : []
        : links
            .map((l, index) => ({ l, index }))
            .filter(({ l }) => (l.c ?? 0) > 0 || (system?.C[l.i]?.[l.i] ?? 0) > 0)
            .slice(0, 1)
            .map(({ l, index }) =>
              l.j === null
                ? l.i === 0
                  ? { from: null, to: 0, index }
                  : { from: l.i, to: null, index }
                : { from: l.i, to: l.j, index },
            );
    return {
      kind: "chain",
      positions,
      sizes: Array(total).fill(size),
      labels,
      springs: springSpecs,
      dampers: damperSpecs,
      span: SPAN,
    };
  }, [study.stage, assembly, count, links, system, module]);

  /* ---------------- per-frame data (no React) ---------------- */
  const showForces = tool === "Force";
  const frameFor = useCallback(
    (t: number): FrameData => {
      if (!sampler) return { offsets: [] };
      const s = sampler.sample(t);
      if (study.stage === "rigid") {
        const a = amplitude * 6 * Math.cos((modal?.modes[chosen]?.omega || 1.2) * t);
        const trans: [number, number, number] = [0, 0, 0];
        const rot: [number, number, number] = [0, 0, 0];
        if (rigidDof < 3) trans[rigidDof] = a;
        else rot[rigidDof - 3] = a * 0.5;
        return { offsets: [], rigid: { t: trans, r: rot } };
      }
      if (study.stage === "fe" && assembly) {
        const full = assembly.expand(s.x);
        const nodes = assembly.nodes;
        const kind = assembly.perNode === 1 ? "bar" : assembly.perNode === 2 ? "beam" : "frame";
        const per = assembly.perNode;
        const L = Math.max(...nodes.map((p) => Math.hypot(p[0], p[1]))) || 1;
        const gain = (0.22 * SPAN) / Math.max(1e-6, extent);
        const pts: number[] = [];
        assembly.elementData.forEach((e) => {
          const [i, j] = e.nodes;
          const dx = nodes[j][0] - nodes[i][0];
          const dy = nodes[j][1] - nodes[i][1];
          const len = Math.hypot(dx, dy) || 1;
          const c = dx / len;
          const sn = dy / len;
          for (let k = 0; k <= 16; k++) {
            const u = k / 16;
            let ux = 0;
            let uy = 0;
            if (kind === "bar") ux = (1 - u) * full[i] + u * full[j];
            else if (kind === "beam")
              uy = beamInterpolate(
                full[per * i],
                full[per * i + 1],
                full[per * j],
                full[per * j + 1],
                len,
                u,
              );
            else {
              const u1 = c * full[3 * i] + sn * full[3 * i + 1];
              const v1 = -sn * full[3 * i] + c * full[3 * i + 1];
              const u2 = c * full[3 * j] + sn * full[3 * j + 1];
              const v2 = -sn * full[3 * j] + c * full[3 * j + 1];
              const ax = (1 - u) * u1 + u * u2;
              const vv = beamInterpolate(v1, full[3 * i + 2], v2, full[3 * j + 2], len, u);
              ux = c * ax - sn * vv;
              uy = sn * ax + c * vv;
            }
            pts.push(
              ((nodes[i][0] + u * dx + gain * ux) / L) * SPAN - SPAN / 2,
              ((nodes[i][1] + u * dy + gain * uy) / L) * SPAN,
              0,
            );
          }
        });
        return { offsets: [], fePoints: pts };
      }
      const travel = (viewportModel.kind === "chain" ? viewportModel.sizes[0] : 0.6) * 0.62;
      const offsets = s.x.map((v) =>
        Math.max(-travel, Math.min(travel, (travel * v) / extent)),
      );
      if (!showForces || !system) return { offsets };
      const maxForce = Math.max(
        1e-9,
        ...system.K.map((row, i) =>
          Math.abs(row.reduce((acc, k, j) => acc + k * (extent * (i === j ? 1 : 0)), 0)),
        ),
      );
      const forces = s.x.map((_, i) => {
        const f = -(system.K[i] ?? []).reduce(
          (acc, k, j) => acc + k * (s.x[j] ?? 0),
          0,
        );
        return Math.max(-1, Math.min(1, f / maxForce));
      });
      return { offsets, forces };
    },
    [sampler, study.stage, assembly, extent, viewportModel, showForces, system, amplitude, modal, chosen, rigidDof],
  );

  /* ---------------- browser tree ---------------- */
  const tree: TreeGroup[] = useMemo(() => {
    if (study.stage === "fe" && assembly) return feTree(assembly, modal, element, study);
    if (!system) {
      if (!sdofSolution) return [];
      return chainTree(
        {
          M: [[sdofSolution.parameters.mass]],
          C: [[sdofSolution.damping]],
          K: [[sdofSolution.parameters.stiffness]],
          labels: ["x1"],
          links: [
            { i: 0, j: null, k: sdofSolution.parameters.stiffness, label: "k1" },
          ],
        },
        undefined,
        study,
        {
          x0: [sdofSolution.parameters.x0],
          v0: [sdofSolution.parameters.v0],
          damped: module === 1,
        },
      );
    }
    return chainTree(system, modal, study, { x0, v0, damped: module === 1 || alpha > 0 || beta > 0 });
  }, [study, assembly, modal, element, system, sdofSolution, x0, v0, module, alpha, beta]);

  /* ---------------- editing ---------------- */
  const edit = (f: () => void) => {
    clock.pause();
    f();
  };
  const onMass = (i: number, value: number) =>
    edit(() => {
      if (study.stage === "sdof") setSdof((p) => ({ ...p, mass: value }));
      else setMasses((a) => a.map((m, j) => (j === i ? value : m)));
    });
  const onSpring = (i: number, value: number) =>
    edit(() => {
      if (study.stage === "sdof") setSdof((p) => ({ ...p, stiffness: value }));
      else setSprings((a) => a.map((k, j) => (j === i ? value : k)));
    });
  const onDamper = (i: number, value: number) =>
    edit(() => {
      if (study.stage === "sdof") setSdof((p) => ({ ...p, damping: value }));
      else if (module === 6) setSdofC(value);
      else setAlpha(value / Math.max(1e-6, system?.M[i]?.[i] ?? 1));
    });
  const onInitial = (i: number, key: "x0" | "v0", value: number) =>
    edit(() => {
      if (study.stage === "sdof") setSdof((p) => ({ ...p, [key]: value }));
      else {
        (key === "x0" ? setX0 : setV0)((a) => a.map((x, j) => (j === i ? value : x)));
        setPreview(false);
      }
      clock.setTime(0);
    });

  const reset = useCallback(() => {
    clock.reset();
    const next = defaultsFor(module);
    setSdof({ mass: 1, stiffness: 100, x0: 0.1, v0: 0, damping: 4 });
    setMasses(Array(10).fill(1));
    setSprings(Array.from({ length: 11 }, (_, i) => (module === 6 && i === 1 ? 0 : 100)));
    setN(next.n);
    setBoundary(next.boundary);
    setAlpha(next.alpha);
    setBeta(next.beta);
    setPreview(next.preview);
    setX0(Array.from({ length: 10 }, (_, i) => (i === 0 ? 0.1 : 0)));
    setV0(Array(10).fill(0));
    setMask(Array(16).fill(true));
    setSelection(null);
    setMode(0);
    setSign(1);
    setAmplitude(0.1);
    setStep(0);
    setOverview(false);
    setRevision((r) => r + 1);
  }, [clock, module]);

  /* ---------------- keyboard ---------------- */
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.repeat ||
        (e.target as HTMLElement).closest(
          "input,button,select,textarea,[contenteditable=true],[role=separator]",
        )
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!reduced) (clock.getState().playing ? clock.pause() : clock.play());
      } else if (e.key.toLowerCase() === "r") reset();
      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        clock.step(e.key === "ArrowRight" ? 0.05 : -0.05);
      } else if (e.key === "Escape") setSelection(null);
      else if (e.key.toLowerCase() === "b")
        setPanes((p) => ({ ...p, browser: !p.browser }));
      else if (e.key.toLowerCase() === "p")
        setPanes((p) => ({ ...p, properties: !p.properties }));
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [clock, reduced, reset]);

  /* ---------------- derivation ---------------- */
  const steps = useMemo(() => {
    switch (study.derivation) {
      case "sdof-undamped":
        return sdofSolution ? undampedSdofSteps(sdofSolution) : null;
      case "sdof-damped":
        return sdofSolution ? dampedSdofSteps(sdofSolution) : null;
      case "sdof-forced":
        return system
          ? forcedSdofSteps(system.M[0][0], sdofC, system.K[0][0], force, omega)
          : null;
      case "twodof":
        return system ? twoDofSteps(system, modal) : null;
      case "mdof":
        return system ? mdofSteps(system, modal) : null;
      case "free-free":
        return freeFreeSteps(modal);
      case "fem": {
        const index = selection?.kind === "element" ? selection.index : null;
        const local = index !== null && assembly ? assembly.elementData[index] : undefined;
        return femSteps(
          element,
          assembly?.elementData.length ?? 0,
          assembly?.free.length ?? 0,
          assembly?.fixed.length ?? 0,
          modal,
          index,
          local ? { K: local.K, M: local.M, dofs: local.dofs, L: local.L } : undefined,
          assembly?.labels ?? [],
        );
      }
      default:
        return null;
    }
  }, [study.derivation, sdofSolution, system, modal, sdofC, force, omega, selection, assembly, element]);

  useEffect(() => {
    setStep((s) => Math.min(s, Math.max(0, (steps?.length ?? 1) - 1)));
  }, [steps]);

  /* Derivation step drives what the viewport emphasises. */
  const stepFocus = steps?.[Math.min(step, steps.length - 1)]?.focus ?? [];
  const mergedActive = useMemo(() => {
    if (tab !== "Equations") return active;
    const set = new Set(active);
    stepFocus.forEach((f) => set.add(f));
    return set;
  }, [active, stepFocus, tab]);

  /* ---------------- tool behaviour ---------------- */
  function applyTool(next: string) {
    setTool(next);
    if (next === "Equation") setTab("Equations");
    else if (next === "Energy" && study.tabs.includes("Energy")) setTab("Energy");
    else if (next === "Modes" && study.tabs.includes("Modes")) setTab("Modes");
    else if (next === "Normalize" || next === "Scale") setTab("Modes");
    else if (next === "Constraints" || next === "Mesh") setTab("Assembly");
    else if (next === "Elements" || next === "Nodes") setTab("Assembly");
    else if (next === "Inspect") onDensity("inspect");
  }

  /* ---------------- property context ---------------- */
  const propertyCtx: PropertyContext = {
    clock,
    selection,
    active,
    density,
    system:
      system ??
      (sdofSolution
        ? {
            M: [[sdofSolution.parameters.mass]],
            C: [[sdofSolution.damping]],
            K: [[sdofSolution.parameters.stiffness]],
            labels: ["x1"],
            links: [
              { i: 0, j: null, k: sdofSolution.parameters.stiffness, label: "k1" },
            ],
          }
        : undefined),
    modal,
    assembly,
    sampler,
    links:
      links.length || !sdofSolution
        ? links
        : [{ i: 0, j: null, k: sdofSolution.parameters.stiffness, label: "k1" }],
    normalization,
    sign,
    amplitude,
    x0: study.stage === "sdof" ? [sdof.x0] : x0,
    v0: study.stage === "sdof" ? [sdof.v0] : v0,
    limits: {
      mass: [SDOF_LIMITS.mass[0], SDOF_LIMITS.mass[1]],
      stiffness: [SDOF_LIMITS.stiffness[0], 10000],
      damping: [0, 200],
    },
    onMass,
    onSpring,
    onDamper,
    onInitial,
    onAmplitude: (v) => setAmplitude(v),
    onSelect: select,
    studySettings: {
      study,
      modal,
      n,
      onN: (v) => edit(() => setN(v)),
      boundary,
      onBoundary: (b) => edit(() => setBoundary(b)),
      alpha,
      beta,
      onRayleigh: (a, b) =>
        edit(() => {
          setAlpha(a);
          setBeta(b);
        }),
      sdofC,
      onSdofC: (v) => edit(() => setSdofC(v)),
      preview,
      onPreview: (v) => edit(() => setPreview(v)),
      amplitude,
      onAmplitude: setAmplitude,
      element,
      onElement: (v) => edit(() => setElement(v)),
      mesh,
      onMesh: (v) => edit(() => setMesh(v)),
      feBoundary,
      onFeBoundary: (v) => edit(() => setFeBoundary(v)),
      omega,
      onOmega: (v) => edit(() => setOmega(v)),
      force,
      onForce: (v) => edit(() => setForce(v)),
      forcePhase,
      onForcePhase: (v) => edit(() => setForcePhase(v)),
      baseAmplitude,
      onBaseAmplitude: (v) => edit(() => setBaseAmplitude(v)),
      error: settingsError,
      onError: setSettingsError,
    },
  };

  /* ---------------- dock ---------------- */
  const visibleTabs = study.tabs.filter(
    (t) => rules.matrices || (t !== "Matrices" && t !== "Assembly"),
  );
  const currentTab = visibleTabs.includes(tab) ? tab : visibleTabs[0];

  const dockBody = (() => {
    if (error) return <p role="alert">{error}</p>;
    switch (currentTab) {
      case "Equations":
        return (
          <EquationsTab
            steps={steps}
            step={step}
            onStep={setStep}
            overview={overview}
            onOverview={setOverview}
            active={mergedActive}
            onSelect={select}
            reduced={reduced}
            fallback={null}
          />
        );
      case "Modes":
        return modal && system ? (
          <ModesTab
            modal={modal}
            system={system}
            chosen={chosen}
            onChoose={(i) => select({ kind: "mode", index: i })}
            normalization={normalization}
            onNormalization={setNormalization}
            sign={sign}
            onSign={() => setSign((s) => (s === 1 ? -1 : 1))}
            amplitude={amplitude}
            mask={mask}
            onMask={(i, on) =>
              edit(() => {
                setMask((a) => a.map((v, j) => (j === i ? on : v)));
                setPreview(false);
              })
            }
            density={density}
            tracking={tracking}
            active={active}
          />
        ) : (
          <p>No modal solution for this configuration.</p>
        );
      case "Matrices":
        return modal && system ? (
          <MatricesTab
            system={system}
            modal={modal}
            links={links}
            selection={selection}
            active={active}
            onSelect={select}
            density={density}
          />
        ) : null;
      case "Assembly":
        return system ? (
          <AssemblyTab
            system={system}
            links={links}
            active={active}
            onSelect={select}
            selection={selection}
            fe={
              assembly
                ? {
                    elements: assembly.elementData.map((e) => ({
                      dofs: e.dofs,
                      K: e.K,
                      M: e.M,
                      L: e.L,
                    })),
                    labels: assembly.labels,
                    fixed: assembly.fixed,
                    free: assembly.free,
                  }
                : undefined
            }
          />
        ) : null;
      case "Response":
        return sampler ? (
          <ResponseTab
            clock={clock}
            sampler={sampler}
            index={dof}
            labels={system?.labels ?? ["x1"]}
          />
        ) : null;
      case "Energy":
        return sampler ? (
          <EnergyTab clock={clock} sampler={sampler} index={dof} />
        ) : null;
      case "Phase":
        return sampler ? (
          <PhaseTab
            clock={clock}
            sampler={sampler}
            index={dof}
            label={system?.labels[dof] ?? "x1"}
          />
        ) : null;
      case "Forces":
        return sampler ? (
          <ForcesTab
            clock={clock}
            sampler={sampler}
            system={propertyCtx.system}
            index={dof}
            labels={propertyCtx.system?.labels ?? ["x1"]}
          />
        ) : null;
      case "FRF":
        return modal && system ? (
          <FrfTab
            system={system}
            modal={modal}
            out={dof}
            input={inDof}
            onInput={setInputDof}
            kind={frfKind}
            onKind={setFrfKind}
            omega={omega}
            labels={system.labels}
          />
        ) : null;
      case "Spectrum":
        return <SpectrumTab zeta={0.05} />;
      case "PSD":
        return modal && system ? (
          <PsdTab
            system={system}
            modal={modal}
            out={dof}
            input={inDof}
            labels={system.labels}
          />
        ) : null;
      case "Results":
        return modal && system ? (
          <ResultsTab
            system={system}
            modal={modal}
            normalization={normalization}
            sign={sign}
            influence={system.M.map((_, i) =>
              assembly
                ? system.labels[i].endsWith(element === "beam" ? "v" : "u")
                  ? 1
                  : 0
                : 1,
            )}
            extra={
              module === 8 ? (
                <BaseExcitationNote
                  system={system}
                  omega={omega}
                  baseAmplitude={baseAmplitude}
                  index={dof}
                />
              ) : undefined
            }
          />
        ) : null;
      default:
        return null;
    }
  })();

  /* ---------------- viewport overlays ---------------- */
  const viewportLabels = (
    <>
      {study.stage === "chain" &&
        viewportModel.kind === "chain" &&
        viewportModel.labels.map((l, i) => (
          <span key={i} className="viewport-label" data-token={`mass:m${i + 1}`}>
            {l}
          </span>
        ))}
      {preview && modal && (
        <span className="viewport-scale">
          Visualization scale {format(amplitude, 3)}× · not a physical amplitude
        </span>
      )}
    </>
  );

  const status = (
    <StatusLine
      facts={[
        nativeError ? "Native focus unavailable · visibility fallback" : "Local · offline ready",
        `${count} DOF`,
        system?.boundary ?? (module === 1 ? "grounded, damped" : "grounded"),
        modal
          ? modal.classical
            ? "classical damping"
            : "coupled damping"
          : sdofSolution
            ? sdofSolution.regime
            : null,
        modal ? `mode ${chosen + 1}: ${format(modal.modes[chosen].frequency, 4)} Hz` : null,
        sdofSolution ? `fₙ ${format(sdofSolution.frequency, 4)} Hz` : null,
        density === "inspect" && modal
          ? `residual ${modal.modes[chosen].residual.toExponential(2)}`
          : null,
      ]}
    />
  );

  return (
    <StudioShell
      panes={panes}
      onPanes={(next) => setPanes((p) => ({ ...p, ...next }))}
      propertiesTitle={propertyTitle(propertyCtx)}
      hasSelection={selection !== null}
      bar={
        <>
          <span className="studio-brand">
            Modal <b>Dynamics Studio</b>
          </span>
          <StudySelector study={study} onChange={onModule} />
          <span className="studio-summary">{study.summary}</span>
          <div className="studio-bar-tools">
            <DensitySwitcher value={density} onChange={onDensity} />
            <button
              aria-pressed={panes.browser}
              aria-controls="studio-browser"
              onClick={() => setPanes((p) => ({ ...p, browser: !p.browser }))}
            >
              Browser
            </button>
            <button
              onClick={() => onTheme(theme === "dark" ? "light" : "dark")}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} appearance`}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </>
      }
      browser={
        <ModelBrowser
          groups={tree}
          selection={selection}
          active={active}
          onSelect={select}
          studySelector={
            <p className="browser-study-name">
              <span className="browser-study-kicker">Study</span>
              {study.name}
            </p>
          }
        />
      }
      viewport={
        <CadViewport
          key={`${module}:${revision}`}
          clock={clock}
          model={viewportModel}
          frameFor={frameFor}
          selectionKey={viewportSelectionKey}
          onSelect={selectByKey}
          dark={theme === "dark"}
          reduced={reduced}
          forceSvg={forceSvg}
          caption={sampler?.label ?? "No supported response for this configuration."}
          labels={viewportLabels}
          overlay={
            <>
              <ToolStrip tools={study.tools} value={tool} onChange={applyTool} />
              {study.stage === "rigid" && (
                <div className="rigid-dofs" role="group" aria-label="Rigid body motion">
                  {RIGID_DOFS.map((d, i) => (
                    <button
                      key={d}
                      aria-pressed={rigidDof === i}
                      onClick={() => setRigidDof(i)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
              <Transport clock={clock} reduced={reduced} onReset={reset} />
            </>
          }
        />
      }
      properties={<Properties {...propertyCtx} />}
      dockTabs={
        <div className="dock-tabs" role="tablist" aria-label="Analysis views">
          {visibleTabs.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={currentTab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      }
      dock={dockBody}
      status={status}
    />
  );
}
