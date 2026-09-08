import { AnalysisVisibility } from "./AnalysisVisibility";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import type { PhysicalSelection } from "../visualization/PhysicsStage";
import type { Lens } from "../app/state";
export function Workbench({
  rail,
  parameters,
  toolbar,
  stage,
  inspector,
  analysis,
  title,
  subtitle,
  selected,
  lens,
  hint = "Pull the mass to set x₀",
  learning,
}: {
  rail(expanded: boolean): ReactNode;
  parameters: ReactNode;
  toolbar: ReactNode;
  stage: ReactNode;
  inspector: ReactNode;
  analysis: ReactNode;
  title: string;
  subtitle: string;
  selected: string | null;
  hint?: string;
  lens: Lens;
  learning?: ReactNode;
}) {
  const [railOpen, setRailOpen] = useState(false),
    [inspectOpen, setInspectOpen] = useState(false);
  const [narrow, setNarrow] = useState(
    () => matchMedia("(max-width:1100px)").matches,
  );
  const [paramsOpen, setParamsOpen] = useState(!narrow),
    [deckOpen, setDeckOpen] = useState(true);
  const parameterRef = usePanelRef(),
    deckRef = usePanelRef();
  const inspectTrigger = useRef<HTMLButtonElement>(null),
    parameterTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const m = matchMedia("(max-width:1100px)");
    const change = () => {
      setNarrow(m.matches);
      if (m.matches) {
        parameterRef.current?.collapse();
        setRailOpen(false);
      }
    };
    m.addEventListener("change", change);
    return () => m.removeEventListener("change", change);
  }, [parameterRef]);
  useEffect(() => {
    if (selected) setInspectOpen(true);
  }, [selected]);
  useEffect(() => {
    if (lens === "Phase Space") deckRef.current?.resize(320);
    else if (lens !== "Motion") deckRef.current?.expand();
  }, [lens, deckRef]);
  const closeInspector = () => {
    setInspectOpen(false);
    inspectTrigger.current?.focus();
  };
  return (
    <main
      className={
        "workbench " +
        (railOpen ? "rail-expanded " : "") +
        (narrow ? "narrow" : "")
      }
    >
      <div className="lab-rail">
        <button
          className="rail-toggle"
          aria-label={railOpen ? "Collapse Lab Rail" : "Expand Lab Rail"}
          aria-expanded={railOpen}
          aria-controls="lab-modules"
          onClick={() => setRailOpen(!railOpen)}
        >
          <span aria-hidden="true">{railOpen ? "‹" : "☰"}</span>
          {railOpen && <span>Laboratories</span>}
        </button>
        <div id="lab-modules">{rail(railOpen)}</div>
        <div className="rail-foot">{railOpen ? "Local laboratory" : "ML"}</div>
      </div>
      <Group
        orientation="horizontal"
        className="workbench-group"
        resizeTargetMinimumSize={{ fine: 8, coarse: 24 }}
      >
        <Panel
          id="parameter-dock"
          style={{ overflow: "hidden" }}
          aria-hidden={!paramsOpen}
          panelRef={parameterRef}
          defaultSize={narrow ? 0 : 270}
          minSize={250}
          maxSize={310}
          collapsible
          collapsedSize={0}
          groupResizeBehavior="preserve-pixel-size"
          onResize={(size) => setParamsOpen(size.inPixels > 0)}
        >
          <div className="parameter-dock" inert={!paramsOpen}>
            <div className="dock-heading">
              <h2>Parameters</h2>
              <button
                aria-label="Collapse Parameter Dock"
                onClick={() => {
                  parameterRef.current?.collapse();
                  parameterTrigger.current?.focus();
                }}
              >
                ‹
              </button>
            </div>
            {parameters}
          </div>
        </Panel>
        <Separator
          className="resize-handle horizontal-handle"
          aria-label="Resize Parameter Dock"
        />
        <Panel id="physics-workspace" minSize={480}>
          <div className="workspace-content">
            <div className="workspace-heading">
              <div>
                <h1>{title}</h1>
                <p>{subtitle}</p>
              </div>
              <div className="workspace-actions">
                <button
                  ref={parameterTrigger}
                  aria-label={
                    paramsOpen ? "Hide parameters" : "Show parameters"
                  }
                  aria-expanded={paramsOpen}
                  aria-controls="parameter-dock"
                  onClick={() =>
                    paramsOpen
                      ? parameterRef.current?.collapse()
                      : parameterRef.current?.expand()
                  }
                >
                  Parameters
                </button>
                <button
                  ref={inspectTrigger}
                  aria-expanded={inspectOpen}
                  aria-controls="context-inspector"
                  onClick={() => setInspectOpen(!inspectOpen)}
                >
                  Inspect
                </button>
              </div>
            </div>
            <div className="workspace-toolbar">
              {toolbar}
              <span className="workspace-hint">{hint}</span>
            </div>
            
            <Group
              orientation="vertical"
              className="analysis-group"
              resizeTargetMinimumSize={{ fine: 8, coarse: 24 }}
            >
              <Panel id="experiment" minSize={280}>
                {stage}
              </Panel>
              <Separator
                className="resize-handle vertical-handle"
                aria-label="Resize Analysis Deck"
              />
              <Panel
                id="analysis-deck"
                panelRef={deckRef}
                defaultSize={narrow ? 40 : 240}
                minSize={155}
                maxSize="60%"
                collapsible
                collapsedSize={40}
                groupResizeBehavior="preserve-pixel-size"
                onResize={(size) => setDeckOpen(size.inPixels > 45)}
              >
                <section className="analysis-deck">
                  <div className="deck-heading">
                    <button
                      aria-label={
                        deckOpen
                          ? "Collapse Analysis Deck"
                          : "Expand Analysis Deck"
                      }
                      aria-expanded={deckOpen}
                      aria-controls="analysis-content"
                      onClick={() =>
                        deckOpen
                          ? deckRef.current?.collapse()
                          : deckRef.current?.expand()
                      }
                    >
                      <span aria-hidden="true">{deckOpen ? "⌄" : "⌃"}</span>{" "}
                      Analysis
                    </button>
                    <span>
                      {lens === "Phase Space"
                        ? "Position–velocity"
                        : lens === "Mathematics"
                          ? "Equation & relationships"
                          : lens === "Energy"
                            ? "Energy exchange"
                            : "Displacement response"}
                    </span>
                    <span className="deck-hint">Drag boundary to resize</span>
                  </div>
                  <div
                    id="analysis-content"
                    className="analysis-content"
                    tabIndex={0}
                    aria-label="Analysis content"
                    hidden={!deckOpen}
                  >
                    <AnalysisVisibility value={deckOpen}>
                      {learning}
                      {analysis}
                    </AnalysisVisibility>
                  </div>
                </section>
              </Panel>
            </Group>
          </div>
        </Panel>
      </Group>
      {inspectOpen && (
        <aside
          id="context-inspector"
          className="context-inspector"
          aria-label="Context Inspector"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              closeInspector();
            }
          }}
        >
          <div className="dock-heading">
            <h2>Inspector</h2>
            <button
              aria-label="Collapse Context Inspector"
              onClick={closeInspector}
            >
              ×
            </button>
          </div>
          {inspector}
        </aside>
      )}
    </main>
  );
}






