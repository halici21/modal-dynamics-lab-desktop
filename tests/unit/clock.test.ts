import { describe, expect, it } from "vitest";
import {
  SimulationClock,
  type Scheduler,
} from "../../src/animation/SimulationClock";
class ManualScheduler implements Scheduler {
  time = 0;
  next = 0;
  callbacks = new Map<number, FrameRequestCallback>();
  now = () => this.time;
  request = (callback: FrameRequestCallback) => {
    const id = ++this.next;
    this.callbacks.set(id, callback);
    return id;
  };
  cancel = (id: number) => {
    this.callbacks.delete(id);
  };
  advance(ms: number) {
    this.time += ms;
    const callbacks = [...this.callbacks.values()];
    this.callbacks.clear();
    callbacks.forEach((fn) => fn(this.time));
  }
}
function setup() {
  const scheduler = new ManualScheduler();
  return { scheduler, clock: new SimulationClock(scheduler) };
}
describe("authoritative elapsed-time clock", () => {
  it("starts, pauses between frames, resumes without including paused wall time", () => {
    const { clock, scheduler: s } = setup();
    clock.start();
    s.advance(1200);
    expect(clock.read()).toBeCloseTo(1.2);
    s.time += 100;
    clock.pause();
    expect(clock.read()).toBeCloseTo(1.3);
    s.advance(9000);
    expect(clock.read()).toBeCloseTo(1.3);
    clock.resume();
    s.advance(200);
    expect(clock.read()).toBeCloseTo(1.5);
  });
  it("changes rates without losing elapsed time", () => {
    const { clock, scheduler: s } = setup();
    clock.play();
    s.advance(1000);
    s.time += 100;
    clock.setRate(2);
    s.advance(1000);
    expect(clock.read()).toBeCloseTo(3.1);
    clock.setRate(0.25);
    s.advance(1000);
    expect(clock.read()).toBeCloseTo(3.35);
    clock.setRate(NaN);
    expect(clock.getState().rate).toBe(0.25);
  });
  it("sets time, steps and resets deterministically", () => {
    const { clock, scheduler: s } = setup();
    clock.play();
    clock.setTime(4);
    s.advance(500);
    expect(clock.read()).toBeCloseTo(4.5);
    clock.step();
    expect(clock.read()).toBeCloseTo(4.6);
    expect(clock.getState().playing).toBe(false);
    clock.step(-100);
    expect(clock.read()).toBe(0);
    clock.setTime(Infinity);
    expect(clock.read()).toBe(0);
    clock.setRate(2);
    clock.reset();
    expect(clock.read()).toBe(0);
    expect(clock.getState()).toEqual({
      playing: false,
      rate: 1,
      suspended: false,
    });
  });
  it.each([60, 90, 120, 144])(
    "advances ten seconds independently of %i Hz rendering",
    (hz) => {
      const { clock, scheduler: s } = setup();
      clock.play();
      for (let i = 0; i < hz * 10; i++) s.advance(1000 / hz);
      expect(clock.read()).toBeCloseTo(10, 8);
    },
  );
  it("one delayed frame accounts for elapsed wall time", () => {
    const { clock, scheduler: s } = setup();
    clock.play();
    s.advance(1200);
    expect(clock.read()).toBeCloseTo(1.2);
  });
  it("1000 repeated play/pause cycles keep at most one scheduled callback", () => {
    const { clock, scheduler: s } = setup();
    for (let i = 0; i < 1000; i++) {
      clock.play();
      clock.play();
      expect(s.callbacks.size).toBe(1);
      s.advance(10);
      clock.pause();
      expect(s.callbacks.size).toBe(0);
    }
    expect(clock.read()).toBeCloseTo(10);
  });
  it("multiple suspension reasons freeze wall time and restore exactly one loop", () => {
    const { clock, scheduler: s } = setup();
    clock.play();
    s.advance(100);
    clock.suspend("hidden", true);
    clock.suspend("native", true);
    s.advance(10000);
    expect(clock.read()).toBeCloseTo(0.1);
    expect(s.callbacks.size).toBe(0);
    clock.suspend("hidden", false);
    expect(s.callbacks.size).toBe(0);
    clock.suspend("native", false);
    expect(s.callbacks.size).toBe(1);
    s.advance(100);
    expect(clock.read()).toBeCloseTo(0.2);
  });
  it("user pause while hidden wins over automatic restore", () => {
    const { clock, scheduler: s } = setup();
    clock.play();
    clock.suspend("hidden", true);
    clock.pause();
    clock.suspend("hidden", false);
    expect(s.callbacks.size).toBe(0);
  });
  it("coalesces newest input using the same RAF, including paused state", () => {
    const { clock, scheduler: s } = setup();
    let value = 0;
    for (let i = 1; i <= 200; i++)
      clock.coalesce("input", () => {
        value = i;
      });
    expect(s.callbacks.size).toBe(1);
    s.advance(16);
    expect(value).toBe(200);
    expect(s.callbacks.size).toBe(0);
    clock.coalesce("input", () => {
      value = 999;
    });
    clock.reset();
    s.advance(16);
    expect(value).toBe(200);
  });
  it("keeps semantic subscriptions out of the frame hot path", () => {
    const { clock, scheduler: s } = setup();
    let semantics = 0;
    let frames = 0;
    const stop = clock.subscribe(() => frames++);
    clock.subscribeState(() => semantics++);
    clock.play();
    for (let i = 0; i < 120; i++) s.advance(1000 / 120);
    expect(semantics).toBe(1);
    expect(frames).toBe(121);
    stop();
    expect(clock.diagnostics().subscribers).toBe(0);
  });
  it("disposes callbacks, subscribers and input jobs; a new instance can mount", () => {
    const { clock, scheduler: s } = setup();
    let calls = 0;
    clock.subscribe(() => calls++);
    clock.play();
    clock.coalesce("input", () => calls++);
    clock.dispose();
    s.advance(1000);
    expect(calls).toBe(1);
    expect(s.callbacks.size).toBe(0);
    expect(clock.diagnostics().subscribers).toBe(0);
    clock.play();
    expect(s.callbacks.size).toBe(0);
    const newClock = new SimulationClock(s);
    newClock.play();
    s.advance(1000);
    expect(newClock.read()).toBe(1);
    newClock.dispose();
  });
});
