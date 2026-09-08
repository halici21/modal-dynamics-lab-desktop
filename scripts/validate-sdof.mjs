import { createSdof, DEFAULT_SDOF } from "../src/physics/sdof.ts";
import { writeFile } from "node:fs/promises";
const references = {};
for (const [name, p] of Object.entries({
  A: DEFAULT_SDOF,
  B: { ...DEFAULT_SDOF, mass: 4 },
  C: { mass: 2, stiffness: 50, x0: 0.04, v0: 0.3 },
})) {
  const s = createSdof(p);
  references[name] = {
    parameters: p,
    omega: s.omega,
    frequency: s.frequency,
    period: s.period,
    energy: s.energy,
    samples: [0, s.period / 4, s.period / 2, 0.2, 0.37].map((t) => s.sample(t)),
  };
}
let maxEnergyError = 0,
  maxResidual = 0,
  samples = 0;
const start = performance.now();
for (const mass of [0.25, 1, 4, 10])
  for (const stiffness of [0, 0.01, 1, 100, 500])
    for (const x0 of [-0.2, 0, 0.2])
      for (const v0 of [-1, 0, 1]) {
        const s = createSdof({ mass, stiffness, x0, v0 });
        for (let i = 0; i < 100; i++) {
          const r = s.sample(i * 0.037);
          maxEnergyError = Math.max(
            maxEnergyError,
            Math.abs(r.total - s.energy),
          );
          maxResidual = Math.max(maxResidual, Math.abs(r.residual));
          samples++;
        }
      }
const result = {
  references,
  sweep: {
    samples,
    maxEnergyError,
    maxResidual,
    elapsedMs: performance.now() - start,
    tolerance:
      "1e-10 × max(1, |expected|) for analytical tests; finite difference 1e-8",
  },
};
await writeFile(
  "docs/validation/v1-numerical.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
