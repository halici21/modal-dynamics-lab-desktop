import { check, finite } from "./common";
export function rigid2D(points: number[][], center: number[] = [0, 0]) {
  check(
    points.length > 0 &&
      points.every((p) => p.length === 2) &&
      center.length === 2,
    "Planar points require two coordinates.",
  );
  [...points, center].forEach((p) => finite(p));
  return {
    names: ["Tx", "Ty", "Rz"],
    vectors: [
      points.flatMap(() => [1, 0]),
      points.flatMap(() => [0, 1]),
      points.flatMap(([x, y]) => [-(y - center[1]), x - center[0]]),
    ],
  };
}
export function rigid3D(points: number[][], center: number[] = [0, 0, 0]) {
  check(
    points.length > 0 &&
      points.every((p) => p.length === 3) &&
      center.length === 3,
    "Spatial points require three coordinates.",
  );
  [...points, center].forEach((p) => finite(p));
  return {
    names: ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz"],
    vectors: [
      ...[0, 1, 2].map((j) =>
        points.flatMap(() => [0, 1, 2].map((i) => +(i === j))),
      ),
      points.flatMap(([x, y, z]) => [0, -(z - center[2]), y - center[1]]),
      points.flatMap(([x, y, z]) => [z - center[2], 0, -(x - center[0])]),
      points.flatMap(([x, y, z]) => [-(y - center[1]), x - center[0], 0]),
    ],
  };
}
/** Exact finite rigid rotation (Rodrigues), for conceptual geometry only. */
export function rigidTransform(
  points: number[][],
  translation: number[],
  rotation: number[],
  center = [0, 0, 0],
) {
  check(
    points.every((p) => p.length === 3) &&
      translation.length === 3 &&
      rotation.length === 3 &&
      center.length === 3,
    "Rigid transform requires 3D coordinates.",
  );
  [...points, translation, rotation, center].forEach((p) => finite(p));
  const angle = Math.hypot(...rotation),
    u = angle ? rotation.map((v) => v / angle) : [0, 0, 0],
    c = Math.cos(angle),
    s = Math.sin(angle);
  return points.map((p) => {
    const r = p.map((x, i) => x - center[i]),
      d = r.reduce((a, x, i) => a + x * u[i], 0),
      cross = [
        u[1] * r[2] - u[2] * r[1],
        u[2] * r[0] - u[0] * r[2],
        u[0] * r[1] - u[1] * r[0],
      ];
    return r.map(
      (x, i) =>
        center[i] + translation[i] + x * c + cross[i] * s + u[i] * d * (1 - c),
    );
  });
}
