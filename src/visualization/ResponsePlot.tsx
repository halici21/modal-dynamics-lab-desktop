import { AnalysisVisibility } from "../components/AnalysisVisibility";
import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import { sampleSdof, type SdofSolution } from "../physics/sdof";
import { format } from "./sdofGeometry";
export function ResponsePlot({
  clock,
  solution,
  selected,
  onSelect,
  onInterrupt,
}: {
  clock: SimulationClock;
  solution: SdofSolution;
  selected: boolean;
  onSelect(): void;
  onInterrupt(): void;
}) {
  const visible = useContext(AnalysisVisibility);
  const root = useRef<HTMLElement>(null),
    cursor = useRef<SVGGElement>(null),
    dot = useRef<SVGCircleElement>(null),
    scrub = useRef<HTMLInputElement>(null),
    line = useRef<SVGPolylineElement>(null),
    origin = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(900);
  const damped = solution.parameters.damping !== undefined;
  const [envelopeVisible, setEnvelopeVisible] = useState(false);
  const duration = damped
    ? solution.horizon
    : solution.period
      ? solution.period * 4
      : 8;
  const samples = useMemo(
    () => sampleSdof(solution, 0, duration, width),
    [solution, duration, width],
  );
  const extent = Math.max(
    0.001,
    damped && envelopeVisible ? (solution.envelope ?? 0) : 0,
    ...samples.map((s) => Math.abs(s.x)),
  );
  const coords = (start: number) =>
    samples
      .map(
        (s) =>
          `${60 + (s.time / duration) * 880},${85 - (solution.sample(start + s.time).x / extent) * 55}`,
      )
      .join(" ");
  const points = useMemo(() => coords(0), [samples, extent]);
  const pageStart = useRef(0);
  useLayoutEffect(() => {
    if (!visible) return;
    const observer = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      clock.coalesce(root, () => setWidth(Math.max(100, w)));
    });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      clock.cancelJob(root);
    };
  }, [clock, visible]);
  useLayoutEffect(() => {
    if (!visible) return;
    let lastPage = -1;
    return clock.subscribe((time) => {
      const page = damped ? 0 : Math.floor(time / duration);
      const start = page * duration;
      pageStart.current = start;
      const local = damped ? Math.min(time, duration) : time - start;
      cursor.current?.setAttribute(
        "visibility",
        damped && time > duration ? "hidden" : "visible",
      );
      // Periodic response repeats exactly; zero-stiffness translations use fixed 8 s pages.
      let yExtent = extent;
      if (!damped && !solution.period)
        yExtent = Math.max(
          0.001,
          Math.abs(solution.sample(start).x),
          Math.abs(solution.sample(start + duration).x),
        );
      if (page !== lastPage) {
        lastPage = page;
        if (origin.current)
          origin.current.textContent =
            "Window starts at " + format(start, 2) + " s";
        if (!damped && !solution.period && line.current)
          line.current.setAttribute(
            "points",
            samples
              .map(
                (s) =>
                  `${60 + (s.time / duration) * 880},${85 - (solution.sample(start + s.time).x / yExtent) * 55}`,
              )
              .join(" "),
          );
        root.current?.querySelectorAll("[data-y-label]").forEach((el) => {
          el.textContent = format(
            Number(el.getAttribute("data-y-label")) * yExtent,
            3,
          );
        });
      }
      cursor.current?.setAttribute(
        "transform",
        `translate(${60 + (local / duration) * 880} 0)`,
      );
      dot.current?.setAttribute(
        "cy",
        String(85 - (solution.sample(time).x / yExtent) * 55),
      );
      if (damped && origin.current)
        origin.current.textContent =
          time > duration
            ? "Beyond fixed view · cursor hidden; inspector shows current time"
            : "Fixed window · starts at 0 s";
      if (scrub.current) scrub.current.value = String(local);
    });
  }, [clock, solution, duration, extent, samples, visible]);
  return (
    <section
      ref={root}
      className={"response " + (selected ? "linked" : "")}
      aria-label="Displacement response"
      data-samples={samples.length}
    >
      <div className="response-heading">
        <div>
          <span className="eyebrow">Displacement response</span>
          <span className="response-subtitle">x(t) · m</span>
        </div>
        <button
          className="series-select"
          aria-pressed={selected}
          onClick={onSelect}
        >
          — Displacement x
        </button>
        {damped && solution.envelope !== null && (
          <button
            aria-pressed={envelopeVisible}
            onClick={() => {
              onInterrupt();
              setEnvelopeVisible(!envelopeVisible);
            }}
          >
            Decay envelope
          </button>
        )}
        <span className="preview-note" ref={origin} />
      </div>
      <svg
        viewBox="0 0 1000 165"
        preserveAspectRatio="none"
        className="trace-svg"
        role="img"
        aria-label="Analytical displacement versus time, with synchronized time cursor"
      >
        <line x1="60" y1="85" x2="940" y2="85" className="zero-line" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1={60 + i * 220}
              x2={60 + i * 220}
              y1="25"
              y2="140"
              className="plot-guide"
            />
            <text
              x={60 + i * 220}
              y="160"
              textAnchor="middle"
              className="svg-micro"
            >
              {format((i * duration) / 4, 2)} s
            </text>
          </g>
        ))}
        {[1, 0, -1].map((i) => (
          <text
            key={i}
            data-y-label={i}
            x="2"
            y={89 - i * 55}
            className="svg-micro"
          >
            {format(i * extent, 3)}
          </text>
        ))}
        {damped &&
          envelopeVisible &&
          solution.envelope !== null &&
          [-1, 1].map((sign) => (
            <polyline
              key={sign}
              className="decay-envelope"
              points={samples
                .map(
                  (s) =>
                    60 +
                    (s.time / duration) * 880 +
                    "," +
                    (85 -
                      ((sign *
                        solution.envelope! *
                        Math.exp(
                          (-solution.damping / (2 * solution.parameters.mass)) *
                            s.time,
                        )) /
                        extent) *
                        55),
                )
                .join(" ")}
            />
          ))}
        <polyline ref={line} points={points} className="trace" />
        <g ref={cursor}>
          <line y1="25" y2="140" className="cursor" />
          <circle ref={dot} r="4" className="cursor-dot" />
        </g>
      </svg>
      <input
        ref={scrub}
        type="range"
        className="timeline-scrubber"
        min="0"
        max={duration}
        step="0.001"
        defaultValue="0"
        aria-label="Scrub simulation time"
        onChange={(e) => {
          const t = pageStart.current + e.currentTarget.valueAsNumber;
          onInterrupt();
          clock.pause();
          clock.setTime(t);
        }}
      />
      <p className="plot-note">
        {damped
          ? "Fixed analytical window; no periodic replay. Beyond the endpoint, the cursor is hidden; the inspector retains current time. Scrub to return to this window."
          : solution.period
            ? "Four periods per window; the exact periodic curve repeats as absolute time advances."
            : "Free translation: fixed eight-second windows; no oscillation."}{" "}
        Drag the trace to inspect time relative to the window start.
      </p>
    </section>
  );
}
