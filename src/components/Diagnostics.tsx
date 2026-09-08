import { useEffect, useRef } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
export function Diagnostics({ clock }: { clock: SimulationClock }) {
  const ref = useRef<HTMLPreElement>(null);
  useEffect(() => {
    let last = -Infinity;
    const update = () => {
      const now = performance.now();
      if (now - last < 500) return;
      last = now;
      const d = clock.diagnostics();
      const s = clock.getState();
      if (ref.current)
        ref.current.textContent = [
          "RENDER DIAGNOSTICS",
          d.fps.toFixed(1) + " FPS · " + d.averageMs.toFixed(2) + " ms avg",
          d.recentMs.toFixed(2) +
            " ms recent · " +
            d.worstMs.toFixed(2) +
            " ms worst",
          "RAF loops " + d.activeLoops + " · subscribers " + d.subscribers,
          (s.playing ? "Playing" : "Paused") +
            (s.suspended ? " / suspended" : "") +
            " · " +
            s.rate +
            "×",
          "SVG · " +
            (document
              .querySelector(".response")
              ?.getAttribute("data-samples") ?? "—") +
            " analytical samples",
          "DOF 1 · analytical solver " +
            (
              (window as unknown as { __labSolveMs: number }).__labSolveMs ?? 0
            ).toFixed(3) +
            " ms",
        ].join("\n");
    };
    const frame = clock.subscribe(update);
    const semantic = clock.subscribeState(() => {
      last = -Infinity;
      queueMicrotask(update);
    });
    return () => {
      frame();
      semantic();
    };
  }, [clock]);
  return (
    <pre ref={ref} className="diagnostics" aria-label="Render diagnostics" />
  );
}
