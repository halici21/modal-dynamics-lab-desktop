import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { SimulationClock } from "../animation/SimulationClock";
/** Late listener registration is disposed if the view unmounts during the await. */
export function bindDesktop(clock: SimulationClock, onError: () => void) {
  let disposed = false;
  let unlisten: (() => void) | undefined;
  if (isTauri()) {
    const window = getCurrentWindow();
    void (async () => {
      let revision = 0;
      const remove = await window.onFocusChanged(({ payload }) => {
        revision++;
        if (!disposed) clock.suspend("native-inactive", !payload);
      });
      if (disposed) {
        remove();
        return;
      }
      unlisten = remove;
      const before = revision;
      const focused = await window.isFocused();
      if (!disposed && revision === before)
        clock.suspend("native-inactive", !focused);
    })().catch(() => {
      if (!disposed) onError();
    });
  }
  return () => {
    disposed = true;
    unlisten?.();
  };
}
