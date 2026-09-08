/**
 * Modal Dynamics Studio — the shell.
 *
 * Regions: study bar / model browser / CAD viewport / property manager /
 * equation-and-analysis dock. Pure layout and disclosure; it owns no physics
 * and no selection semantics.
 *
 * Layout budget is set by production constraint PC-1 in
 * docs/CAD_EXPERIENCE_R3_DESIGN_DECISION.md: bar 40, browser 196, properties
 * 216, dock 156 by default -> 1028x704 = 55.8% viewport at 1440x900, and ~68%
 * once the property manager is empty and the dock is collapsed to its tabs.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import { AnalysisVisibility } from "../components/AnalysisVisibility";

export const DOCK_DEFAULT = 156;
export const DOCK_COLLAPSED = 34;

export interface ShellPanes {
  browser: boolean;
  properties: boolean;
  dock: boolean;
}

export function StudioShell({
  bar,
  browser,
  viewport,
  properties,
  dockTabs,
  dock,
  status,
  panes,
  onPanes,
  propertiesTitle,
  hasSelection,
}: {
  bar: ReactNode;
  browser: ReactNode;
  viewport: ReactNode;
  properties: ReactNode;
  dockTabs: ReactNode;
  dock: ReactNode;
  status: ReactNode;
  panes: ShellPanes;
  onPanes(next: Partial<ShellPanes>): void;
  propertiesTitle: string;
  hasSelection: boolean;
}) {
  const dockRef = usePanelRef();
  const [narrow, setNarrow] = useState(
    () => matchMedia("(max-width: 1120px)").matches,
  );
  const propertyClose = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const m = matchMedia("(max-width: 1120px)");
    const change = () => setNarrow(m.matches);
    m.addEventListener("change", change);
    return () => m.removeEventListener("change", change);
  }, []);

  return (
    <div
      className={
        "studio" +
        (panes.browser ? "" : " no-browser") +
        (panes.properties && hasSelection ? "" : " no-properties") +
        (narrow ? " narrow" : "")
      }
    >
      <header className="studio-bar">{bar}</header>

      <div className="studio-body">
        <aside
          id="studio-browser"
          className="studio-browser"
          aria-label="Model browser"
          hidden={!panes.browser}
        >
          {browser}
        </aside>

        <Group
          orientation="vertical"
          className="studio-stack"
          resizeTargetMinimumSize={{ fine: 8, coarse: 24 }}
        >
          <Panel id="studio-viewport-panel" minSize={220}>
            <div className="studio-center">
              <main className="studio-viewport" aria-label="CAD physics viewport">
                {viewport}
              </main>
              {hasSelection && panes.properties && (
                <aside
                  id="studio-properties"
                  className="studio-properties"
                  aria-label="Property manager"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      onPanes({ properties: false });
                    }
                  }}
                >
                  <div className="studio-pane-head">
                    <h2>{propertiesTitle}</h2>
                    <button
                      ref={propertyClose}
                      aria-label="Close property manager"
                      onClick={() => onPanes({ properties: false })}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="studio-properties-body">{properties}</div>
                </aside>
              )}
            </div>
          </Panel>
          <Separator
            className="studio-separator"
            aria-label="Resize analysis dock"
          />
          <Panel
            id="studio-dock-panel"
            panelRef={dockRef}
            defaultSize={DOCK_DEFAULT}
            minSize={120}
            maxSize="72%"
            collapsible
            collapsedSize={DOCK_COLLAPSED}
            groupResizeBehavior="preserve-pixel-size"
            onResize={(size) =>
              onPanes({ dock: size.inPixels > DOCK_COLLAPSED + 6 })
            }
          >
            <section className="studio-dock" aria-label="Equation and analysis dock">
              <div className="studio-dock-head">
                <button
                  className="studio-dock-toggle"
                  aria-expanded={panes.dock}
                  aria-controls="studio-dock-body"
                  aria-label={panes.dock ? "Collapse analysis dock" : "Expand analysis dock"}
                  onClick={() =>
                    panes.dock
                      ? dockRef.current?.collapse()
                      : dockRef.current?.expand()
                  }
                >
                  <span aria-hidden="true">{panes.dock ? "⌄" : "⌃"}</span>
                </button>
                {dockTabs}
              </div>
              <div
                id="studio-dock-body"
                className="studio-dock-body"
                tabIndex={0}
                hidden={!panes.dock}
              >
                <AnalysisVisibility value={panes.dock}>{dock}</AnalysisVisibility>
              </div>
            </section>
          </Panel>
        </Group>
      </div>

      <footer className="studio-status">{status}</footer>
    </div>
  );
}
