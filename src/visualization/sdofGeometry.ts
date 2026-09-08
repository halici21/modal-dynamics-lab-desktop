import type { SdofSolution } from "../physics/sdof";
export const clamp = (x: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, x));
export function stageExtent(s: SdofSolution) {
  return Math.max(
    0.12,
    s.amplitude ?? Math.max(Math.abs(s.parameters.x0), Math.abs(s.sample(8).x)),
  );
}
export function springPath(end: number) {
  const start = 130,
    lead = 18,
    length = end - start - 2 * lead;
  return (
    "M" +
    start +
    " 190 L" +
    (start + lead) +
    " 190 " +
    Array.from(
      { length: 17 },
      (_, i) =>
        "L" +
        (start + lead + (length * i) / 16) +
        " " +
        (i === 0 || i === 16 ? 190 : i % 2 ? 177 : 203),
    ).join(" ") +
    " L" +
    end +
    " 190"
  );
}
export function arrowPath(start: number, end: number, y: number) {
  if (Math.abs(end - start) < 0.05) return "";
  const direction = Math.sign(end - start);
  return `M${start} ${y}H${end}M${end - direction * 7} ${y - 5}L${end} ${y}L${end - direction * 7} ${y + 5}`;
}
export const format = (value: number, digits = 4) =>
  Math.abs(value) < 1e-10
    ? "0"
    : Math.abs(value) >= 1e5 || Math.abs(value) < 0.0001
      ? value.toExponential(3)
      : value.toFixed(digits);
