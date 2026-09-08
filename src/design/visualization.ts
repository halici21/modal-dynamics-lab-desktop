export const physicsColors = {
  displacement: "var(--displacement)",
  velocity: "var(--velocity)",
  force: "var(--force)",
  energy: "var(--energy)",
  mass: "var(--mass)",
  structure: "var(--structure)",
  focus: "var(--focus)",
} as const;

export const rendererDefaults = {
  camera: "fixed-orthographic",
  backend: "svg",
  reducedMotion: "static-shape",
} as const;
