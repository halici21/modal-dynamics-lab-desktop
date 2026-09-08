import { describe, it, expect } from "vitest";
import { createSdof, DEFAULT_SDOF, sampleSdof } from "../../src/physics/sdof";
const near = (a: number, b: number) =>
  expect(Math.abs(a - b)).toBeLessThan(1e-10 * Math.max(1, Math.abs(b)));
describe("Analytical undamped SDOF", () => {
  it("reference A: endpoints, quarter and half period", () => {
    const s = createSdof(DEFAULT_SDOF);
    near(s.omega, 10);
    near(s.frequency, 1.5915494309189535);
    near(s.period!, 0.6283185307179586);
    const zero = s.sample(0),
      q = s.sample(s.period! / 4),
      h = s.sample(s.period! / 2);
    near(zero.x, 0.1);
    near(zero.v, 0);
    near(zero.a, -10);
    near(zero.total, 0.5);
    near(q.x, 0);
    near(q.v, -1);
    near(q.a, 0);
    near(q.kinetic, 0.5);
    near(q.potential, 0);
    near(h.x, -0.1);
    near(h.v, 0);
    near(h.a, 10);
    near(h.total, 0.5);
  });
  it("reference B: quadrupling mass halves frequency", () => {
    const s = createSdof({ ...DEFAULT_SDOF, mass: 4 });
    near(s.omega, 5);
    near(s.frequency, 0.7957747154594768);
    near(s.period!, 1.2566370614359172);
    near(s.sample(0.2).x, 0.1 * Math.cos(1));
    near(s.sample(0.2).v, -0.5 * Math.sin(1));
    near(s.sample(0.2).a, -2.5 * Math.cos(1));
    near(s.sample(0.2).total, 0.5);
  });
  it("reference C: nonzero initial velocity", () => {
    const s = createSdof({ mass: 2, stiffness: 50, x0: 0.04, v0: 0.3 });
    for (const t of [0, 0.1, 0.37, 0.8, 1.2, 3.7]) {
      const r = s.sample(t),
        x = 0.04 * Math.cos(5 * t) + 0.06 * Math.sin(5 * t);
      near(r.x, x);
      near(r.v, -0.2 * Math.sin(5 * t) + 0.3 * Math.cos(5 * t));
      near(r.a, -25 * x);
      near(r.total, 0.13);
      near(r.residual, 0);
    }
  });
  it("sweep preserves initial conditions, energy, periodicity and force sign", () => {
    for (const mass of [0.25, 1, 4, 10])
      for (const stiffness of [0.01, 1, 100, 500])
        for (const x0 of [-0.2, 0, 0.2])
          for (const v0 of [-1, 0, 1]) {
            const s = createSdof({ mass, stiffness, x0, v0 });
            near(s.sample(0).x, x0);
            near(s.sample(0).v, v0);
            for (const t of [0.013, 0.1, 0.37, 2, 13]) {
              const r = s.sample(t),
                r2 = s.sample(t + s.period!);
              near(r.x, r2.x);
              near(r.v, r2.v);
              near(r.total, s.energy);
              near(r.residual, 0);
              expect(r.force * r.x).toBeLessThanOrEqual(0);
            }
          }
  });
  it("velocity and acceleration agree with independent finite differences", () => {
    const s = createSdof({ mass: 2, stiffness: 50, x0: 0.04, v0: 0.3 });
    const h = 1e-5;
    for (const t of [0.1, 0.3, 0.8]) {
      const a = s.sample(t - h),
        b = s.sample(t + h),
        c = s.sample(t);
      expect(Math.abs((b.x - a.x) / (2 * h) - c.v)).toBeLessThan(1e-8);
      expect(Math.abs((b.v - a.v) / (2 * h) - c.a)).toBeLessThan(1e-8);
    }
  });
  it("frequency has the expected mass and stiffness sensitivities", () => {
    const s = createSdof(DEFAULT_SDOF);
    near(
      createSdof({ ...DEFAULT_SDOF, stiffness: 400 }).frequency,
      2 * s.frequency,
    );
    near(createSdof({ ...DEFAULT_SDOF, mass: 4 }).frequency, s.frequency / 2);
  });
  it("zero stiffness is free translation including rest", () => {
    for (const v0 of [-1, 0, 0.3]) {
      const s = createSdof({ ...DEFAULT_SDOF, stiffness: 0, v0 });
      expect(s.period).toBeNull();
      expect(s.amplitude).toBeNull();
      expect(s.frequency).toBe(0);
      for (const t of [0, 0.2, 10, 100]) {
        const r = s.sample(t);
        near(r.x, 0.1 + v0 * t);
        near(r.v, v0);
        near(r.a, 0);
        near(r.force, 0);
        near(r.total, 0.5 * v0 * v0);
      }
    }
  });
  it("invalid physical parameters and overflow are rejected", () => {
    for (const mass of [0, -1, NaN, Infinity])
      expect(() => createSdof({ ...DEFAULT_SDOF, mass })).toThrow();
    for (const stiffness of [-1, NaN, Infinity])
      expect(() => createSdof({ ...DEFAULT_SDOF, stiffness })).toThrow();
    for (const key of ["x0", "v0"] as const)
      for (const v of [NaN, Infinity])
        expect(() => createSdof({ ...DEFAULT_SDOF, [key]: v })).toThrow();
    expect(() =>
      createSdof({ ...DEFAULT_SDOF, mass: 1e-300, stiffness: 1e300 }),
    ).toThrow();
    for (const t of [-1, NaN, Infinity])
      expect(() => createSdof(DEFAULT_SDOF).sample(t)).toThrow();
  });
  it("solutions snapshot parameters and expose no mutable model", () => {
    const p = { ...DEFAULT_SDOF };
    const s = createSdof(p);
    p.mass = 8;
    expect(s.parameters.mass).toBe(1);
    expect(Object.isFrozen(s.parameters)).toBe(true);
  });
});
describe("Analytical plot sampling", () => {
  it("includes exact endpoints, sorted unique times and bounded frequency-aware density", () => {
    for (const mass of [0.25, 10])
      for (const stiffness of [0, 0.01, 500])
        for (const width of [320, 900, 2400]) {
          const s = createSdof({ ...DEFAULT_SDOF, mass, stiffness }),
            end = s.period ? 4 * s.period : 8,
            points = sampleSdof(s, 0, end, width);
          expect(points[0].time).toBe(0);
          expect(points.at(-1)!.time).toBe(end);
          expect(points.length).toBeLessThanOrEqual(4097);
          expect(points.length - 1).toBeGreaterThanOrEqual(
            Math.ceil(end * s.frequency * 64),
          );
          for (let i = 1; i < points.length; i++)
            expect(points[i].time).toBeGreaterThan(points[i - 1].time);
        }
  });
  it("rejects domains that cannot be sampled faithfully and invalid widths", () => {
    const s = createSdof(DEFAULT_SDOF);
    for (const args of [
      [0, 0, 900],
      [0, 1, 0],
      [-1, 1, 900],
      [0, 1, Infinity],
      [0, 10000, 900],
    ])
      expect(() =>
        sampleSdof(s, ...(args as [number, number, number])),
      ).toThrow();
  });
});
