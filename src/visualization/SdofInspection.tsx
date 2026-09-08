import { AnalysisVisibility } from "../components/AnalysisVisibility";
import { useContext, useLayoutEffect, useMemo, useRef } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import {
  sampleSdof,
  type SdofSolution,
  type SdofSnapshot,
} from "../physics/sdof";
import type { Lens } from "../app/state";
import { format } from "./sdofGeometry";
const quantities: [keyof SdofSnapshot, string, string][] = [
  ["time", "t", "s"],
  ["x", "x", "m"],
  ["v", "v", "m/s"],
  ["a", "a", "m/s²"],
  ["force", "Fₛ", "N"],
  ["kinetic", "KE", "J"],
  ["potential", "PE", "J"],
  ["total", "E", "J"],
  ["residual", "ma + kx", "N"],
];
export function SdofInspector({
  clock,
  solution,
}: {
  clock: SimulationClock;
  solution: SdofSolution;
}) {
  const root = useRef<HTMLDListElement>(null);
  useLayoutEffect(
    () =>
      clock.subscribe((t) => {
        const s = solution.sample(t);
        root.current
          ?.querySelectorAll<HTMLOutputElement>("output")
          .forEach((el) => {
            const k = el.dataset.quantity as keyof SdofSnapshot;
            el.value = format(s[k]);
          });
      }),
    [clock, solution],
  );
  return (
    <div className="inspector sdof-inspector">
      <span className="eyebrow">Freeze & Inspect</span>
      <dl ref={root}>
        {(solution.parameters.damping !== undefined
          ? ([
              ...quantities.filter((q) => q[0] !== "residual"),
              ["dampingForce", "Fd", "N"],
              ["power", "Pd = cv²", "W"],
              ["dissipated", "E₀ − E", "J"],
              ["residual", "ma + cv + kx", "N"],
            ] as typeof quantities)
          : quantities
        ).map(([k, label, unit]) => (
          <div key={k}>
            <dt>{label}</dt>
            <dd>
              <output
                data-quantity={k}
                aria-label={label + " inspection"}
                aria-live="off"
              />{" "}
              <span>{unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
export function SdofLens({
  clock,
  solution,
  lens,
}: {
  clock: SimulationClock;
  solution: SdofSolution;
  lens: Lens;
}) {
  const visible = useContext(AnalysisVisibility);
  const kinetic = useRef<SVGRectElement>(null),
    potential = useRef<SVGRectElement>(null),
    text = useRef<SVGTextElement>(null),
    dot = useRef<SVGCircleElement>(null);
  const damped = solution.parameters.damping !== undefined;
  const duration = damped ? solution.horizon : (solution.period ?? 8);
  const samples = useMemo(
    () => sampleSdof(solution, 0, duration, 500),
    [solution, duration],
  );
  const xExtent = Math.max(0.001, ...samples.map((s) => Math.abs(s.x))),
    vExtent = Math.max(0.001, ...samples.map((s) => Math.abs(s.v)));
  const points = samples
    .map((s) => `${300 + (s.x / xExtent) * 210},${105 - (s.v / vExtent) * 65}`)
    .join(" ");
  useLayoutEffect(() => {
    if (!visible || (lens !== "Energy" && lens !== "Phase Space")) return;
    return clock.subscribe((t) => {
      const s = solution.sample(t),
        total = solution.energy || 1;
      kinetic.current?.setAttribute("width", String((500 * s.kinetic) / total));
      potential.current?.setAttribute(
        "x",
        String(50 + (500 * s.kinetic) / total),
      );
      potential.current?.setAttribute(
        "width",
        String((500 * s.potential) / total),
      );
      if (text.current)
        text.current.textContent = `KE ${format(s.kinetic)} J   +   PE ${format(s.potential)} J   =   E ${format(s.total)} J`;
      dot.current?.setAttribute("cx", String(300 + (s.x / xExtent) * 210));
      dot.current?.setAttribute("cy", String(105 - (s.v / vExtent) * 65));
    });
  }, [clock, solution, lens, xExtent, vExtent, visible]);
  if (lens !== "Energy" && lens !== "Phase Space") return null;
  return (
    <section className="lens-detail" aria-label={lens + " visualization"}>
      {lens === "Energy" ? (
        <>
          <span className="eyebrow">Energy exchange · J</span>
          <svg
            viewBox="0 0 600 100"
            role="img"
            aria-label={
              damped
                ? "Mechanical energy decreases; unfilled track represents dissipated energy"
                : "Kinetic and potential energy share a constant total"
            }
          >
            <rect
              x="50"
              y="22"
              width="500"
              height="24"
              className="energy-track"
            />
            <rect
              ref={kinetic}
              x="50"
              y="22"
              height="24"
              className="kinetic-bar"
            />
            <rect
              ref={potential}
              y="22"
              height="24"
              className="potential-bar"
            />
            <text
              ref={text}
              x="300"
              y="78"
              textAnchor="middle"
              className="svg-micro"
            />
          </svg>
          <p>
            {damped
              ? "Left: kinetic ½mv². Next: spring potential ½kx². The unfilled part of the E₀ track is dissipated energy; dE/dt = −cv²."
              : "Left: kinetic ½mv². Right: spring potential ½kx². Total energy is conserved."}
          </p>
        </>
      ) : (
        <>
          <span className="eyebrow">Phase space · x–v</span>
          <svg
            viewBox="0 0 600 220"
            role="img"
            aria-label="Position velocity trajectory"
          >
            <line x1="50" x2="550" y1="105" y2="105" className="zero-line" />
            <line x1="300" x2="300" y1="25" y2="180" className="zero-line" />
            <polyline points={points} className="phase-trace" />
            <circle ref={dot} r="5" className="phase-dot" />
            <text x="545" y="125" className="svg-micro">
              x (m)
            </text>
            <text x="310" y="20" className="svg-micro">
              v (m/s)
            </text>
            <text x="90" y="200" className="svg-micro">
              −{format(xExtent, 3)}
            </text>
            <text x="480" y="200" className="svg-micro">
              +{format(xExtent, 3)}
            </text>
            <text x="310" y="42" className="svg-micro">
              {format(vExtent, 3)}
            </text>
          </svg>
          <p>
            {damped
              ? "Fixed response window: underdamping spirals inward; real roots return without oscillatory cycling. The exact marker can leave this finite view."
              : solution.period
                ? "A closed ellipse: position and velocity exchange while energy stays constant."
                : "Constant velocity: the line shows the first eight seconds. The marker can leave this finite view."}
          </p>
        </>
      )}
    </section>
  );
}
