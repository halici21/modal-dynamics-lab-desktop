import {
  add,
  check,
  finite,
  scale,
  symmetric,
  zeros,
  type Mat,
} from "./common";
export type Boundary = "fixed-fixed" | "fixed-free" | "free-free";
export interface Link {
  i: number;
  j: number | null;
  k: number;
  c?: number;
  label?: string;
}
export interface System {
  M: Mat;
  C: Mat;
  K: Mat;
  labels: string[];
  links?: Link[];
  boundary?: string;
}
export function assemble(masses: number[], links: Link[]): System {
  const n = masses.length;
  check(n > 0, "At least one mass is required.");
  finite(masses);
  check(
    masses.every((m) => m > 0),
    "Masses must be positive.",
  );
  const M = zeros(n),
    K = zeros(n),
    C = zeros(n);
  masses.forEach((m, i) => (M[i][i] = m));
  for (const { i, j, k, c = 0 } of links) {
    check(
      Number.isInteger(i) &&
        i >= 0 &&
        i < n &&
        (j === null || (Number.isInteger(j) && j >= 0 && j < n && i !== j)),
      "Invalid link DOF.",
    );
    finite([k, c]);
    check(
      k >= 0 && c >= 0,
      "Spring and damper coefficients must be nonnegative.",
    );
    for (const [a, v] of [
      [K, k],
      [C, c],
    ] as [Mat, number][]) {
      a[i][i] += v;
      if (j !== null) {
        a[j][j] += v;
        a[i][j] -= v;
        a[j][i] -= v;
      }
    }
  }
  [M, C, K].forEach((a) => a.forEach((r) => finite(r, "Assembled matrix")));
  return {
    M,
    C,
    K,
    labels: masses.map((_, i) => "x" + (i + 1)),
    links: links.map((l) => ({ ...l })),
  };
}
/** N+1 coefficient slots include both supports. */
export function chain(
  masses: number[],
  springs: number[],
  boundary: Boundary = "fixed-fixed",
  dampers = springs.map(() => 0),
): System {
  const n = masses.length;
  check(
    springs.length === n + 1 && dampers.length === n + 1,
    "A chain needs N+1 spring/damper slots.",
  );
  finite(springs);
  finite(dampers);
  check(
    [...springs, ...dampers].every((v) => v >= 0),
    "Passive coefficients must be nonnegative.",
  );
  check(
    ["fixed-fixed", "fixed-free", "free-free"].includes(boundary),
    "Unknown boundary.",
  );
  const links: Link[] = Array.from({ length: n - 1 }, (_, i) => ({
    i,
    j: i + 1,
    k: springs[i + 1],
    c: dampers[i + 1],
    label: "k" + (i + 2),
  }));
  if (boundary !== "free-free")
    links.unshift({ i: 0, j: null, k: springs[0], c: dampers[0], label: "k1" });
  if (boundary === "fixed-fixed")
    links.push({
      i: n - 1,
      j: null,
      k: springs[n],
      c: dampers[n],
      label: "k" + (n + 1),
    });
  return { ...assemble(masses, links), boundary };
}
export function rayleigh(M: Mat, K: Mat, alpha: number, beta: number) {
  finite([alpha, beta]);
  check(alpha >= 0 && beta >= 0, "Rayleigh coefficients must be nonnegative.");
  symmetric(M, "M");
  symmetric(K, "K", M.length);
  return add(scale(M, alpha), scale(K, beta));
}
export function fitRayleigh(wa: number, za: number, wb: number, zb: number) {
  finite([wa, za, wb, zb]);
  check(
    wa > 0 &&
      wb > 0 &&
      za >= 0 &&
      zb >= 0 &&
      Math.abs(wa - wb) > 1e-8 * Math.max(wa, wb),
    "Fit requires distinct positive frequencies and nonnegative ratios.",
  );
  const beta = (2 * (zb * wb - za * wa)) / ((wb - wa) * (wb + wa)),
    alpha = 2 * za * wa - beta * wa * wa;
  check(
    alpha >= 0 && beta >= 0,
    "Targets require negative Rayleigh coefficients; passive fit rejected.",
  );
  finite([alpha, beta]);
  return { alpha, beta };
}
