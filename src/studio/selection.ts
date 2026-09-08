/**
 * Modal Dynamics Studio — ONE semantic selection, and the token grammar that
 * carries it between the viewport, the model browser, the property manager,
 * the equations and the matrices.
 *
 * This extends the R2 `PhysicalSelection` idea (mass / spring / damper /
 * displacement) rather than introducing a parallel per-panel highlight system,
 * per `mdl-live-mathematics`. No physics lives here — this module only names
 * things the solver already produced.
 */

export type StudioSelection =
  | { kind: "study" }
  | { kind: "mass"; index: number }
  | { kind: "spring"; index: number }
  | { kind: "damper"; index: number }
  | { kind: "ground"; index: number }
  | { kind: "dof"; index: number }
  | { kind: "mode"; index: number }
  | { kind: "matrix"; matrix: "M" | "C" | "K"; row: number; col: number }
  | { kind: "node"; index: number }
  | { kind: "element"; index: number }
  | { kind: "term"; token: string }
  | null;

/**
 * Canonical token ids. Every surface that can show a quantity tags itself with
 * one of these, so a single id resolves consistently across the spring
 * geometry, the tree row, the property field, the equation term and the matrix
 * cell.
 */
export const token = {
  mass: (i: number) => `mass:m${i + 1}`,
  spring: (i: number) => `spring:k${i + 1}`,
  damper: (i: number) => `damper:c${i + 1}`,
  ground: (i: number) => `ground:${i}`,
  displacement: (i: number) => `displacement:x${i + 1}`,
  velocity: (i: number) => `velocity:v${i + 1}`,
  acceleration: (i: number) => `acceleration:a${i + 1}`,
  mode: (i: number) => `mode:phi${i + 1}`,
  omega: (i: number) => `omega:w${i + 1}`,
  cell: (m: "M" | "C" | "K", r: number, c: number) => `matrix:${m}${r}${c}`,
  node: (i: number) => `node:n${i + 1}`,
  element: (i: number) => `element:e${i + 1}`,
  free: () => "free:tokens",
} as const;

export function selectionKey(s: StudioSelection): string {
  if (!s) return "none";
  if (s.kind === "study") return "study";
  if (s.kind === "matrix") return `matrix:${s.matrix}:${s.row}:${s.col}`;
  if (s.kind === "term") return `term:${s.token}`;
  return `${s.kind}:${s.index}`;
}

export function sameSelection(a: StudioSelection, b: StudioSelection) {
  return selectionKey(a) === selectionKey(b);
}

/** A link as the solver assembled it: DOF i, DOF j (or ground), coefficient. */
export interface LinkRef {
  i: number;
  j: number | null;
  k: number;
  c?: number;
  label?: string;
}

/**
 * The five-link chain, resolved.
 *
 * Given a selection and the assembled model, returns EVERY token that must
 * light up. A coupling spring lights its own geometry, both equation terms it
 * appears in, and all four matrix entries it populates — as one set, never as
 * unrelated cells (`mdl-live-mathematics`, "No orphaned matrix cells").
 */
export function activeTokens(
  selection: StudioSelection,
  links: LinkRef[],
  dampers: LinkRef[] = [],
): Set<string> {
  const out = new Set<string>();
  if (!selection) return out;

  const springCells = (l: LinkRef, m: "K" | "C") => {
    out.add(token.cell(m, l.i, l.i));
    if (l.j !== null) {
      out.add(token.cell(m, l.j, l.j));
      out.add(token.cell(m, l.i, l.j));
      out.add(token.cell(m, l.j, l.i));
    }
  };

  switch (selection.kind) {
    case "study":
      break;
    case "mass":
    case "dof": {
      const i = selection.index;
      out.add(token.mass(i));
      out.add(token.displacement(i));
      out.add(token.acceleration(i));
      out.add(token.cell("M", i, i));
      break;
    }
    case "spring": {
      const l = links[selection.index];
      if (!l) break;
      out.add(token.spring(selection.index));
      out.add(token.displacement(l.i));
      if (l.j !== null) out.add(token.displacement(l.j));
      springCells(l, "K");
      break;
    }
    case "damper": {
      const l = dampers[selection.index] ?? links[selection.index];
      if (!l) break;
      out.add(token.damper(selection.index));
      out.add(token.velocity(l.i));
      if (l.j !== null) out.add(token.velocity(l.j));
      springCells(l, "C");
      break;
    }
    case "ground":
      out.add(token.ground(selection.index));
      links
        .filter((l) => l.j === null)
        .forEach((l) => out.add(token.spring(links.indexOf(l))));
      break;
    case "mode":
      out.add(token.mode(selection.index));
      out.add(token.omega(selection.index));
      break;
    case "node":
      out.add(token.node(selection.index));
      break;
    case "element":
      out.add(token.element(selection.index));
      break;
    case "matrix": {
      const { matrix, row, col } = selection;
      out.add(token.cell(matrix, row, col));
      if (matrix === "M") {
        if (row === col) {
          out.add(token.mass(row));
          out.add(token.acceleration(row));
        }
        break;
      }
      // Reverse link: which physical objects populate this cell?
      const source = matrix === "K" ? links : dampers.length ? dampers : links;
      source.forEach((l, index) => {
        const touches =
          (row === col && (l.i === row || l.j === row)) ||
          (row !== col && l.j !== null &&
            ((l.i === row && l.j === col) || (l.i === col && l.j === row)));
        if (!touches) return;
        out.add(matrix === "K" ? token.spring(index) : token.damper(index));
        out.add(token.displacement(l.i));
        if (l.j !== null) out.add(token.displacement(l.j));
        springCells(l, matrix);
      });
      break;
    }
    case "term":
      out.add(selection.token);
      break;
  }
  return out;
}

/** Inverse of the token grammar: which selection does this token stand for? */
export function selectionForToken(tok: string): StudioSelection {
  const [kind, rest] = tok.split(":");
  const index = Number(rest?.replace(/^[a-zA-Z]+/, "")) - 1;
  switch (kind) {
    case "mass":
      return { kind: "mass", index };
    case "spring":
      return { kind: "spring", index };
    case "damper":
      return { kind: "damper", index };
    case "displacement":
    case "velocity":
    case "acceleration":
      return { kind: "dof", index };
    case "mode":
    case "omega":
      return { kind: "mode", index };
    case "node":
      return { kind: "node", index };
    case "element":
      return { kind: "element", index };
    case "matrix": {
      const m = rest[0] as "M" | "C" | "K";
      return { kind: "matrix", matrix: m, row: +rest[1], col: +rest[2] };
    }
    default:
      return { kind: "term", token: tok };
  }
}

/**
 * Panel coordination (brief: "Avoid three redundant panels showing
 * simultaneously"). Names which surface leads for a given selection.
 */
export function dominantPanel(
  s: StudioSelection,
): "properties" | "mathematics" | "matrix" | "none" {
  if (!s) return "none";
  if (s.kind === "matrix") return "matrix";
  if (s.kind === "term") return "mathematics";
  return "properties";
}
