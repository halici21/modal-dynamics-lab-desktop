/**
 * Learn / Explore / Inspect — density modes, not three apps.
 *
 * `mdl-pedagogy` owns the teaching meaning of these three names; this module
 * only encodes what each level lets the shell SHOW, so the two never drift.
 * Selection persists across a switch: changing density never clears the model
 * selection.
 */
export type Density = "learn" | "explore" | "inspect";

export const DENSITIES: { id: Density; label: string; hint: string }[] = [
  {
    id: "learn",
    label: "Learn",
    hint: "Phenomenon, one derivation step at a time, few controls.",
  },
  {
    id: "explore",
    label: "Explore",
    hint: "Parameters, playback and direct manipulation.",
  },
  {
    id: "inspect",
    label: "Inspect",
    hint: "Matrices, residuals, normalization and solver detail.",
  },
];

export interface DensityRules {
  /** Solver diagnostics: residual, Gram errors, MAC, zero tolerance. */
  diagnostics: boolean;
  /** Mode normalization and sign controls. */
  normalization: boolean;
  /** Full parameter set rather than the two that drive the current question. */
  allParameters: boolean;
  /** Matrix tabs and provenance. */
  matrices: boolean;
  /** Derivation step navigator is the dock's opening content. */
  derivationFirst: boolean;
  /** Dock height in px at first paint. */
  dockHeight: number;
}

export function rulesFor(density: Density): DensityRules {
  switch (density) {
    case "learn":
      return {
        diagnostics: false,
        normalization: false,
        allParameters: false,
        matrices: false,
        derivationFirst: true,
        dockHeight: 208,
      };
    case "explore":
      return {
        diagnostics: false,
        normalization: true,
        allParameters: true,
        matrices: true,
        derivationFirst: false,
        dockHeight: 148,
      };
    case "inspect":
      return {
        diagnostics: true,
        normalization: true,
        allParameters: true,
        matrices: true,
        derivationFirst: false,
        dockHeight: 240,
      };
  }
}
