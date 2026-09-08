import {
  check,
  finite,
  maxAbs,
  mv,
  passive,
  symmetric,
  TOL,
  vector,
  type Mat,
} from "./common";
import type { Modal } from "./modal";
import type { System } from "./systems";
export interface Complex {
  re: number;
  im: number;
}
export const cx = (re: number, im = 0): Complex => ({ re, im });
export const cadd = (a: Complex, b: Complex) => cx(a.re + b.re, a.im + b.im);
export const csub = (a: Complex, b: Complex) => cx(a.re - b.re, a.im - b.im);
export const cmul = (a: Complex, b: Complex) =>
  cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const cscale = (a: Complex, s: number) => cx(a.re * s, a.im * s);
export const magnitude = (a: Complex) => Math.hypot(a.re, a.im);
export const phase = (a: Complex) => Math.atan2(a.im, a.re);
export function cdiv(a: Complex, b: Complex) {
  const s = Math.max(Math.abs(b.re), Math.abs(b.im));
  check(
    s > 0 && Number.isFinite(s),
    "Singular response: no bounded steady state at this frequency.",
  );
  const r = b.re / s,
    i = b.im / s,
    d = r * r + i * i;
  const z = cx(
    ((a.re / s) * r + (a.im / s) * i) / d,
    ((a.im / s) * r - (a.re / s) * i) / d,
  );
  finite([z.re, z.im], "Complex response");
  return z;
}
export function complexSolve(input: Complex[][], rhs: Complex[]) {
  const n = input.length;
  check(
    n > 0 && rhs.length === n && input.every((r) => r.length === n),
    "Complex system dimensions do not match.",
  );
  input
    .flat()
    .concat(rhs)
    .forEach((z) => finite([z.re, z.im]));
  const a = input.map((r) => r.map((z) => ({ ...z }))),
    b = rhs.map((z) => ({ ...z }));
  const size = Math.max(...a.flat().map(magnitude));
  check(size > 0, "Singular dynamic stiffness.");
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++)
      if (magnitude(a[i][k]) > magnitude(a[p][k])) p = i;
    check(
      magnitude(a[p][k]) > TOL.spd * size,
      "Singular or ill-conditioned dynamic stiffness: unbounded resonance or free static motion.",
    );
    [a[k], a[p]] = [a[p], a[k]];
    [b[k], b[p]] = [b[p], b[k]];
    for (let i = k + 1; i < n; i++) {
      const f = cdiv(a[i][k], a[k][k]);
      for (let j = k + 1; j < n; j++) a[i][j] = csub(a[i][j], cmul(f, a[k][j]));
      b[i] = csub(b[i], cmul(f, b[k]));
    }
  }
  const x = b.map(() => cx(0));
  for (let i = n - 1; i >= 0; i--) {
    let v = b[i];
    for (let j = i + 1; j < n; j++) v = csub(v, cmul(a[i][j], x[j]));
    x[i] = cdiv(v, a[i][i]);
  }
  return x;
}
export function dynamicStiffness(system: System, omega: number) {
  check(
    Number.isFinite(omega) && omega >= 0,
    "Excitation omega must be nonnegative rad/s.",
  );
  const n = system.M.length;
  const M = symmetric(system.M, "M"),
    K = symmetric(system.K, "K", n),
    C = symmetric(system.C, "C", n);
  return K.map((r, i) =>
    r.map((v, j) => cx(v - omega * omega * M[i][j], omega * C[i][j])),
  );
}
export const harmonicResponse = (
  system: System,
  omega: number,
  force: Complex[],
) => complexSolve(dynamicStiffness(system, omega), force);
export function directFRF(system: System, omega: number) {
  const Z = dynamicStiffness(system, omega),
    n = Z.length;
  const columns = Array.from({ length: n }, (_, j) =>
    complexSolve(
      Z,
      Array.from({ length: n }, (_, i) => cx(+(i === j))),
    ),
  );
  return Array.from({ length: n }, (_, i) => columns.map((c) => c[i]));
}
export function modalFRF(
  modal: Modal,
  omega: number,
  count = modal.modes.length,
) {
  check(
    modal.classical,
    "Modal FRF requires classical damping. Use direct FRF for coupled damping.",
  );
  check(
    Number.isInteger(count) &&
      count > 0 &&
      count <= modal.modes.length &&
      Number.isFinite(omega) &&
      omega >= 0,
    "Invalid modal count or frequency.",
  );
  const n = modal.system.M.length,
    h = Array.from({ length: n }, () => Array.from({ length: n }, () => cx(0)));
  for (let k = 0; k < count; k++) {
    const m = modal.modes[k];
    const denominator=cx(m.lambda-omega*omega,modal.dampingGram[k][k]*omega);
    check(magnitude(denominator)>TOL.spd*Math.max(m.lambda,omega*omega),"Singular modal response: no bounded steady state.");
    const inv = cdiv(cx(1),denominator);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        h[i][j] = cadd(h[i][j], cscale(inv, m.phi[i] * m.phi[j]));
  }
  return h;
}
export function transfer(
  h: Complex,
  omega: number,
  kind: "receptance" | "mobility" | "accelerance",
) {
  return kind === "mobility"
    ? cmul(cx(0, omega), h)
    : kind === "accelerance"
      ? cscale(h, -omega * omega)
      : h;
}
/** Uniform base displacement phasor; returned x/z use absolute/relative coordinates. */
export function baseResponse(
  system: System,
  omega: number,
  base: Complex,
  influence = system.M.map(() => 1),
) {
  vector(influence, system.M.length, "Influence");
  const mr = mv(system.M, influence);
  const relative = harmonicResponse(
    system,
    omega,
    mr.map((v) => cscale(base, omega * omega * v)),
  );
  return {
    base,
    relative,
    absolute: relative.map((z, i) => cadd(z, cscale(base, influence[i]))),
    acceleration: relative.map((z, i) =>
      cscale(cadd(z, cscale(base, influence[i])), -omega * omega),
    ),
  };
}
export function baseAccelerationResponse(
  system: System,
  omega: number,
  acceleration: Complex,
  influence = system.M.map(() => 1),
) {
  vector(influence, system.M.length, "Influence");
  return harmonicResponse(
    system,
    omega,
    mv(system.M, influence).map((v) => cscale(acceleration, -v)),
  );
}
export function sdofFRF(m: number, c: number, k: number, omega: number) {
  finite([m, c, k, omega]);
  check(
    m > 0 && c >= 0 && k >= 0 && omega >= 0,
    "Invalid SDOF frequency parameters.",
  );
  const h = cdiv(cx(1), cx(k - m * omega * omega, c * omega));
  const wn = Math.sqrt(k / m),
    zeta = k ? c / (2 * Math.sqrt(k * m)) : null;
  return {
    h,
    magnitude: magnitude(h),
    phase: phase(h),
    lag: Math.atan2(c * omega, k - m * omega * omega),
    magnification: k ? magnitude(h) * k : null,
    naturalOmega: wn,
    excitationOmega: omega,
    resonanceOmega:
      zeta !== null && zeta < 1 / Math.sqrt(2)
        ? wn * Math.sqrt(1 - 2 * zeta * zeta)
        : null,
  };
}

/** Scalar output/input transfer for interactive sweeps; O(N) for a complete classical basis. */
export function modalFRFEntry(
  modal: Modal,
  omega: number,
  output: number,
  input: number,
) {
  check(
    modal.classical && Number.isFinite(omega) && omega >= 0,
    "Scalar modal FRF requires classical damping and nonnegative rad/s.",
  );
  check(
    Number.isInteger(output) &&
      Number.isInteger(input) &&
      output >= 0 &&
      input >= 0 &&
      output < modal.modes.length &&
      input < modal.modes.length,
    "Invalid FRF DOF.",
  );
  let h = cx(0);
  for (let i = 0; i < modal.modes.length; i++) {
    const m = modal.modes[i],
      den = cx(m.lambda - omega * omega, modal.dampingGram[i][i] * omega);
    check(
      magnitude(den) > TOL.spd * Math.max(m.lambda, omega * omega),
      "Singular modal response: no bounded steady state.",
    );
    h = cadd(h, cscale(cdiv(cx(1), den), m.phi[output] * m.phi[input]));
  }
  return h;
}
