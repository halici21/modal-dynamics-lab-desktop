/**
 * Modal Dynamics Studio — semantic SVG stage.
 *
 * Two jobs:
 *  1. The fallback when WebGL is unavailable — never a blank viewport.
 *  2. The reduced-motion / evidence-honest projection, kept because the R2
 *     renderer decision found SVG best for readability.
 *
 * Same contract as the Three.js scene: it receives solved samples, sets
 * attributes directly from the clock subscription, and never re-renders React
 * during playback.
 */
import { useLayoutEffect, useRef } from "react";
import type { SimulationClock } from "../../animation/SimulationClock";
import type { ChainSpec, FeSpec, FrameData, ViewportModel } from "./scene";

const W = 960;
const H = 420;

export function SvgStage({
  clock,
  model,
  frameFor,
  selectionKey,
  onSelect,
  reason,
}: {
  clock: SimulationClock;
  model: ViewportModel;
  frameFor(t: number): FrameData;
  selectionKey: string | null;
  onSelect(key: string): void;
  reason: string;
}) {
  const root = useRef<SVGSVGElement>(null);
  const scale = model.kind === "rigid" ? 1 : (W - 160) / Math.max(0.001, model.span);

  useLayoutEffect(
    () =>
      clock.subscribe((t) => {
        const el = root.current;
        if (!el) return;
        const frame = frameFor(t);
        if (model.kind === "chain") {
          const centers = model.positions.map(
            (p, i) => W / 2 + (p + (frame.offsets[i] ?? 0)) * scale,
          );
          el.querySelectorAll<SVGGElement>("[data-svg-mass]").forEach((g, i) => {
            g.setAttribute("transform", `translate(${centers[i] - W / 2} 0)`);
          });
          el.querySelectorAll<SVGPathElement>("[data-svg-spring]").forEach(
            (p, i) => {
              const s = model.springs[i];
              const a =
                s.from === null ? 80 : centers[s.from] + (model.sizes[s.from] * scale) / 2;
              const b =
                s.to === null ? W - 80 : centers[s.to] - (model.sizes[s.to] * scale) / 2;
              let d = `M${a} ${H / 2}`;
              for (let k = 1; k <= 14; k++)
                d += ` L${a + ((b - a) * k) / 14} ${k === 14 ? H / 2 : H / 2 + (k % 2 ? 13 : -13)}`;
              p.setAttribute("d", d);
            },
          );
        } else if (model.kind === "fe" && frame.fePoints) {
          const pts: string[] = [];
          for (let i = 0; i + 2 < frame.fePoints.length; i += 3)
            pts.push(
              `${W / 2 + frame.fePoints[i] * scale},${H / 2 - frame.fePoints[i + 1] * scale}`,
            );
          el.querySelector("[data-svg-fe]")?.setAttribute("points", pts.join(" "));
        } else if (model.kind === "rigid" && frame.rigid) {
          const [tx, ty] = frame.rigid.t;
          const rz = frame.rigid.r[2];
          el.querySelector("[data-svg-rigid]")?.setAttribute(
            "transform",
            `translate(${tx * 60} ${-ty * 60}) rotate(${(rz * 180) / Math.PI} ${W / 2} ${H / 2})`,
          );
        }
      }),
    [clock, model, frameFor, scale],
  );

  return (
    <svg
      ref={root}
      className="studio-svg-stage"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Semantic stage · ${reason}`}
    >
      <defs>
        <pattern id="studio-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 8L8 0" className="studio-svg-hatch" />
        </pattern>
      </defs>
      {model.kind === "chain" && <ChainSvg model={model} selectionKey={selectionKey} onSelect={onSelect} scale={scale} />}
      {model.kind === "fe" && <FeSvg model={model} scale={scale} />}
      {model.kind === "rigid" && (
        <g data-svg-rigid="">
          <rect
            x={W / 2 - 130}
            y={H / 2 - 60}
            width={260}
            height={120}
            rx={4}
            className="studio-svg-body"
          />
        </g>
      )}
    </svg>
  );
}

function ChainSvg({
  model,
  selectionKey,
  onSelect,
  scale,
}: {
  model: ChainSpec;
  selectionKey: string | null;
  onSelect(key: string): void;
  scale: number;
}) {
  return (
    <>
      <path d={`M80 ${H / 2 + 90}H${W - 80}`} className="studio-svg-rail" />
      {model.springs.some((s) => s.from === null) && (
        <>
          <rect x={62} y={H / 2 - 80} width={18} height={172} fill="url(#studio-hatch)" />
          <path d={`M80 ${H / 2 - 80}V${H / 2 + 92}`} className="studio-svg-rail" />
        </>
      )}
      {model.springs.some((s) => s.to === null) && (
        <>
          <rect x={W - 80} y={H / 2 - 80} width={18} height={172} fill="url(#studio-hatch)" />
          <path d={`M${W - 80} ${H / 2 - 80}V${H / 2 + 92}`} className="studio-svg-rail" />
        </>
      )}
      {model.springs.map((s, i) => (
        <path
          key={i}
          data-svg-spring={i}
          className={
            "studio-svg-spring" +
            (selectionKey === `spring:${s.index}` ? " selected" : "")
          }
        />
      ))}
      {model.positions.map((p, i) => {
        const cx = W / 2 + p * scale;
        const w = Math.max(28, model.sizes[i] * scale);
        return (
          <g key={i} data-svg-mass={i}>
            <g
              role="button"
              tabIndex={0}
              aria-label={`Select ${model.labels[i]}`}
              aria-pressed={selectionKey === `mass:${i}`}
              className={
                "studio-svg-massgroup" +
                (selectionKey === `mass:${i}` ? " selected" : "")
              }
              onClick={() => onSelect(`mass:${i}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(`mass:${i}`);
                }
              }}
            >
              <rect
                x={cx - w / 2}
                y={H / 2 - 44}
                width={w}
                height={88}
                rx={3}
                className="studio-svg-body"
              />
            </g>
          </g>
        );
      })}
    </>
  );
}

function FeSvg({ model, scale }: { model: FeSpec; scale: number }) {
  const pts = model.nodes
    .map(
      (p) =>
        `${W / 2 + (p[0] * model.span - model.span / 2) * scale},${H / 2 - p[1] * model.span * scale}`,
    )
    .join(" ");
  return (
    <>
      <polyline points={pts} className="studio-svg-ghost" fill="none" />
      <polyline data-svg-fe="" className="studio-svg-fe" fill="none" />
    </>
  );
}
