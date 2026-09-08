import { createSdof, type SdofParameters } from "./sdof";
export type DampingAuthority = "c" | "zeta";
export function editDamping(
  p: SdofParameters,
  authority: DampingAuthority,
  key: keyof SdofParameters,
  value: number,
): SdofParameters {
  const current = createSdof(p);
  const next = { ...p, [key]: value };
  if (
    authority === "zeta" &&
    (key === "mass" || key === "stiffness") &&
    next.stiffness > 0 &&
    current.zeta !== null
  )
    next.damping =
      2 * current.zeta * Math.sqrt(next.mass) * Math.sqrt(next.stiffness);
  createSdof(next);
  return next;
}
export function coefficientFromRatio(p: SdofParameters, ratio: number) {
  if (!Number.isFinite(ratio) || ratio < 0 || p.stiffness <= 0)
    throw new RangeError(
      "Damping ratio needs positive stiffness and a finite nonnegative value.",
    );
  const damping = ratio * createSdof(p).criticalDamping;
  createSdof({ ...p, damping });
  return damping;
}
