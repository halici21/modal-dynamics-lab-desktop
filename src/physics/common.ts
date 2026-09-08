import { EigenvalueDecomposition, Matrix } from "ml-matrix";
export type Mat = number[][];
export const TOL = Object.freeze({
  symmetry: 1e-12,
  spd: 1e-13,
  zero: 2e-13,
  residual: 2e-9,
  orthogonality: 2e-9,
  mac: 1e-8,
  degeneracy: 1e-7,
  frf: 2e-8,
  integration: 2e-4,
  fe: 0.005,
});
export function check(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
export function finite(values: number[], name = "Values") {
  check(values.every(Number.isFinite), name + " must be finite.");
}
export const zeros = (n: number, m = n): Mat =>
  Array.from({ length: n }, () => Array(m).fill(0));
export const eye = (n: number): Mat =>
  zeros(n).map((r, i) => r.map((_, j) => +(i === j)));
export const dot = (a: number[], b: number[]) =>
  a.reduce((s, x, i) => s + x * b[i], 0);
export const mv = (a: Mat, x: number[]) => a.map((r) => dot(r, x));
export const transpose = (a: Mat) => a[0].map((_, j) => a.map((r) => r[j]));
export const mul = (a: Mat, b: Mat) => {
  const bt = transpose(b);
  return a.map((r) => bt.map((c) => dot(r, c)));
};
export const scale = (a: Mat, s: number) => a.map((r) => r.map((x) => x * s));
export const add = (a: Mat, b: Mat) =>
  a.map((r, i) => r.map((x, j) => x + b[i][j]));
export const maxAbs = (a: Mat) =>
  Math.max(0, ...a.map((r) => Math.max(...r.map(Math.abs))));
export const norm = (a: number[]) => Math.hypot(...a);
export function vector(x: number[], n: number, name: string) {
  check(x.length === n, name + ": wrong dimension.");
  finite(x, name);
}
export function symmetric(a: Mat, name: string, n = a.length): Mat {
  check(
    n > 0 && a.length === n && a.every((r) => r.length === n),
    name + " must be a nonempty square matrix of matching dimension.",
  );
  a.forEach((r) => finite(r, name));
  const s = maxAbs(a);
  check(
    a.every((r, i) =>
      r.every((x, j) => Math.abs(x - a[j][i]) <= TOL.symmetry * s),
    ),
    name + " must be symmetric.",
  );
  return a.map((r, i) => r.map((x, j) => x / 2 + a[j][i] / 2));
}
/** Diagonal equilibration handles mixed translation/rotation units. */
export function factorSPD(input: Mat) {
  const a = symmetric(input, "Mass/effective matrix"),
    n = a.length;
  check(
    a.every((r, i) => r[i] > 0),
    "Matrix must be positive definite.",
  );
  const d = a.map((r, i) => Math.sqrt(r[i]));
  const l = zeros(n);
  for (let i = 0; i < n; i++)
    for (let j = 0; j <= i; j++) {
      let v = a[i][j] / d[i] / d[j];
      for (let k = 0; k < j; k++) v -= l[i][k] * l[j][k];
      if (i === j) {
        check(
          v > TOL.spd,
          "Matrix is not positive definite or is numerically ill-conditioned.",
        );
        l[i][j] = Math.sqrt(v);
      } else l[i][j] = v / l[j][j];
    }
  const L = l.map((r, i) => r.map((x) => x * d[i]));
  return {
    L,
    solve: (b: number[]) => {
      vector(b, n, "Right hand side");
      return backward(L, forward(L, b));
    },
  };
}
export function forward(l: Mat, b: number[]) {
  const x = b.slice();
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < i; j++) x[i] -= l[i][j] * x[j];
    x[i] /= l[i][i];
  }
  finite(x, "Triangular solution");
  return x;
}
export function backward(l: Mat, b: number[]) {
  const x = b.slice();
  for (let i = x.length - 1; i >= 0; i--) {
    for (let j = i + 1; j < x.length; j++) x[i] -= l[j][i] * x[j];
    x[i] /= l[i][i];
  }
  finite(x, "Triangular solution");
  return x;
}
export function symmetricEigen(a: Mat) {
  const s = maxAbs(a);
  if (!s)
    return {
      values: Array(a.length).fill(0) as number[],
      vectors: eye(a.length),
    };
  const e = new EigenvalueDecomposition(
    new Matrix(a.map((r) => r.map((x) => x / s))),
    { assumeSymmetric: true },
  );
  const values = e.realEigenvalues.map((x) => x * s);
  finite(values, "Eigenvalues");
  return { values, vectors: e.eigenvectorMatrix.to2DArray() };
}
export function passive(a: Mat, name: string) {
  const b = symmetric(a, name);
  const e = symmetricEigen(b);
  check(
    Math.min(...e.values) >= -TOL.zero * a.length * maxAbs(a),
    name + " must be positive semidefinite (passive).",
  );
  return b;
}
export const hzToOmega = (f: number) => {
  check(
    Number.isFinite(f) && f >= 0,
    "Frequency must be finite and nonnegative.",
  );
  return 2 * Math.PI * f;
};
