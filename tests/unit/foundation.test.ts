import { expect, it } from "vitest";
import { previewPosition } from "../../src/features/foundation/demo";
import { validateNumber } from "../../src/components/NumericField";
import { initialState, labReducer } from "../../src/app/state";
it("preview calibration endpoints are deterministic, bounded and periodic", () => {
  expect([0, 2, 4, 6, 8].map((t) => previewPosition(t, 65))).toEqual([
    0, 65, 0, -65, 0,
  ]);
  for (let i = 0; i < 1000; i++)
    expect(Math.abs(previewPosition(i / 7, 100))).toBeLessThanOrEqual(100);
});
it("numeric input rejects empty and nonfinite data, clamps finite bounds", () => {
  for (const raw of ["", " ", "NaN", "Infinity", "bad", "1e999"])
    expect(validateNumber(raw, 0, 100)).toBeNull();
  expect(validateNumber("-2", 0, 100)).toBe(0);
  expect(validateNumber("200", 0, 100)).toBe(100);
  expect(validateNumber("23.5", 0, 100)).toBe(23.5);
});
it("lenses preserve object identity and module transitions clear incompatible inspection", () => {
  const selected = labReducer(initialState, {
    type: "select",
    value: { kind: "series", id: "trace-01", objectId: "carriage-01" },
  });
  expect(
    labReducer(selected, { type: "lens", value: "Energy" }).selection,
  ).toEqual(selected.selection);
  expect(
    labReducer(selected, { type: "module", value: 2 }).selection,
  ).toBeNull();
});
