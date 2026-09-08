export const CRITICAL_TOLERANCE = 1e-8;
/** SI, linear viscously damped free response. No rendering, clock or platform imports. */
export interface SdofParameters {
  damping?: number;
  mass: number;
  stiffness: number;
  x0: number;
  v0: number;
}
export interface SdofSnapshot {
  time: number;
  x: number;
  v: number;
  a: number;
  force: number;
  kinetic: number;
  potential: number;
  total: number;
  residual: number;
  dampingForce: number;
  power: number;
  dissipated: number;
}
export interface SdofSolution {
  readonly parameters: Readonly<SdofParameters>;
  readonly damping: number;
  readonly zeta: number | null;
  readonly criticalDamping: number;
  readonly dampedOmega: number | null;
  readonly regime: string;
  readonly roots: readonly { real: number; imaginary: number }[];
  readonly horizon: number;
  readonly envelope: number | null;
  readonly omega: number;
  readonly frequency: number;
  readonly period: number | null;
  readonly amplitude: number | null;
  readonly energy: number;
  sample(time: number): SdofSnapshot;
}
export const DEFAULT_SDOF: Readonly<SdofParameters> = Object.freeze({
  mass: 1,
  stiffness: 100,
  x0: 0.1,
  v0: 0,
});
export const SDOF_LIMITS = {
  mass: [0.25, 10],
  stiffness: [0, 500],
  x0: [-0.2, 0.2],
  v0: [-1, 1],
} as const;
export const SDOF_EQUATIONS = [
  String.raw`m\ddot{x}+kx=0`,
  String.raw`\ddot{x}+\frac{k}{m}x=0`,
  String.raw`\ddot{x}+\omega_n^2x=0\quad (\omega_n^2=k/m)`,
  String.raw`\omega_n=\sqrt{\frac{k}{m}}`,
  String.raw`x(t)=x_0\cos(\omega_nt)+\frac{v_0}{\omega_n}\sin(\omega_nt)`,
];
export function createSdof(parameters: SdofParameters): SdofSolution {
  const p = Object.freeze({ ...parameters });
  if (!Object.values(p).every(Number.isFinite))
    throw new RangeError("All physical inputs must be finite.");
  if (p.mass <= 0) throw new RangeError("Mass must be positive.");
  if (p.stiffness < 0) throw new RangeError("Stiffness cannot be negative.");
  const damping = p.damping ?? 0;
  if (damping < 0) throw new RangeError("Damping cannot be negative.");
  const omega = Math.sqrt(p.stiffness / p.mass);
  const frequency = omega / (2 * Math.PI);
  const period = omega > 0 ? (2 * Math.PI) / omega : null;
  const amplitude = omega > 0 ? Math.hypot(p.x0, p.v0 / omega) : null;
  const alpha = damping / p.mass / 2;
  const criticalDamping = 2 * Math.sqrt(p.mass) * Math.sqrt(p.stiffness);
  const zeta = omega ? damping / criticalDamping : null;
  const delta = (alpha - omega) * (alpha + omega);
  const q = Math.sqrt(Math.abs(delta));
  const dampedOmega = omega && alpha < omega ? q : null;
  const regime = !omega
    ? "No restoring stiffness"
    : damping === 0
      ? "Undamped"
      : Math.abs(zeta! - 1) <= CRITICAL_TOLERANCE
        ? "Critical (within tolerance)"
        : zeta! < 1
          ? "Underdamped"
          : "Overdamped";
  // Rationalized slow root avoids subtracting nearly equal positive numbers.
  const slow = delta >= 0 ? -(omega / (alpha + q || 1)) * omega : -alpha;
  const fast = -alpha - q;
  const roots = Object.freeze(
    delta < 0
      ? [
          Object.freeze({ real: -alpha, imaginary: q }),
          Object.freeze({ real: -alpha, imaginary: -q }),
        ]
      : [
          Object.freeze({ real: slow, imaginary: 0 }),
          Object.freeze({ real: fast, imaginary: 0 }),
        ],
  );
  const horizon = Math.min(8, omega ? 32 / omega : 8);
  const envelope = dampedOmega
    ? Math.hypot(p.x0, (p.v0 + alpha * p.x0) / dampedOmega)
    : null;
  const energy =
    0.5 * (Math.sqrt(p.mass) * p.v0) ** 2 +
    0.5 * (Math.sqrt(p.stiffness) * p.x0) ** 2;
  if (
    ![
      omega,
      frequency,
      energy,
      period ?? 0,
      amplitude ?? 0,
      damping,
      alpha,
      criticalDamping,
      zeta ?? 0,
      delta,
      envelope ?? 0,
    ].every(Number.isFinite) ||
    (p.stiffness > 0 && omega === 0)
  )
    throw new RangeError("Parameters exceed the supported numerical range.");
  return Object.freeze({
    parameters: p,
    damping,
    zeta,
    criticalDamping,
    dampedOmega,
    regime,
    roots,
    horizon,
    envelope,
    omega,
    frequency,
    period,
    amplitude,
    energy,
    sample(time: number): SdofSnapshot {
      if (!Number.isFinite(time) || time < 0)
        throw new RangeError("Time must be finite and nonnegative.");
      // Reduce phase before trig evaluation; time is still returned unwrapped.
      const phase = period ? (time % period) * omega : 0;
      let x = omega
        ? p.x0 * Math.cos(phase) + (p.v0 / omega) * Math.sin(phase)
        : p.x0 + p.v0 * time;
      let v = omega
        ? -p.x0 * omega * Math.sin(phase) + p.v0 * Math.cos(phase)
        : p.v0;
      if (damping > 0) {
        if (!omega) {
          const beta = damping / p.mass;
          const decay = Math.exp(-beta * time);
          x = p.x0 + p.v0 * (-Math.expm1(-beta * time) / beta);
          v = p.v0 * decay;
        } else {
          // Stable fundamental functions, exact on both sides of critical damping.
          // No large cancelling modal coefficients and no division by tiny q.
          let C: number, S: number;
          if (delta < 0) {
            const decay = Math.exp(-alpha * time),
              u = q * time;
            C = decay * Math.cos(u);
            S =
              decay *
              (Math.abs(u) < 1e-4
                ? time * (1 - (u * u) / 6 + u ** 4 / 120)
                : Math.sin(u) / q);
          } else if (q === 0) {
            C = Math.exp(-alpha * time);
            S = C === 0 ? 0 : C * time;
          } else {
            const eSlow = Math.exp(slow * time),
              eFast = Math.exp(fast * time);
            C = (eSlow + eFast) / 2;
            S = eSlow * (-Math.expm1(-2 * q * time) / (2 * q));
          }
          x = p.x0 * C + (p.v0 + alpha * p.x0) * S;
          v = p.v0 * C - (alpha * p.v0 + omega * omega * p.x0) * S;
        }
      }
      const force = -p.stiffness * x;
      const dampingForce = -damping * v;
      const a = (force + dampingForce) / p.mass;
      const power = damping * v * v;
      const kinetic = 0.5 * (Math.sqrt(p.mass) * v) ** 2;
      const potential = 0.5 * (Math.sqrt(p.stiffness) * x) ** 2;
      const total = kinetic + potential;
      if (
        ![x, v, a, force, dampingForce, power, kinetic, potential, total].every(
          Number.isFinite,
        )
      )
        throw new RangeError("Response exceeds the supported numerical range.");
      return {
        time,
        x,
        v,
        a,
        force,
        kinetic,
        potential,
        total,
        dampingForce,
        power,
        dissipated: energy - total,
        residual: p.mass * a + damping * v + p.stiffness * x,
      };
    },
  });
}
/** Bounded sampling; reject domains that cannot be resolved at >=64 intervals/cycle. */
export function sampleSdof(
  solution: SdofSolution,
  start: number,
  end: number,
  width: number,
): SdofSnapshot[] {
  if (
    ![start, end, width].every(Number.isFinite) ||
    start < 0 ||
    end <= start ||
    width <= 0
  )
    throw new RangeError("Invalid sampling domain.");
  const required = Math.ceil((end - start) * solution.frequency * 64);
  if (required > 4096)
    throw new RangeError(
      "Shorten the plot domain to resolve the oscillations.",
    );
  const intervals = Math.min(
    4096,
    Math.max(64, required, Math.ceil(Math.min(width, 2048))),
  );
  if (solution.damping > 0) {
    const count = Math.min(intervals, 3968);
    const times = Array.from({length:count+1},(_,i)=>i===count?end:start+(end-start)*i/count);
    const rate = Math.max(...solution.roots.map(r=>Math.abs(r.real)));
    const earlyEnd = Math.min(end,start+8/(rate || 1));
    for(let i=1;i<128;i++) times.push(start+(earlyEnd-start)*i/128);
    return [...new Set(times)].sort((a,b)=>a-b).map(t=>solution.sample(t));
  }
  return Array.from({ length: intervals + 1 }, (_, i) =>
    solution.sample(
      i === intervals ? end : start + ((end - start) * i) / intervals,
    ),
  );
}
