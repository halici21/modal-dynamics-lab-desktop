export interface Scheduler {
  now(): number;
  request(callback: FrameRequestCallback): number;
  cancel(id: number): void;
}
export interface PlaybackState {
  playing: boolean;
  rate: number;
  suspended: boolean;
}
export interface Diagnostics {
  fps: number;
  averageMs: number;
  recentMs: number;
  worstMs: number;
  activeLoops: number;
  subscribers: number;
  frames: number;
}
const browserScheduler: Scheduler = {
  now: () => performance.now(),
  request: (cb) => requestAnimationFrame(cb),
  cancel: (id) => cancelAnimationFrame(id),
};

/** Sole RAF owner. Semantic subscriptions never fire for continuous frames. */
export class SimulationClock {
  private time = 0;
  private anchor = 0;
  private requestId: number | null = null;
  private state: PlaybackState = { playing: false, rate: 1, suspended: false };
  private reasons = new Set<string>();
  private frames = new Set<(time: number) => void>();
  private states = new Set<() => void>();
  private jobs = new Map<unknown, () => void>();
  private intervals: number[] = [];
  private previousFrame: number | null = null;
  private frameCount = 0;
  private disposed = false;
  constructor(private scheduler: Scheduler = browserScheduler) {}
  read = () => this.time;
  getState = () => this.state;
  subscribeState = (fn: () => void) => {
    this.states.add(fn);
    return () => {
      this.states.delete(fn);
    };
  };
  subscribe = (fn: (time: number) => void) => {
    this.frames.add(fn);
    fn(this.time);
    return () => {
      this.frames.delete(fn);
    };
  };
  private emit = () => {
    for (const fn of this.frames) fn(this.time);
  };
  private publish(patch: Partial<PlaybackState>) {
    this.state = { ...this.state, ...patch };
    for (const fn of this.states) fn();
  }
  private advance(now: number) {
    if (this.state.playing && !this.state.suspended)
      this.time += (Math.max(0, now - this.anchor) * this.state.rate) / 1000;
    this.anchor = now;
  }
  private schedule() {
    if (
      !this.disposed &&
      this.requestId === null &&
      (this.jobs.size > 0 || (this.state.playing && !this.state.suspended))
    )
      this.requestId = this.scheduler.request(this.tick);
  }
  private cancel() {
    if (this.requestId !== null) this.scheduler.cancel(this.requestId);
    this.requestId = null;
    this.previousFrame = null;
  }
  private tick = (now: number) => {
    this.requestId = null;
    if (this.disposed) return;
    this.advance(now);
    if (this.previousFrame !== null) {
      this.intervals.push(now - this.previousFrame);
      if (this.intervals.length > 120) this.intervals.shift();
    }
    this.previousFrame = now;
    this.frameCount++;
    const jobs = [...this.jobs.values()];
    this.jobs.clear();
    for (const job of jobs) job();
    this.schedule();
    if (this.requestId === null) this.previousFrame = null;
    this.emit();
  };
  play = () => {
    if (this.disposed || this.state.playing) return;
    this.anchor = this.scheduler.now();
    this.publish({ playing: true });
    this.schedule();
  };
  start = this.play;
  resume = this.play;
  pause = () => {
    this.advance(this.scheduler.now());
    this.cancel();
    this.publish({ playing: false });
    this.emit();
    this.schedule();
  };
  reset = () => {
    this.cancel();
    this.jobs.clear();
    this.time = 0;
    this.anchor = this.scheduler.now();
    this.publish({ playing: false, rate: 1 });
    this.emit();
  };
  setTime = (time: number) => {
    if (!Number.isFinite(time)) return;
    this.time = Math.max(0, time);
    this.anchor = this.scheduler.now();
    this.emit();
  };
  step = (seconds = 0.1) => {
    if (!Number.isFinite(seconds)) return;
    this.pause();
    this.setTime(this.time + seconds);
  };
  setRate = (rate: number) => {
    if (![0.25, 0.5, 1, 2].includes(rate)) return;
    this.advance(this.scheduler.now());
    this.publish({ rate });
    this.emit();
  };
  suspend = (reason: string, enabled: boolean) => {
    this.advance(this.scheduler.now());
    if (enabled) this.reasons.add(reason);
    else this.reasons.delete(reason);
    const suspended = this.reasons.size > 0;
    if (suspended !== this.state.suspended) {
      this.cancel();
      this.publish({ suspended });
    }
    this.emit();
    this.schedule();
  };
  /** Input jobs share the simulation RAF; latest value wins even while paused. */
  coalesce = (key: unknown, job: () => void) => {
    if (!this.disposed) {
      this.jobs.set(key, job);
      this.schedule();
    }
  };
  cancelJob = (key: unknown) => {
    this.jobs.delete(key);
    if (!this.jobs.size && (!this.state.playing || this.state.suspended))
      this.cancel();
  };
  diagnostics = (): Diagnostics => {
    const averageMs =
      this.intervals.reduce((a, b) => a + b, 0) / (this.intervals.length || 1);
    return {
      fps: averageMs ? 1000 / averageMs : 0,
      averageMs,
      recentMs: this.intervals.at(-1) ?? 0,
      worstMs: Math.max(0, ...this.intervals),
      activeLoops: Number(this.requestId !== null),
      subscribers: this.frames.size,
      frames: this.frameCount,
    };
  };
  dispose = () => {
    this.cancel();
    this.jobs.clear();
    this.frames.clear();
    this.states.clear();
    this.disposed = true;
  };
}
