import { expect, it, vi } from "vitest";
import { bindLifecycle } from "../../src/animation/lifecycle";
import { SimulationClock } from "../../src/animation/SimulationClock";
class CountedTarget extends EventTarget {
  count = 0;
  override addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    super.addEventListener(type, callback, options);
    this.count++;
  }
  override removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ) {
    super.removeEventListener(type, callback, options);
    this.count--;
  }
}
it("mount/unmount lifecycle bindings leave no listeners and honor reduced motion", () => {
  const doc = Object.assign(new CountedTarget(), {
    hidden: false,
    hasFocus: () => true,
  });
  const win = new CountedTarget();
  const media = Object.assign(new CountedTarget(), { matches: false });
  vi.stubGlobal("document", doc);
  vi.stubGlobal("window", win);
  vi.stubGlobal("matchMedia", () => media);
  try {
    const clock = new SimulationClock({
      now: () => 0,
      request: () => 1,
      cancel: () => {},
    });
    for (let i = 0; i < 100; i++) {
      const reduced = vi.fn();
      const unbind = bindLifecycle(clock, reduced);
      expect([doc.count, win.count, media.count]).toEqual([1, 2, 1]);
      media.matches = true;
      media.dispatchEvent(new Event("change"));
      expect(clock.getState().suspended).toBe(true);
      expect(reduced).toHaveBeenLastCalledWith(true);
      media.matches = false;
      media.dispatchEvent(new Event("change"));
      expect(clock.getState().suspended).toBe(false);
      win.dispatchEvent(new Event("blur"));
      expect(clock.getState().suspended).toBe(true);
      win.dispatchEvent(new Event("focus"));
      expect(clock.getState().suspended).toBe(false);
      unbind();
      expect([doc.count, win.count, media.count]).toEqual([0, 0, 0]);
    }
    clock.dispose();
  } finally {
    vi.unstubAllGlobals();
  }
});
