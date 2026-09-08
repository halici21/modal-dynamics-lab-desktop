import { expect, it } from "vitest";
import { previewPosition } from "../../src/features/foundation/demo";
import { validateNumber } from "../../src/components/NumericField";
import {
  activeTokens,
  sameSelection,
  selectionForToken,
  selectionKey,
  token,
} from "../../src/studio/selection";

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

/**
 * Replaces the R2 labReducer identity test. The R3 shell has one semantic
 * selection instead of a lens/selection reducer, so the invariant that
 * survived the redesign is: a selection has a stable identity, and the token
 * grammar round-trips it.
 */
it("selection identity is stable and the token grammar round-trips", () => {
  const spring = { kind: "spring", index: 1 } as const;
  expect(selectionKey(spring)).toBe("spring:1");
  expect(sameSelection(spring, { kind: "spring", index: 1 })).toBe(true);
  expect(sameSelection(spring, { kind: "spring", index: 2 })).toBe(false);
  expect(sameSelection(null, null)).toBe(true);

  expect(selectionForToken(token.mass(0))).toEqual({ kind: "mass", index: 0 });
  expect(selectionForToken(token.spring(2))).toEqual({ kind: "spring", index: 2 });
  expect(selectionForToken(token.mode(1))).toEqual({ kind: "mode", index: 1 });
  expect(selectionForToken(token.cell("K", 0, 1))).toEqual({
    kind: "matrix",
    matrix: "K",
    row: 0,
    col: 1,
  });
});

/**
 * The live-mathematics gate: a coupling spring must light BOTH equations it
 * appears in and ALL FOUR matrix entries it populates, as one set.
 */
it("a coupling spring lights all four stiffness entries it populates", () => {
  const links = [
    { i: 0, j: null, k: 100, label: "k1" },
    { i: 0, j: 1, k: 60, label: "k2" },
    { i: 1, j: null, k: 100, label: "k3" },
  ];
  const lit = activeTokens({ kind: "spring", index: 1 }, links);
  for (const cell of [
    token.cell("K", 0, 0),
    token.cell("K", 0, 1),
    token.cell("K", 1, 0),
    token.cell("K", 1, 1),
  ])
    expect(lit.has(cell)).toBe(true);
  expect(lit.has(token.displacement(0))).toBe(true);
  expect(lit.has(token.displacement(1))).toBe(true);
});

/** The reverse direction: an off-diagonal cell resolves back to its spring. */
it("an off-diagonal stiffness entry resolves back to the coupling spring", () => {
  const links = [
    { i: 0, j: null, k: 100, label: "k1" },
    { i: 0, j: 1, k: 60, label: "k2" },
    { i: 1, j: null, k: 100, label: "k3" },
  ];
  const lit = activeTokens(
    { kind: "matrix", matrix: "K", row: 0, col: 1 },
    links,
  );
  expect(lit.has(token.spring(1))).toBe(true);
  expect(lit.has(token.spring(0))).toBe(false);
  expect(lit.has(token.spring(2))).toBe(false);
});

/** A grounded spring touches exactly one diagonal entry, never an off-diagonal. */
it("a grounded spring contributes to one diagonal entry only", () => {
  const links = [
    { i: 0, j: null, k: 100, label: "k1" },
    { i: 0, j: 1, k: 60, label: "k2" },
  ];
  const lit = activeTokens({ kind: "spring", index: 0 }, links);
  expect(lit.has(token.cell("K", 0, 0))).toBe(true);
  expect(lit.has(token.cell("K", 0, 1))).toBe(false);
  expect(lit.has(token.cell("K", 1, 1))).toBe(false);
});

/** A mass lights its own inertia term and its diagonal mass entry, nothing else. */
it("a mass links to its inertia term and its own mass-matrix entry", () => {
  const lit = activeTokens({ kind: "mass", index: 1 }, []);
  expect(lit.has(token.mass(1))).toBe(true);
  expect(lit.has(token.acceleration(1))).toBe(true);
  expect(lit.has(token.cell("M", 1, 1))).toBe(true);
  expect(lit.has(token.cell("M", 0, 0))).toBe(false);
});
