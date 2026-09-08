import { subspaceOverlap } from "../../src/physics/modal";
import { modalFRFEntry } from "../../src/physics/frequency";
import { modalForcedResponse } from "../../src/physics/dynamics";
import { describe, it, expect, afterAll } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import oracle from "../fixtures/full-physics-oracle.json";
import {
  eye,
  zeros,
  scale,
  mv,
  norm,
  dot,
  maxAbs,
  mul,
  transpose,
  TOL,
} from "../../src/physics/common";
import {
  chain,
  assemble,
  rayleigh,
  fitRayleigh,
  type System,
} from "../../src/physics/systems";
import {
  solveModal,
  modalResponse,
  mac,
  normalize,
  project,
  reconstruct,
  participation,
  trackModes,
} from "../../src/physics/modal";
import {
  directFRF,
  modalFRF,
  sdofFRF,
  cx,
  csub,
  magnitude,
  baseResponse,
  baseAccelerationResponse,
  transfer,
} from "../../src/physics/frequency";
import { forcedSdof, newmark } from "../../src/physics/dynamics";
import { createSdof, DEFAULT_SDOF } from "../../src/physics/sdof";
import {
  responseSpectrum,
  scalarPSD,
  outputPSD,
  integratePSD,
  perRadianToPerHz,
} from "../../src/physics/spectra";
import {
  barElement,
  beamElement,
  frameElement,
  uniformFE,
  assembleFE,
  solveFE,
  beamInterpolate,
} from "../../src/physics/fem";
import { rigid2D, rigid3D, rigidTransform } from "../../src/physics/rigid";
const metrics: Record<string, number> = {};
function record(k: string, v: number) {
  metrics[k] = Math.max(metrics[k] ?? 0, Math.abs(v));
}
function close(a: number, b: number, tol = 1e-9) {
  expect(Math.abs(a - b)).toBeLessThanOrEqual(tol * Math.max(1, Math.abs(b)));
}
const uniform = (
  n: number,
  b: "fixed-fixed" | "fixed-free" | "free-free" = "fixed-fixed",
) => chain(Array(n).fill(1), Array(n + 1).fill(100), b);
afterAll(() => {
  mkdirSync("docs/validation/full-physics-r1", { recursive: true });
  writeFileSync(
    "docs/validation/full-physics-r1/numerical.json",
    JSON.stringify({ oracle: oracle.provenance, metrics }, null, 2),
  );
});
describe("Generalized modal system", () => {
  it.each([2, 3, 4, 5, 10])("N=%i matches fixed-fixed closed form", (n) => {
    const s = solveModal(uniform(n));
    s.modes.forEach((m, j) => {
      const v = 200 * (1 - Math.cos(((j + 1) * Math.PI) / (n + 1)));
      close(m.lambda, v);
      record("chainEigenRelativeError", (m.lambda - v) / v);
    });
    if (n === 2) {
      close(s.modes[0].omega, 10);
      close(mac(s.modes[0].phi, [1, 1], eye(2)), 1);
      close(mac(s.modes[1].phi, [1, -1], eye(2)), 1);
    }
  });
  it.each(["free-free", "fixed-free"] as const)(
    "%s matches closed forms through N=10",
    (b) => {
      for (const n of [2, 3, 5, 10]) {
        const s = solveModal(uniform(n, b));
        s.modes.forEach((m, j) =>
          close(
            m.lambda,
            200 *
              (1 -
                Math.cos(
                  b === "free-free"
                    ? (j * Math.PI) / n
                    : ((2 * j + 1) * Math.PI) / (2 * n + 1),
                )),
          ),
        );
      }
    },
  );
  it("assembly includes springs/dampers, metadata and disconnected zero modes", () => {
    const s = assemble(
      [1, 2],
      [
        { i: 0, j: null, k: 10, c: 2 },
        { i: 0, j: 1, k: 20, c: 3 },
      ],
    );
    expect(s.K).toEqual([
      [30, -20],
      [-20, 20],
    ]);
    expect(s.C).toEqual([
      [5, -3],
      [-3, 3],
    ]);
    expect(
      solveModal(chain([1, 1, 1], [0, 100, 0, 0], "free-free")).modes.filter(
        (m) => m.kind === "zero",
      ),
    ).toHaveLength(2);
    expect(
      solveModal(assemble([1, 2], [])).modes.every((m) => m.kind === "zero"),
    ).toBe(true);
  });
  it.each(oracle.cases.map((c, i) => ({ c, i })))(
    "SciPy full SPD mass oracle $i",
    ({ c }) => {
      const s = solveModal({ ...c, labels: c.M.map((_, i) => "x" + i) });
      s.modes.forEach((m, i) => {
        close(m.lambda, c.values[i], 2e-10);
        close(
          mac(
            m.phi,
            c.phi.map((r) => r[i]),
            c.M,
          ),
          1,
          1e-9,
        );
        record(
          "oracleEigenRelativeError",
          (m.lambda - c.values[i]) / c.values[i],
        );
        record("eigenResidual", m.residual);
      });
      record("massOrthogonality", s.massError);
      record("stiffnessOrthogonalityAbsolute", s.stiffnessError);
      record(
        "stiffnessOrthogonalityRelative",
        s.stiffnessError / Math.max(...s.modes.map((m) => m.lambda)),
      );
      for (const f of c.frfs) {
        const h = directFRF(s.system, f.omega),
          q = modalFRF(s, f.omega);
        h.forEach((r, i) =>
          r.forEach((z, j) => {
            close(z.re, f.real[i][j], 1e-10);
            close(z.im, f.imag[i][j], 1e-10);
            record("directModalFRFAbsolute", magnitude(csub(z, q[i][j])));
            close(magnitude(csub(z, q[i][j])), 0, 2e-10);
          }),
        );
      }
    },
  );
  it("mass/stiffness scaling is relative even for tiny global scales", () => {
    const source = oracle.cases[2],
      s = { ...source, labels: source.M.map((_, i) => "x" + i) },
      base = solveModal(s);
    for (const a of [1e-12, 0.01, 4, 1e12])
      for (const b of [1e-12, 0.1, 9, 1e12]) {
        const q = solveModal({
          ...s,
          M: scale(s.M, a),
          K: scale(s.K, b),
          C: zeros(s.M.length),
        });
        q.modes.forEach((m, i) =>
          close(m.omega / (base.modes[i].omega * Math.sqrt(b / a)), 1, 2e-9),
        );
      }
  });
  it("rejects invalid mass, stiffness, damping, dimensions and links", () => {
    for (const M of [
      [
        [0, 0],
        [0, 1],
      ],
      [
        [1, 2],
        [2, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [NaN, 0],
        [0, 1],
      ],
    ])
      expect(() => solveModal({ ...uniform(2), M })).toThrow();
    expect(() =>
      solveModal({
        ...uniform(2),
        K: [
          [1, 2],
          [2, 1],
        ],
      }),
    ).toThrow(/Negative/);
    expect(() =>
      solveModal({
        ...uniform(2),
        K: [
          [1, 2],
          [0, 1],
        ],
      }),
    ).toThrow(/symmetric/);
    expect(() =>
      solveModal({
        ...uniform(2),
        C: [
          [-1, 0],
          [0, 0],
        ],
      }),
    ).toThrow(/passive/);
    expect(() => solveModal({ ...uniform(2), C: [[1]] })).toThrow();
    expect(() => assemble([1, 1], [{ i: 0, j: 2, k: 1 }])).toThrow();
  });
  it("MAC, arbitrary normalization and participation are scale/sign invariant", () => {
    const s = solveModal(chain([1, 2, 3], [100, 80, 120, 50])),
      p = s.modes.map((m) => m.phi),
      r = [1, 1, 1],
      base = participation(p, s.system.M, r);
    close(base.modes.at(-1)!.cumulative, 1);
    for (const kind of ["max", "mass"] as const) {
      const q = p.map((v, i) => normalize(v, s.system.M, kind, i % 2 ? -1 : 1));
      const a = participation(q, s.system.M, r);
      a.modes.forEach((v, i) =>
        close(v.effectiveMass, base.modes[i].effectiveMass),
      );
      close(mac(q[0], p[0], s.system.M), 1);
      close(mac(p[0], p[1], s.system.M), 0);
      const x = [0.1, 0.2, -0.1];
      reconstruct(q, project(q, s.system.M, x)).forEach((v, i) =>
        close(v, x[i]),
      );
    }
    record(
      "participationMassSumError",
      base.modes.reduce((a, b) => a + b.effectiveMass, 0) - base.total,
    );
  });
  it("global mode matching follows crossings and flags repeated subspaces", () => {
    const make = (a: number, b: number) =>
      solveModal({
        M: eye(2),
        C: zeros(2),
        K: [
          [a, 0],
          [0, b],
        ],
        labels: ["x", "y"],
      });
    expect(trackModes(make(99, 101), make(101, 99)).map((m) => m.next)).toEqual(
      [1, 0],
    );
    expect(
      trackModes(make(100, 100), make(100, 100)).every((m) => m.ambiguous),
    ).toBe(true);
    const p = make(100, 100);
    p.modes[0].phi = [Math.SQRT1_2, Math.SQRT1_2];
    p.modes[1].phi = [-Math.SQRT1_2, Math.SQRT1_2];
    expect(trackModes(p, make(100, 100)).every((m) => m.ambiguous)).toBe(true);
  });
  it("superposition reconstructs initial state, forces, derivatives and energy", () => {
    for (const boundary of ["fixed-fixed", "free-free"] as const)
      for (const damped of [false, true]) {
        const system = uniform(5, boundary);
        if (damped) system.C = rayleigh(system.M, system.K, 0.2, 0.002);
        const modal = solveModal(system),
          x0 = [0.1, -0.03, 0.05, 0, 0.2],
          v0 = [0.1, 0.2, 0, -0.1, 0.05],
          s = modalResponse(modal, x0, v0);
        s.sample(0).x.forEach((v, i) => {
          close(v, x0[i]);
          record("reconstructionError", v - x0[i]);
        });
        let last = s.sample(0).energy;
        for (const t of [0.01, 0.1, 0.7, 2, 8]) {
          const a = s.sample(t),
            lo = s.sample(t - 1e-5),
            hi = s.sample(t + 1e-5);
          expect(a.energy).toBeLessThanOrEqual(last + 1e-10);
          last = a.energy;
          record("dynamicResidualAbsolute", norm(a.residual));
          expect(norm(a.residual)).toBeLessThan(1e-9);
          a.v.forEach((v, i) => close((hi.x[i] - lo.x[i]) / 2e-5, v, 2e-7));
          close((hi.energy - lo.energy) / 2e-5, -a.power, 2e-7);
          record(
            "energyDerivativeError",
            (hi.energy - lo.energy) / 2e-5 + a.power,
          );
        }
      }
  });
  it("Rayleigh fits ratios, diagonalizes and treats zero damping ratio as undefined", () => {
    const fit = fitRayleigh(10, 0.03, 30, 0.05);
    close(fit.alpha / (2 * 10) + (fit.beta * 10) / 2, 0.03);
    close(fit.alpha / (2 * 30) + (fit.beta * 30) / 2, 0.05);
    record(
      "rayleighTargetError",
      fit.alpha / (2 * 30) + (fit.beta * 30) / 2 - 0.05,
    );
    expect(() => fitRayleigh(10, 0.05, 10, 0.05)).toThrow();
    const s = uniform(3, "free-free");
    s.C = rayleigh(s.M, s.K, fit.alpha, fit.beta);
    const m = solveModal(s);
    expect(m.classical).toBe(true);
    close(m.dampingGram[0][0], fit.alpha);
    const non = uniform(2);
    non.C = [
      [2, 0],
      [0, 0],
    ];
    const q = solveModal(non);
    expect(q.classical).toBe(false);
    expect(() => modalResponse(q, [0, 0], [0, 0])).toThrow();
    expect(() => modalFRF(q, 4)).toThrow();
    expect(directFRF(non, 4)).toHaveLength(2);
  });
});
describe("Forced, frequency and base response", () => {
  it.each([0, 4, 20, 40])(
    "forced c=%i obeys IC and independent derivative/ODE balance",
    (c) => {
      for (const force of [
        { kind: "constant" as const, value: 2 },
        { kind: "harmonic" as const, amplitude: 2, omega: 7, phase: 0.3 },
      ]) {
        const s = forcedSdof({ ...DEFAULT_SDOF, damping: c }, force);
        close(s.sample(0).x, 0.1);
        close(s.sample(0).v, 0);
        for (const t of [0.1, 0.7, 2]) {
          const r = s.sample(t),
            a = s.sample(t - 1e-5),
            b = s.sample(t + 1e-5);
          close((b.x - a.x) / 2e-5, r.v, 2e-8);
          close((b.v - a.v) / 2e-5, r.a, 2e-7);
          close(r.residual, 0);
        }
      }
    },
  );
  it("undamped resonant growth and zero-stiffness constant force are analytical", () => {
    const s = forcedSdof(
      { mass: 1, stiffness: 100, x0: 0, v0: 0 },
      { kind: "harmonic", amplitude: 2, omega: 10 },
    );
    expect(s.boundedSteadyState).toBe(false);
    close(s.sample(0.3).x, 0.03 * Math.sin(3));
    for (const c of [0, 2]) {
      const q = forcedSdof(
        { mass: 1, stiffness: 0, damping: c, x0: 0, v0: 0 },
        { kind: "constant", value: 2 },
      );
      close(q.sample(1).x, c ? 1 - (1 - Math.exp(-2)) / 2 : 1);
    }
    expect(() => sdofFRF(1, 0, 100, 10)).toThrow();
    expect(() => directFRF(uniform(2, "free-free"), 0)).toThrow();
  });
  it("FRF static/inertial limits, resonance peak and response types", () => {
    close(sdofFRF(1, 4, 100, 0).magnitude, 0.01);
    const a = sdofFRF(1, 4, 100, 10);
    close(a.magnitude, 0.025);
    close(a.phase, -Math.PI / 2);
    close(a.resonanceOmega!, Math.sqrt(92));
    close(sdofFRF(1, 4, 100, 1e6).magnitude * 1e12, 1, 1e-8);
    close(magnitude(transfer(a.h, 10, "mobility")), 0.25);
    close(magnitude(transfer(a.h, 10, "accelerance")), 2.5);
  });
  it("absolute/relative base motion and inertial forcing agree", () => {
    const s = uniform(3);
    s.C = rayleigh(s.M, s.K, 0.2, 0.002);
    for (const w of [0, 3, 10, 30]) {
      const b = baseResponse(s, w, cx(0.01)),
        r = baseAccelerationResponse(s, w, cx(-w * w * 0.01));
      b.relative.forEach((z, i) => {
        close(magnitude(csub(z, r[i])), 0);
        close(b.absolute[i].re - z.re, 0.01);
      });
    }
    const s1 = { M: [[1]], K: [[100]], C: [[4]], labels: ["x"] };
    const b = baseResponse(s1, 10, cx(1));
    close(b.absolute[0].re, 1);
    close(b.absolute[0].im, -2.5);
  });
  it("Newmark converges quadratically to analytical free/forced SDOF", () => {
    for (const forced of [false, true]) {
      const analytical = forced
        ? forcedSdof(
            { ...DEFAULT_SDOF, damping: 4 },
            { kind: "harmonic", amplitude: 2, omega: 7 },
          )
        : createSdof({ ...DEFAULT_SDOF, damping: 4 });
      let previous = Infinity;
      for (const dt of [0.02, 0.01, 0.005, 0.0025]) {
        const h = newmark(
          { M: [[1]], K: [[100]], C: [[4]], labels: ["x"] },
          (t) => [forced ? 2 * Math.cos(7 * t) : 0],
          dt,
          Math.round(2 / dt),
          [0.1],
          [0],
        );
        const error = Math.max(
          ...h.map((s) => Math.abs(s.x[0] - analytical.sample(s.time).x)),
        );
        expect(error).toBeLessThan(previous * 0.3);
        previous = error;
      }
      record("newmarkFineMaxDisplacementError", previous);
      expect(previous).toBeLessThan(2e-5);
    }
  });
});
describe("Spectrum, random vibration and FE", () => {
  it("record-integrated spectrum matches independent DOP853 maxima", () => {
    const a = oracle.spectrum,
      results = responseSpectrum(
        a.acceleration,
        a.dt,
        a.results.map((r) => r.period),
        0.05,
        16,
      );
    results.forEach((r, i) => {
      const expected = a.results[i];
      for (const key of ["Sd", "pseudoSv", "pseudoSa"] as const) {
        const error = Math.abs(r[key] / expected[key] - 1);
        record("spectrumRelativeError", error);
        expect(error).toBeLessThan(0.001);
      }
    });
  });
  it("one-sided PSD/RMS matches independent adaptive quadrature", () => {
    const f = Array.from({ length: 10001 }, (_, i) => i * 0.002),
      p = scalarPSD(
        f,
        f.map(() => 0.2),
        (w) => sdofFRF(1, 4, 100, w).h,
      );
    close(p.variance, oracle.psd.variance, 1e-11);
    record("psdVarianceRelativeError", p.variance / oracle.psd.variance - 1);
    close(perRadianToPerHz(1), 2 * Math.PI);
    expect(() => integratePSD([1, 0], [1, 1])).toThrow();
    const h = [
        [cx(1, 1), cx(2)],
        [cx(0, 1), cx(1)],
      ],
      s = outputPSD(h, [2, 3]);
    close(s[0][0].re, 16);
    close(s[1][1].re, 5);
    close(s[1][0].im, -s[0][1].im);
  });
  it("exact bar and quadrature-derived beam element matrices", () => {
    expect(barElement(6, 3, 2, 2)).toEqual({
      K: [
        [6, -6],
        [-6, 6],
      ],
      M: [
        [4, 2],
        [2, 4],
      ],
    });
    const o = oracle.beam,
      b = beamElement(o.E, o.rho, o.A, o.I, o.L);
    for (const key of ["M", "K"] as const)
      b[key].forEach((r, i) =>
        r.forEach((v, j) => close(v, o[key][i][j], 1e-10)),
      );
    close(beamInterpolate(1, 2, 3, 4, 2, 0), 1);
    close(beamInterpolate(1, 2, 3, 4, 2, 1), 3);
  });
  it.each(["bar", "beam", "frame"] as const)(
    "%s modal solve matches independent assembled SciPy fixtures",
    (kind) => {
      for (const o of oracle.fe.filter((r) => r.kind === kind)) {
        const a = solveFE(uniformFE(kind, o.elements));
        a.modal.modes.forEach((m, i) => {
          const e = Math.abs(m.omega / o.omega[i] - 1);
          record("feOracleFrequencyRelativeError", e);
          expect(e).toBeLessThan(2e-7);
        });
      }
    },
  );
  it("bar and first three cantilever beam modes converge toward continuum theory", () => {
    for (const kind of ["bar", "beam"] as const) {
      let last = Infinity;
      for (const elements of [2, 4, 8, 16]) {
        const a = solveFE(uniformFE(kind, elements)),
          w = a.modal.modes
            .slice(0, kind === "bar" ? 1 : 3)
            .map((m) => m.omega);
        const expected =
          kind === "bar"
            ? [(Math.PI / 2) * Math.sqrt(2e7 / 1000)]
            : [1.875104068711961, 4.694091132974174, 7.854757438237612].map(
                (b) => b * b * Math.sqrt((2e7 * 1e-5) / (1000 * 0.01)),
              );
        const error = Math.max(
          ...w.map((v, i) => Math.abs(v / expected[i] - 1)),
        );
        expect(error).toBeLessThan(last);
        last = error;
      }
      record(kind + "ContinuumRelativeError", last);
      expect(last).toBeLessThan(0.001);
    }
  });
  it("essential elimination and FE free-free rigid modes emerge naturally", () => {
    const a = assembleFE(uniformFE("bar", 2));
    expect(a.free).toEqual([1, 2]);
    expect(a.expand([2, 3])).toEqual([0, 2, 3]);
    close(a.K[0][0], 400000);
    for (const [kind, count] of [
      ["bar", 1],
      ["beam", 2],
      ["frame", 3],
    ] as const) {
      const s = solveFE(uniformFE(kind, 4, "free-free"));
      expect(s.modal.modes.filter((m) => m.kind === "zero")).toHaveLength(
        count,
      );
      s.modal.modes
        .filter((m) => m.kind === "zero")
        .forEach((m) => expect(m.residual).toBeLessThan(1e-10));
    }
  });
  it("rotated frame preserves eigenvalues, local/global virtual work and symmetry", () => {
    const a = solveFE(uniformFE("frame", 4)),
      b = solveFE(uniformFE("frame", 4, "cantilever", 1, 0.7));
    a.modal.modes.forEach((m, i) =>
      close(m.omega, b.modal.modes[i].omega, 1e-8),
    );
    const e = frameElement(2e7, 1000, 0.01, 1e-5, 3, 4),
      u = [0.1, 0.2, 0.01, 0.2, -0.1, 0.03],
      local = mv(e.T, u);
    close(dot(u, mv(e.K, u)), dot(local, mv(e.localK, local)), 1e-9);
  });
  it("2D/3D rigid bases and finite rotation preserve undeformed distances", () => {
    const p = [
        [0, 0, 0],
        [2, 0, 0],
        [0, 3, 0],
        [0, 0, 4],
      ],
      b = rigid3D(p);
    expect(b.vectors).toHaveLength(6);
    expect(rigid2D([[1, 2]]).vectors[2]).toEqual([-2, 1]);
    expect(b.vectors[3].slice(9)).toEqual([0, -4, 0]);
    const q = rigidTransform(p, [0.1, 0.2, 0.3], [0.2, -0.1, 0.3]);
    p.forEach((a, i) =>
      p.forEach((c, j) =>
        close(
          norm(a.map((v, k) => v - c[k])),
          norm(q[i].map((v, k) => v - q[j][k])),
        ),
      ),
    );
  });
});

it("constant-force free drift is stable as damping tends to zero", () => {
  for (const c of [0, 1e-14, 1e-10, 1e-6]) {
    const s = forcedSdof(
      { mass: 1, stiffness: 0, damping: c, x0: 0.1, v0: 0.2 },
      { kind: "constant", value: 2 },
    );
    close(s.sample(1).x, 1.3, 1e-6);
    close(s.sample(0).x, 0.1);
    close(s.sample(0).v, 0.2);
  }
});
it("exact damped modal forcing matches physical force balance and initial state", () => {
  const system = uniform(3);
  system.C = rayleigh(system.M, system.K, 0.2, 0.002);
  const modal = solveModal(system);
  const s = modalForcedResponse(
    modal,
    [cx(2, 0.1), cx(0), cx(-1)],
    7,
    [0.1, 0.02, 0],
    [0, 0.1, -0.1],
  );
  s.sample(0).x.forEach((x, i) => close(x, [0.1, 0.02, 0][i]));
  for (const t of [0.1, 0.4, 1]) {
    const q = s.sample(t);
    expect(norm(q.residual)).toBeLessThan(1e-10);
  }
});
it("planar FE stiffness annihilates independent geometric rigid-body vectors", () => {
  const a = assembleFE(uniformFE("frame", 4, "free-free", 1, 0.5)),
    nodes = a.nodes;
  const vectors = [
    nodes.flatMap(() => [1, 0, 0]),
    nodes.flatMap(() => [0, 1, 0]),
    nodes.flatMap(([x, y]) => [-y, x, 1]),
  ];
  for (const v of vectors)
    expect(norm(mv(a.K, v)) / (maxAbs(a.K) * norm(v))).toBeLessThan(1e-14);
});

it("repeated subspace overlap is basis invariant and scalar FRF matches full matrices", () => {
  close(
    subspaceOverlap(
      [
        [1, 0],
        [0, 1],
      ],
      [
        [2, 2],
        [-3, 3],
      ],
      eye(2),
    ),
    1,
  );
  const s = uniform(3);
  s.C = rayleigh(s.M, s.K, 0.2, 0.002);
  const m = solveModal(s);
  for (const w of [0, 3, 10, 20]) {
    const h = directFRF(s, w);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        close(magnitude(csub(h[i][j], modalFRFEntry(m, w, i, j))), 0, 1e-12);
  }
});
