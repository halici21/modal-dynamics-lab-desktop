/**
 * Modal Dynamics Studio — Live Mathematics.
 *
 * The signature chain: physical object <-> force <-> equation term <-> matrix
 * contribution <-> result. An equation is composed of SEGMENTS, each carrying
 * the token ids it belongs to, so highlighting is structural — never string
 * parsing of rendered KaTeX. A coupling spring's segment appears in both mass
 * equations and both light together, because a coupling term affects two
 * equations (`mdl-live-mathematics` gate).
 *
 * FLIP transitions between derivation steps reuse the existing
 * EquationDerivation convention (getBoundingClientRect + Web Animations API,
 * driven by motion.educationalMs) and are interruptible: a new step cancels
 * the running animations rather than queueing behind them.
 */
import { useLayoutEffect, useMemo, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { motion } from "../../animation/motion";
import { selectionForToken, type StudioSelection } from "../selection";

export interface Segment {
  /** KaTeX source for this fragment. */
  tex: string;
  /** Token ids this fragment stands for. Empty = structural glue (+, =, 0). */
  tokens?: string[];
  /** Plain-text equivalent for the accessible name. */
  text?: string;
}

export interface EquationLine {
  id: string;
  segments: Segment[];
  /** Optional plain-language note under the line. */
  note?: string;
}

const cache = new Map<string, string>();
function tex(source: string) {
  const hit = cache.get(source);
  if (hit) return hit;
  const html = katex.renderToString(source, {
    throwOnError: false,
    output: "htmlAndMathml",
  });
  cache.set(source, html);
  return html;
}

export function Equation({
  line,
  active,
  onSelect,
}: {
  line: EquationLine;
  active: Set<string>;
  onSelect(s: StudioSelection): void;
}) {
  const label = line.segments.map((s) => s.text ?? "").filter(Boolean).join(" ");
  return (
    <div
      className="equation-line"
      role="group"
      aria-label={label || undefined}
    >
      {line.segments.map((segment, i) => {
        const tokens = segment.tokens ?? [];
        const lit = tokens.some((t) => active.has(t));
        if (!tokens.length)
          return (
            <span
              key={i}
              className="equation-glue"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: tex(segment.tex) }}
            />
          );
        return (
          <button
            key={i}
            type="button"
            data-token={tokens[0]}
            data-linked={lit || undefined}
            className={"equation-term" + (lit ? " linked" : "")}
            aria-pressed={lit}
            aria-label={segment.text ?? tokens[0]}
            onClick={() => onSelect(selectionForToken(tokens[0]))}
          >
            <span dangerouslySetInnerHTML={{ __html: tex(segment.tex) }} />
          </button>
        );
      })}
    </div>
  );
}

export function EquationBlock({
  lines,
  active,
  onSelect,
  step,
  reduced,
}: {
  lines: EquationLine[];
  active: Set<string>;
  onSelect(s: StudioSelection): void;
  step: number;
  reduced: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef<Map<string, DOMRect>>(new Map());
  useLayoutEffect(() => {
    const animations: Animation[] = [];
    root.current?.querySelectorAll<HTMLElement>("[data-token]").forEach((el) => {
      const id = el.dataset.token!;
      const box = el.getBoundingClientRect();
      const before = previous.current.get(id);
      if (before && !reduced && (before.x !== box.x || before.y !== box.y))
        animations.push(
          el.animate(
            [
              {
                transform: `translate(${before.x - box.x}px,${before.y - box.y}px)`,
              },
              { transform: "translate(0,0)" },
            ],
            { duration: motion.educationalMs, easing: motion.educationalEase },
          ),
        );
      previous.current.set(id, box);
    });
    // Interruptible: a new step cancels rather than queues.
    return () => animations.forEach((a) => a.cancel());
  }, [step, reduced, lines]);
  return (
    <div className="equation-block" ref={root}>
      {lines.map((line) => (
        <div key={line.id} className="equation-row">
          <Equation line={line} active={active} onSelect={onSelect} />
          {line.note && <p className="equation-note">{line.note}</p>}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step navigator                                                      */
/* ------------------------------------------------------------------ */

export interface DerivationStep {
  title: string;
  /** What the viewport should emphasise while this step is shown. */
  focus: string[];
  lines: EquationLine[];
  explain: string;
}

export function DerivationNavigator({
  steps,
  step,
  onStep,
  active,
  onSelect,
  reduced,
  overview,
  onOverview,
}: {
  steps: DerivationStep[];
  step: number;
  onStep(n: number): void;
  active: Set<string>;
  onSelect(s: StudioSelection): void;
  reduced: boolean;
  overview: boolean;
  onOverview(v: boolean): void;
}) {
  const current = steps[Math.min(step, steps.length - 1)];
  const merged = useMemo(() => {
    const set = new Set(active);
    current?.focus.forEach((t) => set.add(t));
    return set;
  }, [active, current]);
  if (!current) return null;

  if (overview)
    return (
      <div className="derivation">
        <div className="derivation-head">
          <h3>Derivation overview</h3>
          <button onClick={() => onOverview(false)}>Back to step {step + 1}</button>
        </div>
        <ol className="derivation-overview">
          {steps.map((s, i) => (
            <li key={s.title} aria-current={i === step ? "step" : undefined}>
              <button
                onClick={() => {
                  onStep(i);
                  onOverview(false);
                }}
              >
                <span className="derivation-overview-title">{s.title}</span>
                <EquationBlock
                  lines={s.lines.slice(0, 1)}
                  active={merged}
                  onSelect={onSelect}
                  step={i}
                  reduced
                />
              </button>
            </li>
          ))}
        </ol>
      </div>
    );

  return (
    <div className="derivation">
      <div className="derivation-head">
        <h3>{current.title}</h3>
        <span className="derivation-count">
          Step {step + 1} of {steps.length}
        </span>
      </div>
      <EquationBlock
        lines={current.lines}
        active={merged}
        onSelect={onSelect}
        step={step}
        reduced={reduced}
      />
      <p className="derivation-explain">{current.explain}</p>
      <div className="derivation-controls">
        <button disabled={step === 0} onClick={() => onStep(step - 1)}>
          Previous
        </button>
        <button onClick={() => onOverview(true)}>Overview</button>
        <button
          disabled={step >= steps.length - 1}
          onClick={() => onStep(step + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
