import { it, expect } from "vitest";
import {
  createSdof,
  DEFAULT_SDOF,
  CRITICAL_TOLERANCE,
  sampleSdof,
} from "../../src/physics/sdof";
import {
  editDamping,
  coefficientFromRatio,
} from "../../src/physics/dampingControl";
const close = (a: number, b: number, tol = 1e-10) =>
  expect(Math.abs(a - b)).toBeLessThanOrEqual(tol * Math.max(1, Math.abs(b)));
it("D: independent underdamped reference with exact derivatives", () => {
  const s = createSdof({ ...DEFAULT_SDOF, damping: 4 }),
    w = Math.sqrt(96);
  close(s.zeta!, 0.2);
  close(s.dampedOmega!, 9.797958971132712);
  close(s.criticalDamping, 20);
  for (const t of [0, 0.1, 0.2, 0.37, 1, 3]) {
    const x =
      Math.exp(-2 * t) * (0.1 * Math.cos(w * t) + (0.2 / w) * Math.sin(w * t));
    const v = (-10 / w) * Math.exp(-2 * t) * Math.sin(w * t);
    const a =
      Math.exp(-2 * t) * ((20 / w) * Math.sin(w * t) - 10 * Math.cos(w * t));
    const r = s.sample(t);
    close(r.x, x);
    close(r.v, v);
    close(r.a, a);
  }
});
it("E: critical repeated root reference", () => {
  const s = createSdof({ ...DEFAULT_SDOF, damping: 20 });
  expect(s.dampedOmega).toBeNull();
  close(s.zeta!, 1);
  for (const t of [0, 0.1, 0.2, 0.37, 1, 3]) {
    const r = s.sample(t),
      e = Math.exp(-10 * t);
    close(r.x, (0.1 + t) * e);
    close(r.v, -10 * t * e);
    close(r.a, (100 * t - 10) * e);
  }
});
it("F: overdamped independent modal coefficient reference", () => {
  const s = createSdof({ ...DEFAULT_SDOF, damping: 40 }),
    r1 = -20 + 10 * Math.sqrt(3),
    r2 = -20 - 10 * Math.sqrt(3);
  close(s.roots[0].real, r1);
  close(s.roots[1].real, r2);
  const c1 = (-0.1 * r2) / (r1 - r2),
    c2 = (0.1 * r1) / (r1 - r2);
  for (const t of [0, 0.1, 0.2, 0.37, 1, 3]) {
    const r = s.sample(t);
    close(r.x, c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t));
    close(r.v, c1 * r1 * Math.exp(r1 * t) + c2 * r2 * Math.exp(r2 * t));
    close(
      r.a,
      c1 * r1 * r1 * Math.exp(r1 * t) + c2 * r2 * r2 * Math.exp(r2 * t),
    );
  }
});
it("G: zero stiffness is viscous slowing, with undefined ratio", () => {
  const s = createSdof({ mass: 2, stiffness: 0, damping: 4, x0: 0.1, v0: 0.5 });
  expect(s.zeta).toBeNull();
  expect(s.regime).toBe("No restoring stiffness");
  for (const t of [0, 1e-12, 0.2, 1, 10]) {
    const r = s.sample(t);
    close(r.x, 0.1 + 0.25 * (1 - Math.exp(-2 * t)));
    close(r.v, 0.5 * Math.exp(-2 * t));
    close(r.a, -Math.exp(-2 * t));
  }
});
it("H: c=0 preserves all undamped reference snapshots", () => {
  for (const p of [
    DEFAULT_SDOF,
    { ...DEFAULT_SDOF, mass: 4 },
    { mass: 2, stiffness: 50, x0: 0.04, v0: 0.3 },
    { ...DEFAULT_SDOF, stiffness: 0, v0: 0.5 },
  ])
    for (const t of [0, 0.2, 0.37, 2])
      expect(createSdof({ ...p, damping: 0 }).sample(t)).toEqual(
        createSdof(p).sample(t),
      );
});
it("critical tolerance classifies without approximating the physical solution", () => {
  for (const eps of [-2e-8, -0.5e-8, -1e-12, 0, 1e-12, 0.5e-8, 2e-8]) {
    const s = createSdof({ ...DEFAULT_SDOF, damping: 20 * (1 + eps) });
    expect(s.regime.startsWith("Critical")).toBe(
      Math.abs(eps) <= CRITICAL_TOLERANCE,
    );
    for (const t of [0, 0.001, 0.2, 1, 10]) {
      const r = s.sample(t),
        c = createSdof({ ...DEFAULT_SDOF, damping: 20 }).sample(t);
      close(r.x, c.x, 1e-8);
      close(r.v, c.v, 1e-7);
      close(r.residual, 0);
    }
  }
});
it("deterministic sweep preserves IC, force, energy and independent derivative identities", () => {
  for (const mass of [0.25, 1, 10])
    for (const stiffness of [0, 0.01, 100, 500])
      for (const z of [0, 1e-10, 0.1, 0.9, 1 - 1e-9, 1, 1 + 1e-9, 2, 10])
        for (const x0 of [-0.2, 0, 0.2])
          for (const v0 of [-1, 0, 1]) {
            const damping = stiffness ? 2 * z * Math.sqrt(mass * stiffness) : z;
            const s = createSdof({ mass, stiffness, damping, x0, v0 });
            close(s.sample(0).x, x0);
            close(s.sample(0).v, v0);
            let energy = s.energy;
            for (const t of [0.001, 0.01, 0.1, 0.5, 2, 8]) {
              const r = s.sample(t),
                h = 1e-6,
                lo = s.sample(t - h),
                hi = s.sample(t + h);
              expect(Object.values(r).every(Number.isFinite)).toBe(true);
              close(r.residual, 0);
              close(mass * r.a, r.force + r.dampingForce);
              expect(r.dampingForce * r.v).toBeLessThanOrEqual(0);
              expect(r.total).toBeLessThanOrEqual(energy + 1e-10);
              energy = r.total;
              close((hi.x - lo.x) / (2 * h), r.v, 1e-6);
              close((hi.v - lo.v) / (2 * h), r.a, 1e-5);
              close((hi.total - lo.total) / (2 * h), -r.power, 1e-4);
            }
          }
});
it("dissipated energy agrees with independent Simpson integration", () => {
  for (const damping of [0, 4, 20, 40]) {
    const s = createSdof({ ...DEFAULT_SDOF, damping }),
      n = 10000,
      h = 2 / n;
    let sum = 0;
    for (let i = 0; i <= n; i++)
      sum += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * s.sample(i * h).power;
    close((sum * h) / 3, s.sample(2).dissipated, 1e-9);
  }
});
it("authority conversion preserves ratio or coefficient and handles zero stiffness", () => {
  const p = { ...DEFAULT_SDOF, damping: 4 };
  close(editDamping(p, "c", "mass", 4).damping!, 4);
  close(editDamping(p, "zeta", "mass", 4).damping!, 8);
  close(createSdof(editDamping(p, "zeta", "stiffness", 400)).zeta!, 0.2);
  close(coefficientFromRatio(p, 0.2), 4);
  close(editDamping(p, "zeta", "stiffness", 0).damping!, 4);
  expect(() => coefficientFromRatio({ ...p, stiffness: 0 }, 1)).toThrow();
  for (const damping of [-1, NaN, Infinity])
    expect(() => createSdof({ ...p, damping })).toThrow();
  for (const z of [-1, NaN, Infinity])
    expect(() => coefficientFromRatio(p, z)).toThrow();
});

it("sampling resolves the initial fast viscous transient within its bounded budget",()=>{
 const s=createSdof({mass:.25,stiffness:0,damping:500,x0:.1,v0:1});
 const points=sampleSdof(s,0,8,900);
 expect(points.length).toBeLessThanOrEqual(4097);
 expect(points.some(p=>p.time>0 && p.time<.0001)).toBe(true);
 expect(points[0].time).toBe(0);expect(points.at(-1)!.time).toBe(8);
});
