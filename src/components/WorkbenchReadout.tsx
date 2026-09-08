import { useLayoutEffect, useRef } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import type { SdofSolution, SdofSnapshot } from "../physics/sdof";
import type { PhysicalSelection } from "../visualization/PhysicsStage";
import { format } from "../visualization/sdofGeometry";
export function LiveReadout({
  clock,
  solution,
}: {
  clock: SimulationClock;
  solution: SdofSolution;
}) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () =>
      clock.subscribe((t) => {
        const s = solution.sample(t);
        root.current
          ?.querySelectorAll<HTMLOutputElement>("output")
          .forEach(
            (el) =>
              (el.value = format(s[el.dataset.live as keyof SdofSnapshot])),
          );
      }),
    [clock, solution],
  );
  return (
    <div
      className="live-readout"
      ref={root}
      aria-label="Live physical quantities"
    >
      {[
        ["x", "x", "m"],
        ["v", "v", "m/s"],
        ["a", "a", "m/s²"],
        ["force", "Fₛ", "N"],
      ].map(([key, label, unit]) => (
        <div key={key} className={"quantity-" + key}>
          <span>{label}</span>
          <output
            data-live={key}
            aria-label={label + " live"}
            aria-live="off"
          />
          <small>{unit}</small>
        </div>
      ))}
    </div>
  );
}
export function ObjectContext({
  selected,
  solution,
}: {
  selected: PhysicalSelection;
  solution: SdofSolution;
  clock: SimulationClock;
}) {
  const p = solution.parameters;
  const info =
    selected === "mass"
      ? [
          "Mass · m",
          format(p.mass, 2) + " kg",
          "Inertial resistance",
          "m a = Fₛ" + (solution.damping ? " + Fd" : ""),
        ]
      : selected === "spring"
        ? [
            "Spring · k",
            format(p.stiffness, 2) + " N/m",
            "Restoring force",
            "Fₛ = −kx",
          ]
        : selected === "damper"
          ? [
              "Damper · c",
              format(solution.damping, 2) + " N·s/m",
              "Resistance to velocity",
              "Fd = −cv",
            ]
          : selected === "displacement"
            ? [
                "Displacement · x",
                "Positive to the right",
                "Measured from equilibrium",
                "x = 0 at equilibrium",
              ]
            : [
                "Freeze & Inspect",
                "One synchronized state",
                "Select a mass, spring or equation symbol to explore its role.",
                "All values share the same simulation time.",
              ];
  return (
    <div className="object-context">
      <span className="context-kicker">
        {selected ? "Physical object" : "Current state"}
      </span>
      <h3>{info[0]}</h3>
      <div className="context-value">{info[1]}</div>
      <p>{info[2]}</p>
      <p className={"context-equation token-" + selected}>{info[3]}</p>
    </div>
  );
}
