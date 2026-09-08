/** Physical transforms never use interface/education timing. */
export const motion = {
  interfaceMs: 180,
  educationalMs: 300,
  interfaceEase: "cubic-bezier(0.2,0,0,1)",
  educationalEase: "cubic-bezier(0.4,0,0.2,1)",
} as const;
export function interruptTransitions(root: HTMLElement | null) {
  root
    ?.getAnimations({ subtree: true })
    .forEach((animation) => animation.cancel());
}
