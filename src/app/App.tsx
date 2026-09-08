/**
 * Modal Dynamics Studio — application root (CAD EXPERIENCE R3).
 *
 * Thin container: owns theme, reduced motion, the desktop lifecycle binding
 * and which study is active. Everything else lives in src/studio.
 *
 * The R2 renderer study stays reachable at ?r2=renderer-study because it is
 * the recorded evidence behind the renderer decision, not production UI.
 */
import { useCallback, useEffect, useState } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import { bindLifecycle } from "../animation/lifecycle";
import { bindDesktop } from "./desktop";
import { Diagnostics } from "../components/Diagnostics";
import { RendererStudy } from "../visualization/RendererStudy";
import { StudioWorkspace } from "../studio/StudioWorkspace";
import type { Density } from "../studio/density";
import "../studio/studio.css";

export function App({ clock }: { clock: SimulationClock }) {
  const query = new URLSearchParams(window.location.search);
  const [theme, setTheme] = useState<"dark" | "light">(
    query.get("theme") === "light" ? "light" : "dark",
  );
  const [reduced, setReduced] = useState(false);
  const [nativeError, setNativeError] = useState(false);
  const [diagnostics, setDiagnostics] = useState(false);
  const [module, setModule] = useState(() => Number(query.get("study") ?? 0));
  const [density, setDensity] = useState<Density>(
    (query.get("density") as Density) ?? "explore",
  );
  const forceSvg = query.get("renderer") === "svg";

  useEffect(() => {
    const a = bindLifecycle(clock, setReduced);
    const b = bindDesktop(clock, () => setNativeError(true));
    clock.play();
    return () => {
      a();
      b();
      clock.pause();
    };
  }, [clock]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const changeTheme = useCallback((next: "dark" | "light") => {
    // Suppress transitions across the swap so the page snaps rather than
    // smearing every color at once (better-ui).
    const style = document.createElement("style");
    style.textContent = "*,*::before,*::after{transition:none !important}";
    document.head.appendChild(style);
    setTheme(next);
    requestAnimationFrame(() => {
      void document.body.offsetHeight;
      style.remove();
    });
  }, []);

  if (query.get("r2") === "renderer-study") return <RendererStudy clock={clock} />;

  return (
    <>
      <StudioWorkspace
        clock={clock}
        module={module}
        onModule={setModule}
        density={density}
        onDensity={setDensity}
        theme={theme}
        onTheme={changeTheme}
        reduced={reduced}
        forceSvg={forceSvg}
        nativeError={nativeError}
      />
      {import.meta.env.DEV && (
        <button
          className="studio-diagnostics-toggle"
          onClick={() => setDiagnostics((d) => !d)}
          aria-pressed={diagnostics}
        >
          Diagnostics
        </button>
      )}
      {import.meta.env.DEV && diagnostics && <Diagnostics clock={clock} />}
    </>
  );
}
