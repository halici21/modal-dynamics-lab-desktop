import { CoreWorkbench, CORE_NAMES } from "./CoreWorkbench";
import {
  DampingControls,
  DampingSummary,
  DampingExperiment,
} from "../components/DampingControls";
import { editDamping, type DampingAuthority } from "../physics/dampingControl";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { SimulationClock } from "../animation/SimulationClock";
import { bindLifecycle } from "../animation/lifecycle";
import { interruptTransitions, motion } from "../animation/motion";
import { bindDesktop } from "./desktop";
import { initialState, labReducer } from "./state";
import { Workbench } from "../components/Workbench";
import { LiveReadout, ObjectContext } from "../components/WorkbenchReadout";
import { LearningTrajectory } from "../components/LearningTrajectory";
import { ConceptLensSwitcher } from "../components/ConceptLensSwitcher";
import { ParameterSlider } from "../components/ParameterSlider";
import { PlaybackBar } from "../components/PlaybackBar";
import { StatusReadout } from "../components/StatusReadout";
import { Diagnostics } from "../components/Diagnostics";
import { EquationDerivation } from "../components/EquationDerivation";
import {
  PhysicsStage,
  type PhysicalSelection,
} from "../visualization/PhysicsStage";
import { ResponsePlot } from "../visualization/ResponsePlot";
import { SdofInspector, SdofLens } from "../visualization/SdofInspection";
import { RendererStudy } from "../visualization/RendererStudy";
import { ShellPrototypes } from "./prototypes/ShellPrototypes";
import "./prototypes/prototypes.css";
import { LearningPanel } from "../education/LearningPanel";
import { lessonForModule } from "../education/curriculum";
import { usePedagogyProgress } from "../education/progress";
import type { LessonMode } from "../education/curriculum";
import {
  createSdof,
  DEFAULT_SDOF,
  SDOF_LIMITS,
  type SdofParameters,
} from "../physics/sdof";
import { format } from "../visualization/sdofGeometry";
import {
  GuidedExperiment,
  type Experiment,
} from "../education/GuidedExperiment";
const controls = [
  ["mass", "Mass", "kg", 0.25],
  ["stiffness", "Stiffness", "N/m", 1],
  ["x0", "Initial displacement", "m", 0.005],
  ["v0", "Initial velocity", "m/s", 0.05],
] as const;
export function App({ clock }: { clock: SimulationClock }) {
  const [state, dispatch] = useReducer(labReducer, initialState);
  const [parameters, setParameters] = useState<SdofParameters>({
    ...DEFAULT_SDOF,
    damping: 4,
  });
  const [theme, setTheme] = useState<"dark" | "light">("dark"),
    [reduced, setReduced] = useState(false),
    [nativeError, setNativeError] = useState(false),
    [diagnostics, setDiagnostics] = useState(false);
  const [derivation, setDerivation] = useState(0),
    [experiment, setExperiment] = useState<Experiment>(null);
  const damped = state.module === 1;
  const lesson = lessonForModule(state.module);
  const pedagogy = usePedagogyProgress(state.module);
  const pedagogyMode = pedagogy.progress.mode;
  const firstRun = pedagogy.progress.started.length === 0;
  const [authority, setAuthority] = useState<DampingAuthority>("c");
  const [dampingGuide, setDampingGuide] = useState<{
    kind: "add" | "critical";
    step: number;
    paused: boolean;
  } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const solution = useMemo(() => {
    const start = performance.now();
    const { damping: ignored, ...undamped } = parameters;
    const result = createSdof(damped ? parameters : undamped);
    if (import.meta.env.DEV)
      Object.assign(window, { __labSolveMs: performance.now() - start });
    return result;
  }, [parameters, damped]);
  const selected = (state.selection?.objectId ?? null) as PhysicalSelection;
  const interrupt = useCallback(() => {
    interruptTransitions(root.current);
    setExperiment(null);
    setDampingGuide(null);
  }, []);
  const reset = useCallback(() => {
    interruptTransitions(root.current);
    clock.reset();
    setParameters({ ...DEFAULT_SDOF, damping: 4 });
    setAuthority("c");
    setDerivation(0);
    setExperiment(null);
    setDampingGuide(null);
    dispatch({ type: "reset" });
  }, [clock]);
  const select = (objectId: PhysicalSelection) => {
    interrupt();
    clock.pause();
    dispatch({
      type: "select",
      value: objectId ? { kind: "object", id: objectId, objectId } : null,
    });
  };
  const change = (key: keyof SdofParameters, value: number) => {
    interrupt();
    setParameters((p) =>
      damped ? editDamping(p, authority, key, value) : { ...p, [key]: value },
    );
    if (key === "stiffness" && value === 0) setAuthority("c");
  };
  useEffect(() => {
    const a = bindLifecycle(clock, setReduced),
      b = bindDesktop(clock, () => setNativeError(true));
    clock.play();
    return () => {
      a();
      b();
      clock.pause();
    };
  }, [clock]);
  useLayoutEffect(() => {
    if (import.meta.env.DEV) Object.assign(window, { __labSolution: solution });
  }, [solution]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.repeat ||
        (e.target as HTMLElement).closest(
          "input,button,select,textarea,[contenteditable=true],[role=button],[role=separator]",
        )
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        interrupt();
        if (!reduced) clock.getState().playing ? clock.pause() : clock.play();
      }
      if (e.key.toLowerCase() === "r") reset();
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        interrupt();
        clock.step(e.key === "ArrowRight" ? 0.1 : -0.1);
      }
      const next = ({ e: "Energy", f: "Forces", m: "Mathematics" } as const)[
        e.key.toLowerCase() as "e" | "f" | "m"
      ];
      if (next) {
        interrupt();
        dispatch({ type: "lens", value: next });
      }
      if (e.key === "Escape") {
        interrupt();
        dispatch({ type: "select", value: null });
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [clock, reduced, reset, interrupt]);
  const preset = (mass: number, stiffness: number) => {
    interrupt();
    setParameters((p) => ({
      ...DEFAULT_SDOF,
      damping: p.damping ?? 4,
      mass,
      stiffness,
    }));
  };
  const applyLessonPreset = (preset: import("../education/curriculum").LessonPreset) => {
    interruptTransitions(root.current);
    clock.pause();
    clock.setTime(0);
    if (preset.kind === "sdof") {
      setParameters({ ...DEFAULT_SDOF, mass: preset.mass, stiffness: preset.stiffness, damping: preset.damping ?? 0, x0: preset.x0 ?? 0.1, v0: preset.v0 ?? 0 });
      setAuthority("c");
    } else {
      dispatch({ type: "module", value: preset.module });
      if (preset.lens === "Modes" || preset.lens === "Participation") dispatch({ type: "lens", value: "Mathematics" });
    }
  };
  const learning = <LearningPanel
    lesson={lesson}
    mode={pedagogyMode}
    progress={pedagogy.progress}
    firstRun={firstRun}
    onMode={(mode: LessonMode) => pedagogy.setMode(mode)}
    onStart={() => pedagogy.start(lesson.id, "learn")}
    onPractice={() => pedagogy.practice(lesson.id)}
    onComplete={() => pedagogy.complete(lesson.id)}
    onSkip={() => pedagogy.setMode("explore")}
    onRestart={() => pedagogy.start(lesson.id, "learn")}
    onExplore={() => pedagogy.setMode("explore")}
    onExperiment={applyLessonPreset}
    onModule={(module) => { interrupt(); dispatch({ type: "module", value: module }); }}
    onLens={(lens) => dispatch({ type: "lens", value: lens as import("./state").Lens })}
  />;  const startExperiment = (kind: "mass" | "stiffness") => {
    interruptTransitions(root.current);
    clock.pause();
    clock.setTime(0);
    setParameters({ ...DEFAULT_SDOF });
    setExperiment({ kind, step: 0, paused: false });
    dispatch({
      type: "select",
      value: {
        kind: "equation",
        id: kind,
        objectId: kind === "mass" ? "mass" : "spring",
      },
    });
  };
  const query = new URLSearchParams(window.location.search);
  if (query.get("r2") === "renderer-study") return <RendererStudy clock={clock} />;
  const shell = query.get("r3");
  if (shell === "shell-a" || shell === "shell-b" || shell === "shell-c")
    return <ShellPrototypes clock={clock} which={shell} />;
  return (
    <div
      className="lab sdof-lab workbench-lab"
      ref={root}
      onPointerDownCapture={() => interruptTransitions(root.current)}
      onKeyDownCapture={() => interruptTransitions(root.current)}
      style={
        {
          "--motion-interface": motion.interfaceMs + "ms",
          "--motion-education": motion.educationalMs + "ms",
        } as React.CSSProperties
      }
    >
      <header className="app-header">
        <div className="brand">
          <svg viewBox="0 0 28 28" width="25" height="25" aria-hidden="true">
            <path
              d="M2 14h5l3-9 7 18 4-9h5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
          <span>
            Modal <span className="brand-light">Dynamics Lab</span>
          </span>
        </div>
        <div className="header-tools">
          <select
            className="physics-workspace-select"
            aria-label="Physics workspace"
            value={state.module}
            onChange={(e) => {
              interrupt();
              dispatch({ type: "module", value: Number(e.target.value) });
            }}
          >
            {CORE_NAMES.map((name, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </select>
          <span className="version">Scientific Workbench · R2</span>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={
              "Switch to " +
              (theme === "dark" ? "light" : "dark") +
              " appearance"
            }
          >
            {theme === "dark" ? "Light" : "Dark"} appearance
          </button>
        </div>
      </header>
      {state.module >= 2 ? (
        <CoreWorkbench
          key={state.module + ":" + state.resetRevision}
          module={state.module}
          clock={clock}
          reduced={reduced}
          onReset={reset}
          learning={learning}
          rail={(expanded) => (
            <LearningTrajectory
              expanded={expanded}
              active={state.module}
              progress={pedagogy.progress}
              variant="full"
              onChange={(value) => {
                interrupt();
                dispatch({ type: "module", value });
              }}
            />
          )}
        />
      ) : (
        <Workbench
          selected={state.selection?.kind === "object" ? selected : null}
          lens={state.lens}
          title={damped ? "Damped SDOF" : "Undamped SDOF"}
          subtitle={
            damped
              ? "One coordinate. Three ways to return."
              : "One coordinate, one natural frequency."
          }
          rail={(expanded) => (
            <LearningTrajectory
              expanded={expanded}
              active={state.module}
              progress={pedagogy.progress}
              onChange={(value) => {
                interrupt();
                dispatch({ type: "module", value });
              }}
            />
          )}
          learning={learning}
          parameters={
            <aside className="parameters" aria-label="Physical parameters">
              <h3 className="dock-section-label">System</h3>{" "}
              {controls.map(([id, label, unit, step]) => (
                <Fragment key={id + state.resetRevision}>
                  {id === "x0" && (
                    <h3 className="dock-section-label">Initial state</h3>
                  )}
                  <ParameterSlider
                    label={label}
                    value={parameters[id]}
                    min={SDOF_LIMITS[id][0]}
                    max={SDOF_LIMITS[id][1]}
                    step={step}
                    unit={unit}
                    clock={clock}
                    strict
                    validate={(v) => {
                      try {
                        createSdof({ ...parameters, [id]: v });
                        return true;
                      } catch {
                        return false;
                      }
                    }}
                    onChange={(v) => change(id, v)}
                  />
                </Fragment>
              ))}
              {damped && (
                <DampingControls
                  key={state.resetRevision}
                  clock={clock}
                  parameters={parameters}
                  authority={authority}
                  onAuthority={(a) => {
                    interrupt();
                    setAuthority(a);
                  }}
                  onChange={(c) => change("damping", c)}
                  onPreset={(z) => {
                    interrupt();
                    clock.pause();
                    clock.setTime(0);
                    setParameters({ ...DEFAULT_SDOF, damping: 20 * z });
                  }}
                />
              )}
              {damped && <DampingSummary solution={solution} />}
              <p className="parameter-policy">
                Edits re-evaluate the response at the same time; they are not a
                physical switching event.
              </p>
              {!damped && (
                <div className="presets" aria-label="System presets">
                  <button onClick={() => preset(0.5, 100)}>Light mass</button>
                  <button onClick={() => preset(4, 100)}>Heavy mass</button>
                  <button onClick={() => preset(1, 25)}>Soft spring</button>
                  <button onClick={() => preset(1, 400)}>Stiff spring</button>
                </div>
              )}
            </aside>
          }
          toolbar={
            <ConceptLensSwitcher
              value={state.lens}
              onChange={(value) => {
                interrupt();
                dispatch({ type: "lens", value });
              }}
            />
          }
          stage={
            <>
              <div className="stage-column">
                {" "}
                <PhysicsStage
                  key={state.resetRevision}
                  clock={clock}
                  solution={solution}
                  selected={selected}
                  lens={state.lens}
                  reduced={reduced}
                  onSelect={select}
                  onInitialDisplacement={(x) =>
                    change("x0", Math.round(x * 10000) / 10000)
                  }
                  onInterrupt={interrupt}
                />
                <div onClickCapture={() => interruptTransitions(root.current)}>
                  <PlaybackBar
                    clock={clock}
                    reduced={reduced}
                    onReset={reset}
                  />
                </div>
                <div className="stage-results">
                  <StatusReadout clock={clock} />
                  <div>
                    <span>ωₙ</span>
                    <output data-testid="omega">
                      {format(solution.omega, 4)}
                    </output>
                    <small>rad/s</small>
                  </div>
                  <div>
                    <span>fₙ</span>
                    <output data-testid="frequency">
                      {format(solution.frequency, 4)}
                    </output>
                    <small>Hz</small>
                  </div>
                  <div>
                    <span>{damped ? "Tₙ" : "T"}</span>
                    <output data-testid="period">
                      {solution.period ? format(solution.period, 4) : "—"}
                    </output>
                    <small>{solution.period ? "s" : "no oscillation"}</small>
                  </div>
                </div>
                <LiveReadout clock={clock} solution={solution} />
              </div>
            </>
          }
          inspector={
            <>
              <ObjectContext
                selected={selected}
                solution={solution}
                clock={clock}
              />
              {selected && (
                <div className="selection-note">
                  Selected: {selected}
                  <button onClick={() => select(null)}>Clear selection</button>
                </div>
              )}
              <SdofInspector clock={clock} solution={solution} />
            </>
          }
          analysis={
            <>
              <SdofLens clock={clock} solution={solution} lens={state.lens} />
              {state.lens === "Mathematics" && (
                <div className="math-deck">
                  {" "}
                  <EquationDerivation
                    solution={solution}
                    selected={selected}
                    onSelect={select}
                    step={derivation}
                    onStep={(n) => {
                      interrupt();
                      setDerivation(n);
                    }}
                    reduced={reduced}
                  />
                </div>
              )}
              <div
                className={
                  state.lens === "Phase Space" ||
                  state.lens === "Energy" ||
                  state.lens === "Mathematics"
                    ? "secondary-response"
                    : ""
                }
              >
                {" "}
                <ResponsePlot
                  clock={clock}
                  solution={solution}
                  selected={selected !== null}
                  onSelect={() => select("displacement")}
                  onInterrupt={interrupt}
                />
              </div>
              <div className="deck-guides">
                {" "}
                {damped ? (
                  <DampingExperiment
                    value={dampingGuide}
                    onStart={(kind) => {
                      interrupt();
                      clock.pause();
                      clock.setTime(0);
                      setAuthority("c");
                      setParameters({
                        ...DEFAULT_SDOF,
                        damping: kind === "add" ? 0 : 8,
                      });
                      setDampingGuide({ kind, step: 0, paused: false });
                    }}
                    onAdvance={() => {
                      if (!dampingGuide || dampingGuide.paused) return;
                      const step = dampingGuide.step + 1;
                      clock.pause();
                      clock.setTime(0);
                      setParameters({
                        ...DEFAULT_SDOF,
                        damping:
                          dampingGuide.kind === "add"
                            ? 4
                            : step === 1
                              ? 20
                              : 40,
                      });
                      setDampingGuide({ ...dampingGuide, step });
                    }}
                    onPause={() => {
                      clock.pause();
                      if (dampingGuide)
                        setDampingGuide({
                          ...dampingGuide,
                          paused: !dampingGuide.paused,
                        });
                    }}
                    onClose={() => setDampingGuide(null)}
                  />
                ) : (
                  <GuidedExperiment
                    value={experiment}
                    onStart={startExperiment}
                    onAdvance={() => {
                      if (!experiment || experiment.paused) return;
                      setParameters((p) => ({
                        ...p,
                        [experiment.kind]: experiment.kind === "mass" ? 4 : 400,
                      }));
                      setExperiment({ ...experiment, step: 1 });
                    }}
                    onPause={() => {
                      if (!experiment) return;
                      clock.pause();
                      setExperiment({
                        ...experiment,
                        paused: !experiment.paused,
                      });
                    }}
                    onClose={() => setExperiment(null)}
                  />
                )}
              </div>
            </>
          }
        />
      )}
      <footer>
        <span>
          <span className="status-dot" aria-hidden="true" />
          Local · Offline ready
        </span>
        <span>
          {nativeError
            ? "Native focus unavailable · visibility fallback active"
            : state.module >= 2
              ? "Linear structural dynamics · numerical core"
              : "Analytical free response · 1 DOF"}
        </span>
        {import.meta.env.DEV && (
          <button
            className="diagnostics-toggle"
            onClick={() => setDiagnostics(!diagnostics)}
            aria-pressed={diagnostics}
          >
            Diagnostics
          </button>
        )}
        <span className="footer-end">
          {state.module >= 2
            ? "Visual Experience R2"
            : damped
              ? "Viscous damping"
              : "Ideal · Linear · Free response"}
        </span>
      </footer>
      {import.meta.env.DEV && diagnostics && <Diagnostics clock={clock} />}
    </div>
  );
}






