import {
  check,
  finite,
  mul,
  scale,
  transpose,
  vector,
  zeros,
  type Mat,
} from "./common";
import { solveModal } from "./modal";
import type { System } from "./systems";
export interface Material {
  E: number;
  rho: number;
}
export interface Section {
  A: number;
  I: number;
}
export type ElementKind = "bar" | "beam" | "frame";
export interface FEElement {
  nodes: [number, number];
  material: Material;
  section: Section;
}
export interface FEModel {
  kind: ElementKind;
  nodes: number[][];
  elements: FEElement[];
  fixed: number[];
}
function properties(E: number, rho: number, A: number, L: number, I = 1) {
  finite([E, rho, A, L, I]);
  check(
    [E, rho, A, L, I].every((x) => x > 0),
    "E, rho, A, L and I must be positive.",
  );
}
export function barElement(E: number, rho: number, A: number, L: number) {
  properties(E, rho, A, L);
  return {
    K: scale(
      [
        [1, -1],
        [-1, 1],
      ],
      (E * A) / L,
    ),
    M: scale(
      [
        [2, 1],
        [1, 2],
      ],
      (rho * A * L) / 6,
    ),
  };
}
export function beamElement(
  E: number,
  rho: number,
  A: number,
  I: number,
  L: number,
) {
  properties(E, rho, A, L, I);
  return {
    K: scale(
      [
        [12, 6 * L, -12, 6 * L],
        [6 * L, 4 * L * L, -6 * L, 2 * L * L],
        [-12, -6 * L, 12, -6 * L],
        [6 * L, 2 * L * L, -6 * L, 4 * L * L],
      ],
      (E * I) / L ** 3,
    ),
    M: scale(
      [
        [156, 22 * L, 54, -13 * L],
        [22 * L, 4 * L * L, 13 * L, -3 * L * L],
        [54, 13 * L, 156, -22 * L],
        [-13 * L, -3 * L * L, -22 * L, 4 * L * L],
      ],
      (rho * A * L) / 420,
    ),
  };
}
export function frameElement(
  E: number,
  rho: number,
  A: number,
  I: number,
  dx: number,
  dy: number,
) {
  finite([dx, dy]);
  const L = Math.hypot(dx, dy),
    axial = barElement(E, rho, A, L),
    bending = beamElement(E, rho, A, I, L),
    K = zeros(6),
    M = zeros(6);
  for (const [source, indices] of [
    [axial, [0, 3]],
    [bending, [1, 2, 4, 5]],
  ] as [{ K: Mat; M: Mat }, number[]][]) {
    indices.forEach((i, a) =>
      indices.forEach((j, b) => {
        K[i][j] += source.K[a][b];
        M[i][j] += source.M[a][b];
      }),
    );
  }
  const c = dx / L,
    s = dy / L,
    T = zeros(6);
  for (const i of [0, 3]) {
    T[i][i] = c;
    T[i][i + 1] = s;
    T[i + 1][i] = -s;
    T[i + 1][i + 1] = c;
    T[i + 2][i + 2] = 1;
  }
  return {
    K: mul(transpose(T), mul(K, T)),
    M: mul(transpose(T), mul(M, T)),
    localK: K,
    localM: M,
    T,
    L,
  };
}
export function assembleFE(model: FEModel) {
  const { kind, nodes, elements, fixed } = model,
    perNode = kind === "bar" ? 1 : kind === "beam" ? 2 : 3;
  check(
    ["bar", "beam", "frame"].includes(kind) &&
      nodes.length >= 2 &&
      elements.length > 0,
    "Invalid FE model.",
  );
  check(
    nodes.every((p) => p.length === 2),
    "Educational FE nodes use [x,y].",
  );
  nodes.forEach((p) => finite(p));
  const n = nodes.length * perNode,
    K = zeros(n),
    M = zeros(n);
  const elementData = elements.map((e) => {
    const [a, b] = e.nodes;
    check(
      Number.isInteger(a) &&
        Number.isInteger(b) &&
        a >= 0 &&
        b >= 0 &&
        a < nodes.length &&
        b < nodes.length &&
        a !== b,
      "Invalid element node.",
    );
    const dx = nodes[b][0] - nodes[a][0],
      dy = nodes[b][1] - nodes[a][1],
      L = Math.hypot(dx, dy);
    if (kind !== "frame")
      check(
        dx > 0 && Math.abs(dy) < 1e-12 * L,
        "Bar/beam model uses increasing horizontal coordinates; use frame for rotated elements.",
      );
    const { E, rho } = e.material,
      { A, I } = e.section;
    const local =
      kind === "bar"
        ? barElement(E, rho, A, L)
        : kind === "beam"
          ? beamElement(E, rho, A, I, L)
          : frameElement(E, rho, A, I, dx, dy);
    const dofs = [a, b].flatMap((i) =>
      Array.from({ length: perNode }, (_, j) => i * perNode + j),
    );
    dofs.forEach((i, p) =>
      dofs.forEach((j, q) => {
        K[i][j] += local.K[p][q];
        M[i][j] += local.M[p][q];
      }),
    );
    return { ...e, dofs, L, K: local.K, M: local.M };
  });
  check(
    fixed.every((i) => Number.isInteger(i) && i >= 0 && i < n) &&
      new Set(fixed).size === fixed.length,
    "Invalid/duplicate constrained DOF.",
  );
  const free = Array.from({ length: n }, (_, i) => i).filter(
    (i) => !fixed.includes(i),
  );
  check(free.length > 0, "All DOFs are constrained.");
  const names =
    kind === "bar"
      ? ["u"]
      : kind === "beam"
        ? ["v", "theta"]
        : ["u", "v", "theta"];
  const labels = nodes.flatMap((_, i) =>
    names.map((name) => "node " + (i + 1) + " " + name),
  );
  const system: System = {
    M: free.map((i) => free.map((j) => M[i][j])),
    K: free.map((i) => free.map((j) => K[i][j])),
    C: zeros(free.length),
    labels: free.map((i) => labels[i]),
    boundary: fixed.length ? "Essential DOF elimination" : "free-free",
  };
  return {
    system,
    M,
    K,
    free,
    fixed: [...fixed],
    labels,
    nodes: nodes.map((p) => [...p]),
    perNode,
    elementData,
    expand(reduced: number[]) {
      vector(reduced, free.length, "Reduced vector");
      const full = Array(n).fill(0);
      free.forEach((d, i) => (full[d] = reduced[i]));
      return full;
    },
  };
}
export function solveFE(model: FEModel) {
  const assembly = assembleFE(model),
    modal = solveModal(assembly.system);
  return {
    ...assembly,
    modal,
    nodalModes: modal.modes.map((m) => assembly.expand(m.phi)),
  };
}
export function uniformFE(
  kind: ElementKind,
  elements = 4,
  boundary:
    "cantilever" | "fixed-fixed" | "pinned" | "free-free" = "cantilever",
  length = 1,
  angle = 0,
): FEModel {
  check(
    Number.isInteger(elements) &&
      elements >= 1 &&
      elements <= 64 &&
      length > 0 &&
      Number.isFinite(length) &&
      Number.isFinite(angle),
    "Invalid educational mesh.",
  );
  check(
    kind === "frame" || angle === 0,
    "Only frame supports arbitrary orientation.",
  );
  const per = kind === "bar" ? 1 : kind === "beam" ? 2 : 3;
  const fixed =
    boundary === "free-free"
      ? []
      : boundary === "pinned"
        ? kind === "bar"
          ? [0, elements]
          : kind === "beam"
            ? [0, per * elements]
            : [0, 1, per * elements + 1]
        : Array.from({ length: per }, (_, i) => i);
  if (boundary === "fixed-fixed")
    fixed.push(...Array.from({ length: per }, (_, i) => elements * per + i));
  return {
    kind,
    nodes: Array.from({ length: elements + 1 }, (_, i) => [
      ((length * i) / elements) * Math.cos(angle),
      ((length * i) / elements) * Math.sin(angle),
    ]),
    elements: Array.from({ length: elements }, (_, i) => ({
      nodes: [i, i + 1],
      material: { E: 2e7, rho: 1000 },
      section: { A: 0.01, I: 1e-5 },
    })),
    fixed,
  };
}
/** Cubic Hermite displacement, normalized element coordinate s in [0,1]. */
export function beamInterpolate(
  v1: number,
  theta1: number,
  v2: number,
  theta2: number,
  L: number,
  s: number,
) {
  finite([v1, theta1, v2, theta2, L, s]);
  check(L > 0 && s >= 0 && s <= 1, "Invalid beam interpolation coordinate.");
  return (
    (1 - 3 * s * s + 2 * s * s * s) * v1 +
    L * (s - 2 * s * s + s * s * s) * theta1 +
    (3 * s * s - 2 * s * s * s) * v2 +
    L * (-s * s + s * s * s) * theta2
  );
}
