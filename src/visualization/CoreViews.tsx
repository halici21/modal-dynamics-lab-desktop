import type { Link } from "../physics/systems";
import { useContext, useLayoutEffect, useMemo, useRef } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import { AnalysisVisibility } from "../components/AnalysisVisibility";
import { format } from "./sdofGeometry";
import { beamInterpolate, type FEModel } from "../physics/fem";
export interface CoreSnapshot {
  x: number[];
  v: number[];
  a: number[];
  energy: number;
  q?: number[];
}
export interface CoreSolution {
  sample(t: number): CoreSnapshot;
  horizon: number;
  label: string;
  energyMeaningful?: boolean;
  visual?: boolean;
  components?(t: number): { transient: number; steady: number | null };
}
export function CoreStage({
  clock,
  solution,
  labels,
  onSelect,
  selected,
  fe,
  shape,
  staticShape,
  links,
}: {
  clock: SimulationClock;
  solution: CoreSolution;
  labels: string[];
  onSelect(i: number): void;
  selected: number;
  fe?: { model: FEModel; expand(x: number[]): number[] };
  shape?: number[];
  staticShape: boolean;
  links?: Link[];
}) {
  const root = useRef<HTMLElement>(null),
    n = labels.length;
  const travel=Math.max(2,Math.min(24,(630/n-44)*.4));
  const extent = useMemo(
    () =>
      Math.max(
        0.001,
        ...Array.from(
          { length: 129 },
          (_, i) => solution.sample((solution.horizon * i) / 128).x,
        )
          .flat()
          .map(Math.abs),
      ),
    [solution],
  );
  useLayoutEffect(
    () =>
      clock.subscribe((t) => {
        const s =
          staticShape && shape
            ? { ...solution.sample(t), x: shape }
            : solution.sample(t);
        const el = root.current;
        if (!el) return;
        el.querySelectorAll<SVGGElement>("[data-core-mass]").forEach((g, i) => {
          const d = Math.max(-travel, Math.min(travel, (travel * s.x[i]) / extent));
          g.setAttribute("transform", "translate(" + d + " 0)");
          g.setAttribute("data-x", String(s.x[i]));
        });
        const centers = s.x.map(
          (x, i) =>
            65 +
            (630 * (i + 0.5)) / n +
            Math.max(-travel, Math.min(travel, (travel * x) / extent)),
        );
        el.querySelectorAll<SVGPathElement>("[data-core-link]").forEach(
          (p, index) => {
            const l = links![index],
              a = l.j === null && l.i === 0 ? 35 : centers[l.i] + 22,
              b =
                l.j === null
                  ? l.i === 0
                    ? centers[0] - 22
                    : 725
                  : centers[l.j] - 22;
            let d = "M" + a + " 155";
            for (let k = 1; k <= 12; k++)
              d +=
                " L" +
                (a + ((b - a) * k) / 12) +
                " " +
                (k === 12 ? 155 : 155 + (k % 2 ? 5 : -5));
            p.setAttribute("d", d);
          },
        );
        el.querySelectorAll<HTMLOutputElement>("[data-core-value]").forEach(
          (o) => {
            const key = o.dataset.coreValue as "x" | "v" | "a";
            o.value = format(s[key][selected] ?? 0);
          },
        );
        const energy =
          el.querySelector<HTMLOutputElement>("[data-core-energy]");
        if (energy) energy.value = format(s.energy);
        const warning = el.querySelector("[data-core-warning]");
        if (warning)
          warning.textContent = s.x.some((x) => Math.abs(x) > extent * 1.001)
            ? "Outside fixed visual range; readouts retain exact values."
            : "";
        if (fe) {
          const full = fe.expand(s.x),
            nodes = fe.model.nodes,
            kind = fe.model.kind,
            per = kind === "bar" ? 1 : kind === "beam" ? 2 : 3;
          const L = Math.max(...nodes.map((p) => Math.hypot(...p))),
            gain = (0.15 * L) / Math.max(0.001, extent);
          const pts: number[][] = [];
          fe.model.elements.forEach((e) => {
            const [i, j] = e.nodes,
              dx = nodes[j][0] - nodes[i][0],
              dy = nodes[j][1] - nodes[i][1],
              l = Math.hypot(dx, dy),
              c = dx / l,
              s = dy / l;
            for (let k = 0; k <= 16; k++) {
              const u = k / 16;
              let ux = 0,
                uy = 0;
              if (kind === "bar") ux = (1 - u) * full[i] + u * full[j];
              else if (kind === "beam")
                uy = beamInterpolate(
                  full[per * i],
                  full[per * i + 1],
                  full[per * j],
                  full[per * j + 1],
                  l,
                  u,
                );
              else {
                const u1 = c * full[3 * i] + s * full[3 * i + 1],
                  v1 = -s * full[3 * i] + c * full[3 * i + 1],
                  u2 = c * full[3 * j] + s * full[3 * j + 1],
                  v2 = -s * full[3 * j] + c * full[3 * j + 1];
                const ax = (1 - u) * u1 + u * u2,
                  v = beamInterpolate(
                    v1,
                    full[3 * i + 2],
                    v2,
                    full[3 * j + 2],
                    l,
                    u,
                  );
                ux = c * ax - s * v;
                uy = s * ax + c * v;
              }
              pts.push([
                80 + (540 * (nodes[i][0] + u * dx + gain * ux)) / L,
                230 - (160 * (nodes[i][1] + u * dy + gain * uy)) / L,
              ]);
            }
          });
          el.querySelector("[data-fe-shape]")?.setAttribute(
            "points",
            pts.map((p) => p.join(",")).join(" "),
          );
        }
      }),
    [clock, solution, selected, extent, fe, shape, staticShape, links, n],
  );
  return (
    <section
      ref={root}
      className="physics-stage core-stage"
      aria-label="Physics Stage"
    >
      <div className="stage-heading">
        <span className="preview-badge">{solution.label}</span>
      </div>
      <svg
        className="stage-svg"
        viewBox="0 0 760 290"
        aria-label={
          fe
            ? "Finite element nodal mode with element interpolation"
            : "Coupled coordinates at shared simulation time"
        }
      >
        {fe ? (
          <>
            <polyline
              className="datum"
              points={fe.model.nodes
                .map((p) => [80 + 540 * p[0], 230 - 160 * p[1]].join(","))
                .join(" ")}
              fill="none"
            />
            <polyline data-fe-shape="" className="trace" />
          </>
        ) : (
          <>
            <path d="M35 195H725" className="rail" />
            {links?.map((l, i) => (
              <path
                key={i}
                data-core-link={i}
                className="spring"
                visibility={l.k > 0 ? "visible" : "hidden"}
              />
            ))}
            {links?.some((l) => l.j === null && l.i === 0) && (
              <path d="M35 115V195" className="rail" />
            )}
            {links?.some((l) => l.j === null && l.i === n - 1) && (
              <path d="M725 115V195" className="rail" />
            )}
            {labels.map((name, i) => {
              const x = 65 + (630 * (i + 0.5)) / n;
              return (
                <g key={i}>
                  <line x1={x} x2={x} y1={95} y2={220} className="datum" />
                  <g
                    data-core-mass={i}
                    role="button"
                    tabIndex={0}
                    aria-label={"Inspect DOF " + (i + 1)}
                    aria-pressed={selected === i}
                    onClick={() => onSelect(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(i);
                      }
                    }}
                  >
                    <rect
                      x={x - 22}
                      y={125}
                      width={44}
                      height={60}
                      rx={3}
                      className="carriage-face"
                    />
                    <text
                      x={x}
                      y={161}
                      textAnchor="middle"
                      className="svg-value"
                    >
                      {i + 1}
                    </text>
                  </g>
                  <text x={x} y={244} textAnchor="middle" className="svg-micro">
                    {name}
                  </text>
                </g>
              );
            })}
          </>
        )}
      </svg>
      <div className="core-live" aria-label="Selected DOF readout">
        <span>{labels[selected]}</span>
        {(["x", "v", "a"] as const).map((k, i) => (
          <span key={k}>
            {k} <output aria-label={k + " selected DOF"} data-core-value={k} />{" "}
            {solution.visual
              ? ["relative", "relative/s", "relative/s²"][i]
              : fe
                ? ["m / rad", "m/s / rad/s", "m/s² / rad/s²"][i]
                : ["m", "m/s", "m/s²"][i]}
          </span>
        ))}
        {solution.energyMeaningful !== false && (
          <span>
            E <output data-core-energy="" /> J
          </span>
        )}
      </div>
      <p className="plot-note" data-core-warning="" />
      <p className="stage-caption">
        {fe
          ? "Nodal translations and rotations; cubic Hermite bending interpolation. Display deformation is amplified."
          : solution.visual ? "Relative mode amplitudes have a fixed visual range; they are not physical displacements." : "Each coordinate has a fixed visual displacement range. Readouts use SI units."}{" "}
        {staticShape ? "Static mode shape · reduced motion." : ""}
      </p>
    </section>
  );
}
export function CorePlot({
  clock,
  solution,
  index,
}: {
  clock: SimulationClock;
  solution: CoreSolution;
  index: number;
}) {
  const visible = useContext(AnalysisVisibility),
    cursor = useRef<SVGLineElement>(null),
    slider = useRef<HTMLInputElement>(null);
  const data = useMemo(
    () =>
      Array.from({ length: 801 }, (_, i) => ({
        t: (solution.horizon * i) / 800,
        x: solution.sample((solution.horizon * i) / 800).x[index] ?? 0,
        parts: solution.components?.((solution.horizon * i) / 800),
      })),
    [solution, index],
  );
  const extent = Math.max(
    0.001,
    ...data.flatMap((s) => [
      Math.abs(s.x),
      Math.abs(s.parts?.transient ?? 0),
      Math.abs(s.parts?.steady ?? 0),
    ]),
  );
  useLayoutEffect(() => {
    if (!visible) return;
    return clock.subscribe((t) => {
      cursor.current?.setAttribute(
        "x1",
        String(50 + (900 * t) / solution.horizon),
      );
      cursor.current?.setAttribute(
        "x2",
        String(50 + (900 * t) / solution.horizon),
      );
      cursor.current?.setAttribute(
        "visibility",
        t <= solution.horizon ? "visible" : "hidden",
      );
      if (slider.current)
        slider.current.value = String(Math.min(t, solution.horizon));
    });
  }, [clock, solution, visible]);
  return (
    <section aria-label="Modal response plot">
      <p>
        x{index + 1}(t) · ±{format(extent)} · fixed window 0–
        {format(solution.horizon, 3)} s
      </p>
      <svg
        viewBox="0 0 1000 160"
        className="trace-svg"
        role="img"
        aria-label="Selected coordinate response"
      >
        <path d="M50 80H950" className="zero-line" />
        <polyline
          className="trace"
          points={data
            .map(
              (p) =>
                50 +
                (900 * p.t) / solution.horizon +
                "," +
                (80 - (60 * p.x) / extent),
            )
            .join(" ")}
        />
        {solution.components &&
          (["transient", "steady"] as const).map((key, i) => (
            <polyline
              key={key}
              fill="none"
              stroke={i ? "var(--force)" : "var(--velocity)"}
              strokeDasharray={i ? "3 4" : "7 4"}
              points={data
                .filter((p) => p.parts?.[key] !== null)
                .map(
                  (p) =>
                    50 +
                    (900 * p.t) / solution.horizon +
                    "," +
                    (80 - (60 * (p.parts?.[key] ?? 0)) / extent),
                )
                .join(" ")}
            />
          ))}
        <line ref={cursor} y1={10} y2={150} className="cursor" />
      </svg>
      <input
        ref={slider}
        className="core-scrub"
        type="range"
        aria-label="Scrub simulation time"
        min={0}
        max={solution.horizon}
        step={0.001}
        defaultValue={0}
        onChange={(e) => {
          const time = e.currentTarget.valueAsNumber;
          clock.pause();
          clock.setTime(time);
        }}
      />
      {solution.components && (
        <p className="plot-note">
          Solid: total · long dash: transient · short dash: bounded steady state
          (absent at resonance).
        </p>
      )}
      <p className="plot-note">
        Exact response at the shared time. Cursor hides beyond this fixed
        window; playback does not loop the physical solution.
      </p>
    </section>
  );
}
export function Curve({
  x,
  y,
  label,
}: {
  x: number[];
  y: (number | null)[];
  label: string;
}) {
  const valid = y.filter((v): v is number => v !== null && Number.isFinite(v)),
    max = Math.max(1e-30, ...valid.map(Math.abs)),
    end = x.at(-1) ?? 1;
  let path = "";
  let pen = false;
  x.forEach((v, i) => {
    if (y[i] === null) {
      pen = false;
      return;
    }
    path +=
      (pen ? " L" : " M") +
      (40 + (920 * v) / (end || 1)) +
      "," +
      (140 - (120 * y[i]!) / max);
    pen = true;
  });
  return (
    <figure className="core-curve">
      <svg
        role="img"
        aria-label={label}
        className="trace-svg"
        viewBox="0 0 1000 170"
      >
        <path d="M40 20V140H960" className="rail" />
        <path d={path} className="trace" />
        <text x={40} y={165} className="svg-micro">
          0
        </text>
        <text x={870} y={165} className="svg-micro">
          {format(end, 3)}
        </text>
        <text x={45} y={18} className="svg-micro">
          max {format(max)}
        </text>
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
