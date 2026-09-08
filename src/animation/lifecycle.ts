import type { SimulationClock } from "./SimulationClock";
export function bindLifecycle(
  clock: SimulationClock,
  onReduced: (value: boolean) => void,
) {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const visibility = () => clock.suspend("hidden", document.hidden);
  const blur = () => clock.suspend("inactive", true);
  const focus = () => clock.suspend("inactive", false);
  const reduced = () => {
    clock.suspend("reduced-motion", media.matches);
    onReduced(media.matches);
  };
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("blur", blur);
  window.addEventListener("focus", focus);
  media.addEventListener("change", reduced);
  visibility();
  reduced();
  clock.suspend("inactive", !document.hasFocus());
  return () => {
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("blur", blur);
    window.removeEventListener("focus", focus);
    media.removeEventListener("change", reduced);
  };
}
