/**
 * Modal Dynamics Studio — the per-selection Property Manager body.
 *
 * One view per selected object type, showing only that object's parameters.
 * Every view ends with the object's contribution to the equation, because the
 * Property Manager is one of the five links in the live-mathematics chain, not
 * a settings form (`mdl-live-mathematics`).
 */
import { useLayoutEffect, useRef } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import type { assembleFE } from "../physics/fem";
import type { Modal } from "../physics/modal";
import { normalize } from "../physics/modal";
import type { System } from "../physics/systems";
import { format } from "../visualization/sdofGeometry";
import type { Density } from "./density";
import type { Sampler } from "./physics";
import {
  PropertyEmpty,
  PropertyFact,
  PropertyRow,
  PropertySection,
  PropertyState,
} from "./PropertyManager";
import { token, type LinkRef, type StudioSelection } from "./selection";

export interface PropertyContext {
  clock: SimulationClock;
  selection: StudioSelection;
  active: Set<string>;
  density: Density;
  system?: System;
  modal?: Modal;
  assembly?: ReturnType<typeof assembleFE>;
  sampler?: Sampler;
  links: LinkRef[];
  normalization: "max" | "mass";
  sign: 1 | -1;
  amplitude: number;
  x0: number[];
  v0: number[];
  limits: { mass: [number, number]; stiffness: [number, number]; damping: [number, number] };
  onMass(index: number, value: number): void;
  onSpring(index: number, value: number): void;
  onDamper(index: number, value: number): void;
  onInitial(index: number, key: "x0" | "v0", value: number): void;
  onAmplitude(value: number): void;
  onSelect(s: StudioSelection): void;
}

export function propertyTitle(ctx: PropertyContext): string {
  const s = ctx.selection;
  if (!s) return "Properties";
  switch (s.kind) {
    case "mass":
      return `Mass · m${s.index + 1}`;
    case "spring":
      return `Spring · ${ctx.links[s.index]?.label ?? "k" + (s.index + 1)}`;
    case "damper":
      return `Damper · c${s.index + 1}`;
    case "ground":
      return "Support";
    case "dof":
      return `Coordinate · ${ctx.system?.labels[s.index] ?? "x" + (s.index + 1)}`;
    case "mode":
      return `Mode ${s.index + 1}`;
    case "node":
      return `Node ${s.index + 1}`;
    case "element":
      return `Element ${s.index + 1}`;
    case "matrix":
      return `${s.matrix}${s.row + 1}${s.col + 1}`;
    case "term":
      return "Equation term";
  }
}

export function Properties(ctx: PropertyContext) {
  const s = ctx.selection;
  if (!s) return <PropertyEmpty density={ctx.density} />;
  const { system, modal, sampler, links, active, clock } = ctx;

  if ((s.kind === "mass" || s.kind === "dof") && system) {
    const i = Math.min(s.index, system.M.length - 1);
    const m = system.M[i][i];
    return (
      <>
        <PropertySection title="Definition">
          <PropertyRow
            label={`Mass m${i + 1}`}
            value={m}
            unit="kg"
            token={token.mass(i)}
            active={active.has(token.mass(i))}
            min={ctx.limits.mass[0]}
            max={ctx.limits.mass[1]}
            step={0.05}
            onChange={(v) => ctx.onMass(i, v)}
          />
        </PropertySection>
        {sampler && (
          <PropertySection title="Current state">
            <PropertyState clock={clock} sample={sampler.sample} index={i} />
          </PropertySection>
        )}
        <PropertySection title="Initial state">
          <PropertyRow
            label={`x₀ of ${system.labels[i]}`}
            value={ctx.x0[i] ?? 0}
            unit="m"
            min={-1}
            max={1}
            step={0.005}
            onChange={(v) => ctx.onInitial(i, "x0", v)}
          />
          <PropertyRow
            label={`v₀ of ${system.labels[i]}`}
            value={ctx.v0[i] ?? 0}
            unit="m/s"
            min={-10}
            max={10}
            step={0.05}
            onChange={(v) => ctx.onInitial(i, "v0", v)}
          />
        </PropertySection>
        <PropertySection title="Contribution">
          <PropertyFact label="Equation term" token={token.mass(i)} active>
            m{i + 1} ẍ{i + 1}
          </PropertyFact>
          <PropertyFact
            label="Matrix entry"
            token={token.cell("M", i, i)}
            active={active.has(token.cell("M", i, i))}
          >
            <button
              className="prop-link"
              onClick={() => ctx.onSelect({ kind: "matrix", matrix: "M", row: i, col: i })}
            >
              M{i + 1}
              {i + 1} = {format(m, 3)}
            </button>
          </PropertyFact>
        </PropertySection>
      </>
    );
  }

  if (s.kind === "spring" && system) {
    const link = links[s.index];
    if (!link) return <PropertyEmpty density={ctx.density} />;
    return (
      <>
        <PropertySection title="Definition">
          <PropertyRow
            label={`Stiffness ${link.label ?? "k"}`}
            value={link.k}
            unit="N/m"
            token={token.spring(s.index)}
            active
            min={ctx.limits.stiffness[0]}
            max={ctx.limits.stiffness[1]}
            step={5}
            onChange={(v) => ctx.onSpring(s.index, v)}
          />
          <PropertyFact label="Connects">
            {system.labels[link.i]} ↔ {link.j === null ? "ground" : system.labels[link.j]}
          </PropertyFact>
        </PropertySection>
        {sampler && (
          <PropertySection title="Live">
            <SpringLive clock={clock} sampler={sampler} link={link} />
          </PropertySection>
        )}
        <PropertySection title="Contribution">
          <PropertyFact label="Restoring force">
            F<sub>s</sub> = −{link.label ?? "k"}
            {link.j === null ? ` x${link.i + 1}` : ` (x${link.i + 1} − x${link.j + 1})`}
          </PropertyFact>
          <PropertyFact label="Stiffness matrix">
            <span className="prop-cells">
              {cellButtons(s.index, link, "K", ctx)}
            </span>
          </PropertyFact>
        </PropertySection>
      </>
    );
  }

  if (s.kind === "damper" && system) {
    const i = Math.min(s.index, system.C.length - 1);
    const c = system.C[i]?.[i] ?? 0;
    return (
      <>
        <PropertySection title="Definition">
          <PropertyRow
            label={`Damping c${i + 1}`}
            value={c}
            unit="N·s/m"
            token={token.damper(i)}
            active
            min={ctx.limits.damping[0]}
            max={ctx.limits.damping[1]}
            step={0.5}
            onChange={(v) => ctx.onDamper(i, v)}
          />
        </PropertySection>
        {sampler && (
          <PropertySection title="Current state">
            <PropertyState clock={clock} sample={sampler.sample} index={i} />
          </PropertySection>
        )}
        <PropertySection title="Contribution">
          <PropertyFact label="Damping force">
            F<sub>d</sub> = −c{i + 1} ẋ{i + 1}
          </PropertyFact>
          <PropertyFact label="Equation term">
            c{i + 1} ẋ{i + 1}
          </PropertyFact>
          <PropertyFact
            label="Matrix entry"
            token={token.cell("C", i, i)}
            active={active.has(token.cell("C", i, i))}
          >
            <button
              className="prop-link"
              onClick={() => ctx.onSelect({ kind: "matrix", matrix: "C", row: i, col: i })}
            >
              C{i + 1}
              {i + 1} = {format(c, 3)}
            </button>
          </PropertyFact>
        </PropertySection>
      </>
    );
  }

  if (s.kind === "ground" && system) {
    const anchored = links.filter((l) => l.j === null);
    return (
      <>
        <PropertySection title="Constraint">
          <PropertyFact label="Type">Fixed support · all motion prevented</PropertyFact>
          <PropertyFact label="Anchors">
            {anchored.length
              ? anchored.map((l) => l.label ?? "k").join(", ")
              : "none — this model is unsupported"}
          </PropertyFact>
        </PropertySection>
        <PropertySection title="Effect on the model">
          <PropertyFact label="Stiffness">
            {anchored.length
              ? "A grounded spring adds to a diagonal entry only. It resists that coordinate moving without a partner, which is what removes a rigid-body mode."
              : "With nothing grounded, K is singular and rigid-body modes appear at zero frequency."}
          </PropertyFact>
        </PropertySection>
      </>
    );
  }

  if (s.kind === "mode" && modal && system) {
    const i = Math.min(s.index, modal.modes.length - 1);
    const mode = modal.modes[i];
    const shape = normalize(mode.phi, system.M, ctx.normalization, ctx.sign);
    return (
      <>
        <PropertySection title="Solution">
          <PropertyFact label="Classification">
            {mode.kind === "zero" ? "Rigid body · no strain energy" : "Elastic"}
          </PropertyFact>
          <PropertyFact label="fₙ" token={token.omega(i)} active>
            {format(mode.frequency, 5)} Hz
          </PropertyFact>
          <PropertyFact label="ωₙ">{format(mode.omega, 5)} rad/s</PropertyFact>
          <PropertyFact label="λ">{format(mode.lambda, 5)} s⁻²</PropertyFact>
        </PropertySection>
        <PropertySection title="Shape">
          <PropertyFact label={ctx.normalization === "max" ? "max |φ| = 1" : "φᵀMφ = 1"}>
            [{shape.map((v) => format(v, 3)).join(", ")}]
          </PropertyFact>
          <PropertyRow
            label="Visualization scale"
            value={ctx.amplitude}
            unit="×"
            min={0.001}
            max={0.5}
            step={0.005}
            onChange={ctx.onAmplitude}
          />
          <PropertyFact label="Reading">
            Display only. The animated amplitude says nothing about how far the
            structure actually moves.
          </PropertyFact>
        </PropertySection>
        {ctx.density === "inspect" && (
          <PropertySection title="Diagnostics">
            <PropertyFact label="Eigen residual">
              {mode.residual.toExponential(3)}
            </PropertyFact>
            <PropertyFact label="Zero threshold">
              {modal.zeroTolerance.toExponential(3)} s⁻²
            </PropertyFact>
          </PropertySection>
        )}
      </>
    );
  }

  if (s.kind === "node" && ctx.assembly) {
    const a = ctx.assembly;
    const i = Math.min(s.index, a.nodes.length - 1);
    const dofs = Array.from({ length: a.perNode }, (_, j) => i * a.perNode + j);
    return (
      <>
        <PropertySection title="Geometry">
          <PropertyFact label="Position">
            ({format(a.nodes[i][0], 4)}, {format(a.nodes[i][1], 4)}) m
          </PropertyFact>
        </PropertySection>
        <PropertySection title="Degrees of freedom">
          {dofs.map((d) => (
            <PropertyFact key={d} label={a.labels[d]}>
              {a.fixed.includes(d) ? "constrained · eliminated" : "free"}
            </PropertyFact>
          ))}
        </PropertySection>
      </>
    );
  }

  if (s.kind === "element" && ctx.assembly) {
    const a = ctx.assembly;
    const i = Math.min(s.index, a.elementData.length - 1);
    const e = a.elementData[i];
    return (
      <>
        <PropertySection title="Element">
          <PropertyFact label="Nodes">
            {e.nodes[0] + 1} → {e.nodes[1] + 1}
          </PropertyFact>
          <PropertyFact label="Length">{format(e.L, 5)} m</PropertyFact>
        </PropertySection>
        <PropertySection title="Material and section">
          <PropertyFact label="E">{e.material.E.toExponential(2)} Pa</PropertyFact>
          <PropertyFact label="ρ">{e.material.rho} kg/m³</PropertyFact>
          <PropertyFact label="A">{e.section.A} m²</PropertyFact>
          <PropertyFact label="I">{e.section.I.toExponential(2)} m⁴</PropertyFact>
        </PropertySection>
        <PropertySection title="Assembly">
          <PropertyFact label="Local → global">
            {e.dofs.map((d) => a.labels[d]).join(", ")}
          </PropertyFact>
          <PropertyFact label="Local matrices">
            Kₑ and Mₑ are {e.K.length}×{e.K.length}; open the Assembly tab to see them
            and where they land.
          </PropertyFact>
        </PropertySection>
      </>
    );
  }

  if (s.kind === "matrix" && system) {
    const value = system[s.matrix][s.row]?.[s.col] ?? 0;
    return (
      <>
        <PropertySection title="Entry">
          <PropertyFact label="Value">{format(value, 6)}</PropertyFact>
          <PropertyFact label="Row">{system.labels[s.row]}</PropertyFact>
          <PropertyFact label="Column">{system.labels[s.col]}</PropertyFact>
        </PropertySection>
        <PropertySection title="Populated by">
          {s.matrix === "M" ? (
            <PropertyFact label="Source">
              {s.row === s.col ? `Mass m${s.row + 1}` : "Nothing — lumped mass is diagonal"}
            </PropertyFact>
          ) : (
            links
              .map((l, index) => ({ l, index }))
              .filter(({ l }) =>
                s.row === s.col
                  ? l.i === s.row || l.j === s.row
                  : l.j !== null &&
                    ((l.i === s.row && l.j === s.col) || (l.i === s.col && l.j === s.row)),
              )
              .map(({ l, index }) => (
                <PropertyFact key={index} label={l.label ?? "k" + (index + 1)}>
                  <button
                    className="prop-link"
                    onClick={() => ctx.onSelect({ kind: "spring", index })}
                  >
                    {s.row === s.col ? "+" : "−"}
                    {l.k} N/m
                  </button>
                </PropertyFact>
              ))
          )}
        </PropertySection>
      </>
    );
  }

  return <PropertyEmpty density={ctx.density} />;
}

function cellButtons(
  springIndex: number,
  link: LinkRef,
  matrix: "K" | "C",
  ctx: PropertyContext,
) {
  const cells: [number, number, string][] = [[link.i, link.i, "+"]];
  if (link.j !== null)
    cells.push([link.j, link.j, "+"], [link.i, link.j, "−"], [link.j, link.i, "−"]);
  void springIndex;
  return cells.map(([r, c, sign]) => {
    const id = token.cell(matrix, r, c);
    return (
      <button
        key={id}
        data-token={id}
        data-linked={ctx.active.has(id) || undefined}
        className={"prop-cell" + (ctx.active.has(id) ? " linked" : "")}
        onClick={() => ctx.onSelect({ kind: "matrix", matrix, row: r, col: c })}
      >
        {matrix}
        {r + 1}
        {c + 1} {sign}
        {link.k}
      </button>
    );
  });
}

function SpringLive({
  clock,
  sampler,
  link,
}: {
  clock: SimulationClock;
  sampler: Sampler;
  link: LinkRef;
}) {
  return (
    <LiveDl
      clock={clock}
      rows={[
        ["extension", "Extension", "m"],
        ["force", "Fs", "N"],
      ]}
      compute={(t) => {
        const s = sampler.sample(t);
        const a = s.x[link.i] ?? 0;
        const b = link.j === null ? 0 : (s.x[link.j] ?? 0);
        const extension = a - b;
        return { extension, force: -link.k * extension };
      }}
    />
  );
}

/** Small live readout list; values are written outside React. */
export function LiveDl({
  clock,
  rows,
  compute,
}: {
  clock: SimulationClock;
  rows: [string, string, string][];
  compute(t: number): Record<string, number>;
}) {
  const root = useRef<HTMLDivElement>(null);
  const latest = useRef(compute);
  latest.current = compute;
  useLayoutEffect(
    () =>
      clock.subscribe((t) => {
        const values = latest.current(t);
        const el = root.current;
        if (!el) return;
        for (const [key, value] of Object.entries(values)) {
          const out = el.querySelector<HTMLOutputElement>(`[data-live="${key}"]`);
          if (out) out.value = format(value, 4);
        }
      }),
    [clock],
  );
  return (
    <div className="prop-live" ref={root}>
      {rows.map(([key, label, unit]) => (
        <div key={key}>
          <span className="prop-label">{label}</span>
          <output data-live={key} aria-label={label} />
          <span className="prop-unit">{unit}</span>
        </div>
      ))}
    </div>
  );
}
