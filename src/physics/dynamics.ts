import { project, reconstruct } from "./modal";
import {
  add,
  check,
  dot,
  factorSPD,
  finite,
  mv,
  passive,
  scale,
  symmetric,
  vector,
} from "./common";
import { createSdof, type SdofParameters } from "./sdof";
import { cscale, cx, cmul, sdofFRF } from "./frequency";
import type { System } from "./systems";
export function forcedSdof(
  p: SdofParameters,
  force:
    | { kind: "constant"; value: number }
    | { kind: "harmonic"; amplitude: number; omega: number; phase?: number },
) {
  const free = createSdof(p),
    m = p.mass,
    c = p.damping ?? 0,
    k = p.stiffness;
  const F = force.kind === "constant" ? force.value : force.amplitude,
    w = force.kind === "constant" ? 0 : force.omega,
    phase = force.kind === "constant" ? 0 : (force.phase ?? 0);
  finite([F, w, phase]);
  check(w >= 0, "Excitation frequency must be nonnegative.");
  const forceAt = (t: number) => F * Math.cos(w * t + phase);
  // Constant-force free translation: avoid cancellation of terminal-velocity terms as c -> 0.
  if (k === 0 && w === 0) {
    const f = forceAt(0),
      decay = c / m;
    return {
      boundedSteadyState: false,
      naturalOmega: 0,
      sample(t: number) {
        const tr = free.sample(t),
          u = decay * t;
        const s1 =
          Math.abs(u) < 1e-4
            ? 1 - u / 2 + (u * u) / 6 - (u * u * u) / 24 + u ** 4 / 120
            : -Math.expm1(-u) / u;
        const s2 =
          Math.abs(u) < 1e-4
            ? 0.5 - u / 6 + (u * u) / 24 - (u * u * u) / 120 + u ** 4 / 720
            : (u + Math.expm1(-u)) / (u * u);
        const px = (f / m) * t * t * s2,
          pv = (f / m) * t * s1,
          x = tr.x + px,
          v = tr.v + pv,
          a = (f - c * v) / m;
        const particular = { x: px, v: pv, a: f / m - (c * pv) / m },
          energy = (m * v * v) / 2;
        finite([x, v, a, energy]);
        return {
          time: t,
          x,
          v,
          a,
          force: f,
          energy,
          power: c * v * v,
          residual: m * a + c * v - f,
          transient: { x: tr.x, v: tr.v, a: tr.a },
          steady: null,
          particular,
        };
      },
    };
  }
  let particular: (t: number) => { x: number; v: number; a: number },
    bounded = true;
  if (w === 0) {
    const f = forceAt(0);
    if (k) particular = () => ({ x: f / k, v: 0, a: 0 });
    else {
      bounded = false;
      particular = c
        ? (t) => ({ x: (f / c) * t, v: f / c, a: 0 })
        : (t) => ({ x: ((f / m) * t * t) / 2, v: (f / m) * t, a: f / m });
    }
  } else if (
    c === 0 &&
    Math.abs(k - m * w * w) <= Number.EPSILON * Math.max(k, m * w * w) * 4
  ) {
    bounded = false;
    const B = F / (2 * m * w);
    particular = (t) => {
      const s = Math.sin(w * t + phase),
        co = Math.cos(w * t + phase);
      return {
        x: B * t * s,
        v: B * (s + w * t * co),
        a: B * (2 * w * co - w * w * t * s),
      };
    };
  } else {
    const X = cmul(
      sdofFRF(m, c, k, w).h,
      cx(F * Math.cos(phase), F * Math.sin(phase)),
    );
    particular = (t) => {
      const x = X.re * Math.cos(w * t) - X.im * Math.sin(w * t),
        v = -w * (X.re * Math.sin(w * t) + X.im * Math.cos(w * t));
      return { x, v, a: -w * w * x };
    };
  }
  const p0 = particular(0),
    transient = createSdof({ ...p, x0: p.x0 - p0.x, v0: p.v0 - p0.v });
  return {
    boundedSteadyState: bounded,
    naturalOmega: free.omega,
    sample(t: number) {
      const tr = transient.sample(t),
        ss = particular(t),
        x = tr.x + ss.x,
        v = tr.v + ss.v,
        f = forceAt(t),
        a = (f - c * v - k * x) / m;
      const energy = (m * v * v + k * x * x) / 2;
      finite([x, v, a, energy, f]);
      return {
        time: t,
        x,
        v,
        a,
        force: f,
        energy,
        power: c * v * v,
        residual: m * a + c * v + k * x - f,
        transient: { x: tr.x, v: tr.v, a: tr.a },
        steady: bounded ? ss : null,
        particular: ss,
      };
    },
  };
}
export interface TimeSample {
  time: number;
  x: number[];
  v: number[];
  a: number[];
  force: number[];
  energy: number;
  power: number;
  residual: number[];
}
/** Newmark beta=1/4 gamma=1/2; samples at fixed dt, no runtime clock dependency. */
export function newmark(
  system: System,
  force: (t: number) => number[],
  dt: number,
  steps: number,
  x0 = system.M.map(() => 0),
  v0 = system.M.map(() => 0),
): TimeSample[] {
  check(
    Number.isFinite(dt) &&
      dt > 0 &&
      Number.isInteger(steps) &&
      steps >= 1 &&
      steps <= 200000,
    "Invalid integration step/count (maximum 200000).",
  );
  const n = system.M.length,
    M = symmetric(system.M, "M"),
    K = passive(symmetric(system.K, "K", n), "K"),
    C = passive(symmetric(system.C, "C", n), "C");
  vector(x0, n, "Initial x");
  vector(v0, n, "Initial v");
  const mass = factorSPD(M),
    effective = factorSPD(add(add(K, scale(M, 4 / dt ** 2)), scale(C, 2 / dt)));
  let x = [...x0],
    v = [...v0];
  const getForce = (t: number) => {
    const f = force(t);
    vector(f, n, "Forcing");
    return [...f];
  };
  let f = getForce(0),
    a = mass.solve(f.map((q, i) => q - mv(C, v)[i] - mv(K, x)[i]));
  const output: TimeSample[] = [];
  function record(time: number) {
    const kx = mv(K, x),
      cv = mv(C, v),
      ma = mv(M, a),
      energy = (dot(v, mv(M, v)) + dot(x, kx)) / 2,
      power = dot(v, cv);
    finite([...x, ...v, ...a, energy, power], "Integrated response");
    output.push({
      time,
      x: [...x],
      v: [...v],
      a: [...a],
      force: [...f],
      energy,
      power,
      residual: ma.map((z, i) => z + cv[i] + kx[i] - f[i]),
    });
  }
  record(0);
  for (let j = 1; j <= steps; j++) {
    f = getForce(j * dt);
    const p = mv(
        M,
        x.map((z, i) => (4 * z) / dt ** 2 + (4 * v[i]) / dt + a[i]),
      ),
      q = mv(
        C,
        x.map((z, i) => (2 * z) / dt + v[i]),
      );
    const xn = effective.solve(f.map((z, i) => z + p[i] + q[i]));
    const an = xn.map(
      (z, i) => (4 * (z - x[i])) / dt ** 2 - (4 * v[i]) / dt - a[i],
    );
    const vn = v.map((z, i) => z + (dt * (a[i] + an[i])) / 2);
    x = xn;
    v = vn;
    a = an;
    record(j * dt);
  }
  return output;
}
export function sampledForce(values: number[][], dt: number) {
  check(
    values.length >= 2 && Number.isFinite(dt) && dt > 0,
    "Sampled forcing needs at least two samples and positive dt.",
  );
  const n = values[0].length;
  values.forEach((v) => vector(v, n, "Force record"));
  const data = values.map((v) => [...v]);
  return (t: number) => {
    check(
      Number.isFinite(t) && t >= 0 && t <= dt * (data.length - 1) + dt * 1e-8,
      "Time outside forcing record.",
    );
    const i = Math.min(data.length - 2, Math.floor(t / dt)),
      u = Math.min(1, t / dt - i);
    return data[i].map((v, j) => v * (1 - u) + data[i + 1][j] * u);
  };
}

/** Exact transient + harmonic steady response in classical mass-normalized modal coordinates. */
export function modalForcedResponse(
  modal: import("./modal").Modal,
  force: import("./frequency").Complex[],
  omega: number,
  x0: number[],
  v0: number[],
) {
  check(modal.classical, "Damped modal forcing requires classical damping.");
  check(
    force.length === modal.modes.length,
    "Forcing dimensions do not match.",
  );
  force.forEach((f) => finite([f.re, f.im]));
  const basis = modal.modes.map((m) => m.phi),
    q0 = project(basis, modal.system.M, x0),
    qd0 = project(basis, modal.system.M, v0);
  const oscillators = modal.modes.map((m, i) => {
    const re = dot(
        m.phi,
        force.map((f) => f.re),
      ),
      im = dot(
        m.phi,
        force.map((f) => f.im),
      );
    return forcedSdof(
      {
        mass: 1,
        stiffness: m.lambda,
        damping: Math.max(0, modal.dampingGram[i][i]),
        x0: q0[i],
        v0: qd0[i],
      },
      {
        kind: "harmonic",
        amplitude: Math.hypot(re, im),
        omega,
        phase: Math.atan2(im, re),
      },
    );
  });
  return {
    sample(time: number) {
      const s = oscillators.map((o) => o.sample(time)),
        q = s.map((p) => p.x),
        x = reconstruct(basis, q),
        v = reconstruct(
          basis,
          s.map((p) => p.v),
        ),
        a = reconstruct(
          basis,
          s.map((p) => p.a),
        );
      const f = force.map(
        (z) => z.re * Math.cos(omega * time) - z.im * Math.sin(omega * time),
      );
      const ma = mv(modal.system.M, a),
        cv = mv(modal.system.C, v),
        kx = mv(modal.system.K, x);
      return {
        time,
        x,
        v,
        a,
        q,
        energy: (dot(v, mv(modal.system.M, v)) + dot(x, kx)) / 2,
        residual: ma.map((v, i) => v + cv[i] + kx[i] - f[i]),
      };
    },
  };
}
