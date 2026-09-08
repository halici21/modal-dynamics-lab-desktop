import {
  DAMPED_EQUATIONS,
  DAMPED_EXPLANATIONS,
} from "../physics/dampedEquations";
import { useLayoutEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { SDOF_EQUATIONS, type SdofSolution } from "../physics/sdof";
import type { PhysicalSelection } from "../visualization/PhysicsStage";
import { motion } from "../animation/motion";
const explanations = [
  "Newton’s law: inertia balances the restoring spring term.",
  "Divide each term by the positive mass.",
  "Name the stiffness-to-mass ratio: squared natural angular frequency.",
  "Take the positive square root. Greater stiffness speeds the cycle; greater mass slows it.",
  "Use initial displacement and velocity to determine the exact free response.",
];
export function EquationDerivation({
  solution,
  selected,
  onSelect,
  step,
  onStep,
  reduced,
}: {
  solution: SdofSolution;
  selected: PhysicalSelection;
  onSelect(s: PhysicalSelection): void;
  step: number;
  onStep(n: number): void;
  reduced: boolean;
}) {
  const root = useRef<HTMLDivElement>(null),
    previous = useRef<Map<string, DOMRect>>(new Map());
  useLayoutEffect(() => {
    const animations: Animation[] = [];
    root.current
      ?.querySelectorAll<HTMLElement>("[data-token]")
      .forEach((el) => {
        const id = el.dataset.token!;
        const box = el.getBoundingClientRect(),
          before = previous.current.get(id);
        if (before && !reduced && (before.x !== box.x || before.y !== box.y))
          animations.push(
            el.animate(
              [
                {
                  transform: `translate(${before.x - box.x}px,${before.y - box.y}px)`,
                },
                { transform: "translate(0,0)" },
              ],
              {
                duration: motion.educationalMs,
                easing: motion.educationalEase,
              },
            ),
          );
        previous.current.set(id, box);
      });
    return () => animations.forEach((a) => a.cancel());
  }, [step, reduced]);
  const damped = solution.parameters.damping !== undefined;
  const formula = damped
    ? DAMPED_EQUATIONS[step]
    : solution.period
      ? SDOF_EQUATIONS[step]
      : String.raw`k=0:\quad\ddot{x}=0,\quad x(t)=x_0+v_0t`;
  return (
    <div
      ref={root}
      className={"derivation step-" + step}
      aria-label="Equation derivation"
    >
      <div className="equation-links" aria-label="Physical equation terms">
        {(damped
          ? (["mass", "spring", "displacement", "damper"] as const)
          : (["mass", "spring", "displacement"] as const)
        ).map((id, i) => (
          <button
            key={id}
            data-token={id}
            className={"equation-token token-" + id}
            aria-label={
              "Link " +
              ["m to mass", "k to spring", "x to displacement", "c to damper"][
                i
              ]
            }
            aria-pressed={selected === id}
            onClick={() => onSelect(id)}
          >
            {["m", "k", "x", "c"][i]}
          </button>
        ))}
        <span className="equation-link-hint">
          {damped
            ? "ma + cv + kx = 0"
            : step === 1
              ? "k / m"
              : step >= 2
                ? "ωₙ² = k / m"
                : "m · a + k · x = 0"}
        </span>
      </div>
      <div
        className="typeset-equation"
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(formula, {
            throwOnError: false,
            output: "htmlAndMathml",
          }),
        }}
      />
      <p>
        {damped
          ? DAMPED_EXPLANATIONS[step]
          : solution.period
            ? explanations[step]
            : "No restoring force. The mass remains at rest or translates uniformly; there is no finite oscillation period."}
      </p>
      <div className="derivation-controls">
        <button
          disabled={step === 0 || (!damped && !solution.period)}
          onClick={() => onStep(step - 1)}
        >
          ← Previous
        </button>
        <span>{step + 1}/5</span>
        <button
          disabled={step === 4 || (!damped && !solution.period)}
          onClick={() => onStep(step + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
