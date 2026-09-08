import { useLayoutEffect, useMemo, useRef } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import type { Lens } from "../app/state";
import { sampleSdof, type SdofSolution } from "../physics/sdof";
import {
  arrowPath,
  clamp,
  format,
  springPath,
  stageExtent,
} from "./sdofGeometry";
export type PhysicalSelection =
  "mass" | "spring" | "damper" | "displacement" | null;
export function PhysicsStage({
  clock,
  solution,
  selected,
  lens,
  reduced,
  onSelect,
  onInitialDisplacement,
  onInterrupt,
}: {
  clock: SimulationClock;
  solution: SdofSolution;
  selected: PhysicalSelection;
  lens: Lens;
  reduced: boolean;
  onSelect(s: PhysicalSelection): void;
  onInitialDisplacement(x: number): void;
  onInterrupt(): void;
}) {
  const damped = solution.parameters.damping !== undefined;
  const damper = useRef<SVGPathElement>(null),
    dampingForce = useRef<SVGPathElement>(null);
  const svg = useRef<SVGSVGElement>(null),
    body = useRef<SVGGElement>(null),
    spring = useRef<SVGPathElement>(null);
  const dimension = useRef<SVGPathElement>(null),
    velocity = useRef<SVGPathElement>(null),
    force = useRef<SVGPathElement>(null);
  const value = useRef<SVGTextElement>(null),
    offscale = useRef<SVGTextElement>(null);
  const drag = useRef<{
    id: number;
    start: number;
    x0: number;
    scale: number;
    moved: boolean;
  } | null>(null);
  const staticPositions = useMemo(() => {
    if (!damped || !reduced)
      return [-(solution.amplitude ?? 0), solution.amplitude ?? 0];
    const points = sampleSdof(solution, 0, solution.horizon, 500);
    return [
      Math.min(...points.map((p) => p.x)),
      Math.max(...points.map((p) => p.x)),
    ];
  }, [solution, damped, reduced]);
  const extent = stageExtent(solution),
    scale = 160 / extent;
  useLayoutEffect(
    () =>
      clock.subscribe((time) => {
        const s = solution.sample(time),
          x = clamp(s.x * scale, -180, 230),
          center = 450 + x;
        body.current?.setAttribute("transform", `translate(${x} 0)`);
        body.current?.setAttribute("data-x", String(s.x));
        damper.current?.setAttribute(
          "d",
          "M130 222H235 M235 212V232H310V212H235 M270 212V232 M270 222H" +
            (center - 50),
        );
        dampingForce.current?.setAttribute(
          "d",
          arrowPath(
            center,
            center +
              (100 * s.dampingForce) /
                Math.max(
                  0.001,
                  solution.damping *
                    Math.sqrt((2 * solution.energy) / solution.parameters.mass),
                ),
            255,
          ),
        );
        spring.current?.setAttribute("d", springPath(center - 50));
        dimension.current?.setAttribute("d", arrowPath(450, center, 118));
        velocity.current?.setAttribute(
          "d",
          arrowPath(
            center,
            center +
              (90 * s.v) /
                Math.max(
                  0.001,
                  solution.omega * (solution.amplitude ?? 0),
                  Math.abs(solution.parameters.v0),
                ),
            90,
          ),
        );
        force.current?.setAttribute(
          "d",
          arrowPath(
            center,
            center +
              (100 * s.force) /
                Math.max(
                  0.001,
                  solution.parameters.stiffness * (solution.amplitude ?? 0),
                ),
            275,
          ),
        );
        if (value.current)
          value.current.textContent = "x = " + format(s.x) + " m";
        if (offscale.current)
          offscale.current.textContent =
            Math.abs(s.x * scale - x) > 0.01
              ? "Mass outside view · exact position in inspector"
              : "";
      }),
    [clock, solution, scale],
  );
  useLayoutEffect(
    () => () => {
      drag.current = null;
    },
    [],
  );
  const select = (s: PhysicalSelection) => {
    onInterrupt();
    clock.pause();
    onSelect(s);
  };
  const point = (clientX: number, clientY: number) => {
    const matrix = svg.current?.getScreenCTM();
    return matrix
      ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()).x
      : 450;
  };
  return (
    <section className="physics-stage" aria-label="Physics Stage">
      <div className="stage-heading">
        <span className="eyebrow">PHYSICS STAGE / 01</span>
        <span className="preview-badge">
          {damped
            ? solution.regime
            : solution.omega
              ? "Undamped · Free response"
              : "Zero stiffness · Free translation"}
        </span>
      </div>
      <svg
        ref={svg}
        className="stage-svg"
        viewBox="65 55 690 285"
        aria-label="One mass connected to a fixed wall by a linear spring"
      >
        <defs>
          <pattern
            id="hatch"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 7L7 0" className="hatch" />
          </pattern>
        </defs>
        <text x="400" y="35" textAnchor="middle" className="svg-caption">
          {solution.omega
            ? "PULL THE MASS. SET THE INITIAL DISPLACEMENT."
            : damped && solution.damping > 0
              ? "NO RESTORING FORCE · VISCOUS SLOWING"
              : "NO RESTORING FORCE · CONSTANT VELOCITY"}
        </text>
        <rect x="110" y="140" width="20" height="101" fill="url(#hatch)" />
        <path d="M130 140V240H730" className="rail" />
        <line x1="450" x2="450" y1="105" y2="295" className="datum" />
        <text x="450" y="318" textAnchor="middle" className="svg-micro">
          Equilibrium · x = 0
        </text>
        <text x="640" y="318" className="svg-micro">
          +x →
        </text>
        {reduced && solution.amplitude !== null && (
          <g className="extremes">
            <rect
              x={400 + clamp(staticPositions[0] * scale, -180, 230)}
              y="150"
              width="100"
              height="80"
            />
            <rect
              x={400 + clamp(staticPositions[1] * scale, -180, 230)}
              y="150"
              width="100"
              height="80"
            />
          </g>
        )}
        <g
          role="button"
          tabIndex={0}
          aria-label="Inspect spring"
          aria-pressed={selected === "spring"}
          onClick={() => select("spring")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              select("spring");
            }
          }}
          className={
            "spring-object " + (selected === "spring" ? "selected" : "")
          }
        >
          <rect x="130" y="155" width="240" height="65" fill="transparent" />
          <path ref={spring} className="spring" d={springPath(400)} />
          <text x="240" y="150" className="svg-micro">
            k = {solution.parameters.stiffness} N/m
          </text>
        </g>
        {damped && (
          <g
            role="button"
            tabIndex={0}
            aria-label="Inspect damper"
            aria-pressed={selected === "damper"}
            className={
              "damper-object " + (selected === "damper" ? "selected" : "")
            }
            onClick={() => select("damper")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                select("damper");
              }
            }}
          >
            <rect x="130" y="207" width="240" height="31" fill="transparent" />
            <path ref={damper} className="damper" />
            <text x="140" y="207" className="svg-micro">
              c = {format(solution.damping, 2)} N·s/m
            </text>
          </g>
        )}
        {damped && (
          <g
            className="damping-vector"
            visibility={lens === "Forces" ? "visible" : "hidden"}
          >
            <path ref={dampingForce} />
            <text x="145" y="259" className="svg-micro">
              Fd = −cv (dashed)
            </text>
          </g>
        )}
        <path
          ref={dimension}
          className={
            "dimension " + (selected === "displacement" ? "selected" : "")
          }
        />
        <text
          ref={value}
          x="450"
          y="140"
          textAnchor="middle"
          className="svg-value"
        />
        <g className="velocity-vector">
          <path ref={velocity} />
          <text x="450" y="72" textAnchor="middle" className="svg-micro">
            v · velocity direction
          </text>
        </g>
        <g
          className="force-vector"
          visibility={lens === "Forces" ? "visible" : "hidden"}
        >
          <path ref={force} />
          <text x="450" y="295" textAnchor="middle" className="svg-micro">
            Fₛ = −kx · restoring force
          </text>
        </g>
        <g
          ref={body}
          role="button"
          tabIndex={0}
          aria-label="Inspect mass or drag to set initial displacement"
          aria-pressed={selected === "mass"}
          className={"carriage " + (selected === "mass" ? "selected" : "")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              select("mass");
            }
          }}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            onInterrupt();
            clock.pause();
            onSelect("mass");
            drag.current = {
              id: e.pointerId,
              start: point(e.clientX, e.clientY),
              x0: solution.sample(clock.read()).x,
              scale,
              moved: false,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d || d.id !== e.pointerId) return;
            const delta = point(e.clientX, e.clientY) - d.start;
            if (Math.abs(delta) > 2) d.moved = true;
            if (d.moved) {
              clock.setTime(0);
              onInitialDisplacement(clamp(d.x0 + delta / d.scale, -0.2, 0.2));
            }
          }}
          onPointerUp={(e) => {
            if (drag.current?.id === e.pointerId) {
              drag.current = null;
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
        >
          <rect
            x="394"
            y="144"
            width="112"
            height="92"
            rx="4"
            className="carriage-outline"
          />
          <rect
            x="400"
            y="150"
            width="100"
            height="80"
            rx="2"
            className="carriage-face"
          />
          <text x="450" y="194" textAnchor="middle" className="body-label">
            {solution.parameters.mass} kg
          </text>
          <text x="450" y="214" textAnchor="middle" className="svg-micro">
            m · DOF 1
          </text>
        </g>
        <text
          ref={offscale}
          x="400"
          y="335"
          textAnchor="middle"
          className="svg-micro"
        />
      </svg>
      <div className="stage-caption">
        <span className="small-index">{lens}</span>
        <span>
          {damped
            ? lens === "Forces"
              ? "Solid Fₛ = −kx; dashed Fd = −cv. Each arrow uses its own fixed relative scale. ma = Fₛ + Fd."
              : lens === "Energy"
                ? "Mechanical energy decreases at Pd = cv². The damper dissipates energy."
                : "Linear viscous damper in parallel with the spring. Drag sets x₀ at t = 0; no forcing."
            : lens === "Forces"
              ? "The spring force points toward equilibrium. Arrow lengths are relative; values use SI units."
              : lens === "Energy"
                ? "Kinetic and spring energy exchange; their sum stays constant."
                : lens === "Phase Space"
                  ? "Follow the same instant on the position–velocity orbit below."
                  : lens === "Mathematics"
                    ? "Select m, k or x to connect the equation to this system."
                    : "Ideal linear spring; no damping or forcing. Drag sets x₀, pauses and returns to t = 0."}
        </span>
      </div>
    </section>
  );
}
