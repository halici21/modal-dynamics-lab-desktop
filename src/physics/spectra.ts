import { check, finite, hzToOmega } from "./common";
import { newmark, sampledForce } from "./dynamics";
import { cadd, cmul, cx, magnitude, type Complex } from "./frequency";
/** Elastic response spectrum of a piecewise-linear base acceleration record in m/s². Record interval only. */
export function responseSpectrum(
  acceleration: number[],
  recordDt: number,
  periods: number[],
  zeta = 0.05,
  substeps = 4,
) {
  finite(acceleration);
  finite(periods);
  check(
    periods.length > 0 &&
      periods.every((t) => t > 0) &&
      Number.isFinite(zeta) &&
      zeta >= 0 &&
      Number.isInteger(substeps) &&
      substeps >= 1,
    "Invalid spectrum oscillators.",
  );
  const force = sampledForce(
    acceleration.map((a) => [-a]),
    recordDt,
  );
  return periods.map((period) => {
    const omega = (2 * Math.PI) / period,
      subdivisions = Math.max(substeps, Math.ceil((recordDt * 80) / period)),
      dt = recordDt / subdivisions;
    const history = newmark(
      {
        M: [[1]],
        C: [[2 * zeta * omega]],
        K: [[omega * omega]],
        labels: ["relative z"],
      },
      force,
      dt,
      (acceleration.length - 1) * subdivisions,
    );
    const Sd = history.reduce((peak, s) => Math.max(peak, Math.abs(s.x[0])), 0);
    return {
      period,
      omega,
      zeta,
      Sd,
      pseudoSv: omega * Sd,
      pseudoSa: omega * omega * Sd,
      dt,
      samples: history.length,
    };
  });
}
/** One-sided PSD density per Hz; trapezoidal integration in Hz gives variance. */
export function integratePSD(frequenciesHz: number[], density: number[]) {
  check(
    frequenciesHz.length >= 2 && density.length === frequenciesHz.length,
    "PSD dimensions do not match.",
  );
  finite(frequenciesHz);
  finite(density);
  check(
    frequenciesHz[0] >= 0 &&
      frequenciesHz.every((f, i) => !i || f > frequenciesHz[i - 1]) &&
      density.every((s) => s >= 0),
    "PSD needs increasing nonnegative Hz and nonnegative density.",
  );
  let variance = 0;
  for (let i = 1; i < density.length; i++)
    variance +=
      (density[i] / 2 + density[i - 1] / 2) *
      (frequenciesHz[i] - frequenciesHz[i - 1]);
  finite([variance], "PSD variance");
  return { variance, rms: Math.sqrt(variance) };
}
export function scalarPSD(
  frequenciesHz: number[],
  inputPerHz: number[],
  transfer: (omega: number) => Complex,
) {
  integratePSD(frequenciesHz, inputPerHz);
  const output = frequenciesHz.map(
    (f, i) => magnitude(transfer(hzToOmega(f))) ** 2 * inputPerHz[i],
  );
  return {
    output,
    ...integratePSD(frequenciesHz, output),
    convention: "one-sided per Hz; sigma² = integral S(f) df",
  };
}
/** Independent multi-DOF input PSDs. Correlated multi-support input is outside this foundation. */
export function outputPSD(H: Complex[][], independentInputPSD: number[]) {
  finite(independentInputPSD);
  check(
    independentInputPSD.every((x) => x >= 0) &&
      H.length > 0 &&
      H.every((r) => r.length === independentInputPSD.length),
    "PSD dimensions/values invalid.",
  );
  H.flat().forEach((z) => finite([z.re, z.im]));
  return H.map((a) =>
    H.map((b) =>
      a.reduce(
        (sum, z, j) =>
          cadd(
            sum,
            cmul(cmul(z, cx(independentInputPSD[j])), cx(b[j].re, -b[j].im)),
          ),
        cx(0),
      ),
    ),
  );
}
export function perRadianToPerHz(density: number) {
  check(Number.isFinite(density) && density >= 0, "Invalid PSD density.");
  return 2 * Math.PI * density;
}
