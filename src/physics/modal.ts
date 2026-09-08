import {
  backward,
  check,
  dot,
  factorSPD,
  finite,
  forward,
  maxAbs,
  mul,
  mv,
  norm,
  passive,
  symmetric,
  symmetricEigen,
  TOL,
  transpose,
  vector,
  type Mat,
} from "./common";
import { createSdof } from "./sdof";
import type { System } from "./systems";
export interface Mode {
  lambda: number;
  omega: number;
  frequency: number;
  phi: number[];
  kind: "zero" | "elastic";
  residual: number;
}
export interface Modal {
  system: System;
  modes: Mode[];
  massGram: Mat;
  stiffnessGram: Mat;
  dampingGram: Mat;
  classical: boolean;
  zeroTolerance: number;
  massError: number;
  stiffnessError: number;
  clusters: number[][];
}
export function normalize(
  phi: number[],
  M: Mat,
  kind: "mass" | "max" = "mass",
  sign = 1,
) {
  vector(phi, M.length, "Mode");
  const divisor =
    kind === "mass"
      ? Math.sqrt(dot(phi, mv(M, phi)))
      : Math.max(...phi.map(Math.abs));
  check(
    divisor > 0 && Number.isFinite(divisor) && (sign === 1 || sign === -1),
    "Invalid mode normalization.",
  );
  return phi.map((x) => (sign * x) / divisor);
}
export function gram(modes: number[][], a: Mat) {
  return modes.map((x) => modes.map((y) => dot(x, mv(a, y))));
}
export function solveModal(input: System): Modal {
  check(
    input &&
      Array.isArray(input.M) &&
      Array.isArray(input.K) &&
      Array.isArray(input.C) &&
      Array.isArray(input.labels),
    "System requires M, C, K matrices and DOF labels.",
  );
  check(
    input.labels.every((l) => typeof l === "string"),
    "DOF labels must be strings.",
  );
  const n = input.M.length,
    M = symmetric(input.M, "M"),
    K = symmetric(input.K, "K", n),
    C = symmetric(input.C, "C", n);
  check(input.labels.length === n, "Every DOF needs a label.");
  passive(C, "C");
  const { L } = factorSPD(M);
  // Two triangular solves form the congruence, never M^-1 K.
  const left = transpose(transpose(K).map((col) => forward(L, col)));
  const a0 = left.map((row) => forward(L, row));
  const A = a0.map((r, i) => r.map((x, j) => x / 2 + a0[j][i] / 2));
  A.forEach((r) => finite(r, "Transformed stiffness"));
  const eigen = symmetricEigen(A),
    threshold = TOL.zero * n * maxAbs(A);
  check(
    Math.min(...eigen.values) >= -threshold,
    "Negative stiffness eigenvalue: unstable or invalid structural system.",
  );
  const modes: Mode[] = eigen.values
    .map((raw, i) => {
      const lambda = Math.abs(raw) <= threshold ? 0 : raw;
      let phi = normalize(
        backward(
          L,
          eigen.vectors.map((r) => r[i]),
        ),
        M,
      );
      const pivot = phi.reduce(
        (best, x, j) => (Math.abs(x) > Math.abs(phi[best]) ? j : best),
        0,
      );
      if (phi[pivot] < 0) phi = phi.map((x) => -x);
      const kp = mv(K, phi),
        mp = mv(M, phi);
      const r = kp.map((x, j) => x - lambda * mp[j]);
      // Normwise backward error remains meaningful at lambda=0.
      const denominator =
        (n * maxAbs(K) + Math.abs(lambda) * n * maxAbs(M)) * norm(phi);
      const residual = denominator ? norm(r) / denominator : norm(r);
      check(
        residual <= TOL.residual,
        "Eigen residual exceeds tolerance; rescale the system.",
      );
      return {
        lambda,
        omega: Math.sqrt(lambda),
        frequency: Math.sqrt(lambda) / (2 * Math.PI),
        phi,
        kind: lambda ? ("elastic" as const) : ("zero" as const),
        residual,
      };
    })
    .sort((a, b) => a.lambda - b.lambda);
  const vectors = modes.map((m) => m.phi),
    massGram = gram(vectors, M),
    stiffnessGram = gram(vectors, K),
    dampingGram = gram(vectors, C);
  const massError = maxAbs(
    massGram.map((r, i) => r.map((x, j) => x - +(i === j))),
  );
  const stiffnessError = maxAbs(
    stiffnessGram.map((r, i) =>
      r.map((x, j) => x - (i === j ? modes[i].lambda : 0)),
    ),
  );
  check(massError < TOL.orthogonality, "Mass orthogonality failed.");
  const off = maxAbs(
    dampingGram.map((r, i) => r.map((x, j) => (i === j ? 0 : x))),
  );
  const classical = off <= TOL.orthogonality * maxAbs(dampingGram);
  const clusters: number[][] = [];
  for (let i = 0; i < n; i++) {
    const group = clusters.at(-1);
    if (
      group &&
      Math.abs(modes[i].lambda - modes[group[0]].lambda) <=
        Math.max(
          threshold,
          TOL.degeneracy * Math.max(modes[i].lambda, modes[group[0]].lambda),
        )
    )
      group.push(i);
    else clusters.push([i]);
  }
  const system = {
    ...input,
    M,
    K,
    C,
    labels: [...input.labels],
    links: input.links?.map((l) => ({ ...l })),
  };
  return {
    system,
    modes,
    massGram,
    stiffnessGram,
    dampingGram,
    classical,
    zeroTolerance: threshold,
    massError,
    stiffnessError,
    clusters,
  };
}
export function mac(a: number[], b: number[], M: Mat) {
  vector(a, M.length, "Mode a");
  vector(b, M.length, "Mode b");
  const aa = dot(a, mv(M, a)),
    bb = dot(b, mv(M, b));
  check(aa > 0 && bb > 0, "MAC requires nonzero modes.");
  const v = dot(a, mv(M, b)) / Math.sqrt(aa) / Math.sqrt(bb);
  return Math.min(1, v * v);
}
/** Global assignment for interactive N<=10. Frequency proximity only breaks weak MAC ties. */
export function trackModes(previous: Modal, next: Modal) {
  const n = next.modes.length;
  check(
    n === previous.modes.length && n <= 10,
    "Tracking requires matching DOF count, at most 10.",
  );
  const similarities = previous.modes.map((a) =>
    next.modes.map((b) => mac(a.phi, b.phi, next.system.M)),
  );
  const scores = similarities.map((r, i) =>
    r.map(
      (v, j) =>
        v -
        (0.01 * Math.abs(previous.modes[i].omega - next.modes[j].omega)) /
          Math.max(1e-30, previous.modes[i].omega, next.modes[j].omega),
    ),
  );
  const memo = new Map<number, { score: number; order: number[] }>();
  function assign(mask: number): { score: number; order: number[] } {
    if (mask === (1 << n) - 1) return { score: 0, order: [] };
    if (memo.has(mask)) return memo.get(mask)!;
    let i = 0;
    for (let m = mask; m; m &= m - 1) i++;
    let best = { score: -Infinity, order: [] as number[] };
    for (let j = 0; j < n; j++)
      if (!(mask & (1 << j))) {
        const tail = assign(mask | (1 << j));
        const score = scores[i][j] + tail.score;
        if (score > best.score) best = { score, order: [j, ...tail.order] };
      }
    memo.set(mask, best);
    return best;
  }
  const order = assign(0).order;
  return order.map((j, i) => ({
    previous: i,
    next: j,
    mac: similarities[i][j],
    sign:
      dot(previous.modes[i].phi, mv(next.system.M, next.modes[j].phi)) < 0
        ? -1
        : 1,
    ambiguous:
      previous.clusters.some((g) => g.length > 1 && g.includes(i)) ||
      next.clusters.some((g) => g.length > 1 && g.includes(j)) ||
      similarities[i][j] < 0.5 ||
      similarities[i].some(
        (v, k) => k !== j && Math.abs(v - similarities[i][j]) < 0.05,
      ),
  }));
}
export function project(modes: number[][], M: Mat, x: number[]) {
  vector(x, M.length, "Physical coordinates");
  return factorSPD(gram(modes, M)).solve(modes.map((p) => dot(p, mv(M, x))));
}
export function reconstruct(modes: number[][], q: number[]) {
  vector(q, modes.length, "Modal coordinates");
  return mv(transpose(modes), q);
}
export function participation(modes: number[][], M: Mat, r: number[]) {
  vector(r, M.length, "Influence vector");
  const Mr = mv(M, r),
    total = dot(r, Mr);
  check(total > 0, "Influence vector must have positive participating mass.");
  let cumulative = 0;
  return {
    total,
    modes: modes.map((phi) => {
      const mass = dot(phi, mv(M, phi)),
        L = dot(phi, Mr);
      check(mass > 0, "Mode must have positive mass.");
      const effectiveMass = (L * L) / mass,
        ratio = effectiveMass / total;
      cumulative += ratio;
      return { gamma: L / mass, effectiveMass, ratio, cumulative };
    }),
  };
}
export function modalResponse(
  modal: Modal,
  x0: number[],
  v0: number[],
  active = modal.modes.map(() => true),
) {
  check(
    modal.classical,
    "Coupled modal damping: use direct frequency response or Newmark.",
  );
  const modes = modal.modes.map((m) => m.phi),
    q0 = project(modes, modal.system.M, x0),
    qd0 = project(modes, modal.system.M, v0);
  check(active.length === modes.length, "Wrong modal mask dimension.");
  const oscillators = modal.modes.map((m, i) =>
    createSdof({
      mass: 1,
      stiffness: m.lambda,
      damping: Math.max(0, modal.dampingGram[i][i]),
      x0: active[i] ? q0[i] : 0,
      v0: active[i] ? qd0[i] : 0,
    }),
  );
  return {
    q0,
    qd0,
    sample(time: number) {
      const s = oscillators.map((o) => o.sample(time)),
        q = s.map((p) => p.x),
        qd = s.map((p) => p.v),
        qdd = s.map((p) => p.a);
      const x = reconstruct(modes, q),
        v = reconstruct(modes, qd),
        a = reconstruct(modes, qdd),
        elastic = mv(modal.system.K, x),
        damping = mv(modal.system.C, v);
      const residual = mv(modal.system.M, a).map(
        (f, i) => f + elastic[i] + damping[i],
      );
      const kinetic = dot(v, mv(modal.system.M, v)) / 2,
        potential = dot(x, elastic) / 2,
        power = dot(v, damping);
      finite([...x, ...v, ...a, kinetic, potential, power]);
      return {
        time,
        x,
        v,
        a,
        q,
        qd,
        qdd,
        kinetic,
        potential,
        energy: kinetic + potential,
        power,
        residual,
        contributions: modes.map((p, i) => p.map((x) => x * q[i])),
      };
    },
  };
}

/** Mean squared principal cosine; invariant to basis rotation within an eigenspace. */
export function subspaceOverlap(a: number[][], b: number[][], M: Mat) {
  check(
    a.length === b.length && a.length > 0,
    "Subspace dimensions must match.",
  );
  const orth = (basis: number[][]) => {
    basis.forEach((v) => vector(v, M.length, "Subspace vector"));
    const { L } = factorSPD(gram(basis, M));
    return transpose(transpose(basis).map((row) => forward(L, row)));
  };
  const p = orth(a),
    q = orth(b);
  return Math.min(
    1,
    p.reduce(
      (sum, u) => sum + q.reduce((s, v) => s + dot(u, mv(M, v)) ** 2, 0),
      0,
    ) / a.length,
  );
}
