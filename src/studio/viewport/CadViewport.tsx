/**
 * Modal Dynamics Studio — CAD physics viewport (React boundary).
 *
 * RENDER ARCHITECTURE — one loop, no exceptions:
 *   SimulationClock owns the only requestAnimationFrame in the app.
 *   - Playback frames: this component's `clock.subscribe` callback samples the
 *     solved response, pushes transforms into the Three.js scene and calls
 *     renderer.render(). React is not involved.
 *   - Camera reorientation (a UI motion, which must still animate while the
 *     simulation is paused): scheduled through `clock.coalesce`, the clock's
 *     own input-job channel, which re-arms the same RAF. The job re-registers
 *     itself until the tween finishes. There is never a second RAF and never a
 *     renderer.setAnimationLoop.
 *
 * Three.js is imported lazily so the CAD bundle only loads for studies that
 * open a viewport. If the import or the WebGL context fails, the validated
 * semantic SVG stage renders instead — never a blank viewport.
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { SimulationClock } from "../../animation/SimulationClock";
import { SvgStage } from "./SvgStage";
import { createCadScene } from "./scene";
import type { FrameData, SceneHandle, ViewName, ViewportModel } from "./scene";

const VIEWS: { id: ViewName; label: string; short: string }[] = [
  { id: "front", label: "Front view", short: "Front" },
  { id: "back", label: "Back view", short: "Back" },
  { id: "left", label: "Left view", short: "Left" },
  { id: "right", label: "Right view", short: "Right" },
  { id: "top", label: "Top view", short: "Top" },
  { id: "bottom", label: "Bottom view", short: "Bottom" },
  { id: "iso", label: "Isometric view", short: "Iso" },
];

export interface ViewportStats {
  renderer: "webgl" | "svg";
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  objects: number;
  dpr: number;
}

export function CadViewport({
  clock,
  model,
  frameFor,
  selectionKey,
  onSelect,
  dark,
  reduced,
  forceSvg,
  overlay,
  labels,
  caption,
}: {
  clock: SimulationClock;
  model: ViewportModel;
  frameFor(t: number): FrameData;
  selectionKey: string | null;
  onSelect(key: string): void;
  dark: boolean;
  reduced: boolean;
  forceSvg: boolean;
  overlay: ReactNode;
  labels: ReactNode;
  caption: string;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const handle = useRef<SceneHandle | null>(null);
  const [mode, setMode] = useState<"pending" | "webgl" | "svg">(
    forceSvg ? "svg" : "pending",
  );
  const [view, setView] = useState<ViewName>("front");
  const [fallbackReason, setFallbackReason] = useState(
    forceSvg ? "SVG renderer requested" : "",
  );

  /* --- create / dispose the WebGL scene -------------------------------- */
  useEffect(() => {
    if (forceSvg) {
      setMode("svg");
      return;
    }
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    let scene: SceneHandle | null = null;
    void (async () => {
      try {
        const THREE = await import("three");
        if (cancelled || !mount.current) return;
        scene = createCadScene(THREE, mount.current, { dark, reduced });
        if (!scene) {
          setFallbackReason("WebGL context unavailable");
          setMode("svg");
          return;
        }
        handle.current = scene;
        setMode("webgl");
        Object.assign(window, {
          __studioViewport: {
            renderer: "webgl" as const,
            stats: (): ViewportStats => ({ renderer: "webgl", ...scene!.stats() }),
          },
        });
        observer = new ResizeObserver(() => {
          scene?.resize();
          scene?.render();
        });
        observer.observe(mount.current);
      } catch {
        if (!cancelled) {
          setFallbackReason("Three.js module failed to load");
          setMode("svg");
        }
      }
    })();
    return () => {
      cancelled = true;
      observer?.disconnect();
      handle.current = null;
      clock.cancelJob("studio-camera");
      scene?.dispose();
      if ((window as { __studioViewport?: unknown }).__studioViewport)
        delete (window as { __studioViewport?: unknown }).__studioViewport;
    };
  }, [forceSvg, dark, reduced, clock]);

  /* --- model rebuild ---------------------------------------------------- */
  useEffect(() => {
    handle.current?.setModel(model);
    handle.current?.setSelection(selectionKey);
    handle.current?.render();
    // selectionKey handled by its own effect; model identity drives rebuilds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, mode]);

  useEffect(() => {
    handle.current?.setSelection(selectionKey);
    handle.current?.render();
  }, [selectionKey, mode]);

  /* --- the single playback subscription --------------------------------- */
  useLayoutEffect(() => {
    if (mode !== "webgl") return;
    return clock.subscribe((t) => {
      const scene = handle.current;
      if (!scene) return;
      scene.update(frameFor(t));
      scene.render();
    });
  }, [clock, frameFor, mode]);

  /* --- camera reorientation on the clock's own job channel -------------- */
  function orient(next: ViewName) {
    setView(next);
    const scene = handle.current;
    if (!scene) return;
    scene.setView(next, !reduced);
    if (reduced) {
      scene.render();
      return;
    }
    const step = () => {
      const s = handle.current;
      if (!s) return;
      if (s.tickCamera(performance.now())) clock.coalesce("studio-camera", step);
      s.render();
    };
    clock.coalesce("studio-camera", step);
  }

  function fit() {
    handle.current?.fit();
    handle.current?.render();
  }

  return (
    <div className="viewport">
      <div
        ref={mount}
        className="viewport-canvas"
        data-renderer={mode}
        onPointerDown={(e) => {
          if (e.button !== 0 || mode !== "webgl") return;
          const key = handle.current?.pick(e.clientX, e.clientY);
          if (key) onSelect(key);
        }}
      >
        {mode !== "webgl" && (
          <SvgStage
            clock={clock}
            model={model}
            frameFor={frameFor}
            selectionKey={selectionKey}
            onSelect={onSelect}
            reason={fallbackReason || "loading"}
          />
        )}
      </div>

      <div className="viewport-overlay">{overlay}</div>
      <div className="viewport-labels">{labels}</div>

      <div className="viewport-views" role="group" aria-label="View orientation">
        <div className="view-cube" aria-hidden="true" data-view={view}>
          <span />
        </div>
        {VIEWS.map((v) => (
          <button
            key={v.id}
            aria-label={v.label}
            aria-pressed={view === v.id}
            disabled={mode !== "webgl"}
            onClick={() => orient(v.id)}
          >
            {v.short}
          </button>
        ))}
        <button aria-label="Fit view" disabled={mode !== "webgl"} onClick={fit}>
          Fit
        </button>
        <button
          aria-label="Reset view"
          disabled={mode !== "webgl"}
          onClick={() => {
            orient("front");
            fit();
          }}
        >
          Reset
        </button>
      </div>

      <p className="viewport-caption">{caption}</p>
      {mode === "svg" && (
        <p className="viewport-fallback" role="status">
          {fallbackReason}. Semantic stage active; all values remain exact.
        </p>
      )}
    </div>
  );
}

