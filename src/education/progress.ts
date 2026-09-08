import { useCallback, useEffect, useRef, useState } from "react";
import type { LessonMode } from "./curriculum";

export const PEDAGOGY_PROGRESS_KEY = "modal-dynamics-lab:pedagogy:v1";
export type ProgressStatus = "introduced" | "practiced" | "connected";
export type PedagogyProgress = {
  version: 1;
  started: string[];
  completed: string[];
  statuses: Record<string, ProgressStatus>;
  lastLessonId: string | null;
  lastWorkspace: number;
  mode: LessonMode;
};
export const emptyProgress = (): PedagogyProgress => ({ version: 1, started: [], completed: [], statuses: {}, lastLessonId: null, lastWorkspace: 0, mode: "explore" });
function normalize(value: unknown): PedagogyProgress {
  if (!value || typeof value !== "object") return emptyProgress();
  const raw = value as Partial<PedagogyProgress>;
  const statuses = raw.statuses && typeof raw.statuses === "object" ? raw.statuses : {};
  return {
    version: 1,
    started: Array.isArray(raw.started) ? raw.started.filter((x): x is string => typeof x === "string") : [],
    completed: Array.isArray(raw.completed) ? raw.completed.filter((x): x is string => typeof x === "string") : [],
    statuses: Object.fromEntries(Object.entries(statuses).filter(([, status]) => status === "introduced" || status === "practiced" || status === "connected")) as Record<string, ProgressStatus>,
    lastLessonId: typeof raw.lastLessonId === "string" ? raw.lastLessonId : null,
    lastWorkspace: typeof raw.lastWorkspace === "number" && Number.isFinite(raw.lastWorkspace) ? raw.lastWorkspace : 0,
    mode: raw.mode === "learn" || raw.mode === "inspect" || raw.mode === "explore" ? raw.mode : "explore",
  };
}
export function readPedagogyProgress(storage: Storage | undefined = typeof window === "undefined" ? undefined : window.localStorage): PedagogyProgress {
  if (!storage) return emptyProgress();
  try { return normalize(JSON.parse(storage.getItem(PEDAGOGY_PROGRESS_KEY) ?? "null")); } catch { return emptyProgress(); }
}
export function writePedagogyProgress(progress: PedagogyProgress, storage: Storage | undefined = typeof window === "undefined" ? undefined : window.localStorage): void {
  try { storage?.setItem(PEDAGOGY_PROGRESS_KEY, JSON.stringify(progress)); } catch { /* offline/private storage can reject writes */ }
}
export function usePedagogyProgress(workspace: number) {
  const [progress, setProgress] = useState<PedagogyProgress>(() => readPedagogyProgress());
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (progress.lastWorkspace !== workspace) setProgress((current) => ({ ...current, lastWorkspace: workspace }));
  }, [workspace]);
  useEffect(() => writePedagogyProgress(progress), [progress]);
  const update = useCallback((patch: (current: PedagogyProgress) => PedagogyProgress) => setProgress((current) => patch(current)), []);
  const start = useCallback((lessonId: string, mode: LessonMode = "learn") => update((current) => ({ ...current, mode, lastLessonId: lessonId, started: current.started.includes(lessonId) ? current.started : [...current.started, lessonId], statuses: { ...current.statuses, [lessonId]: current.statuses[lessonId] ?? "introduced" } })), [update]);
  const complete = useCallback((lessonId: string) => update((current) => ({ ...current, completed: current.completed.includes(lessonId) ? current.completed : [...current.completed, lessonId], statuses: { ...current.statuses, [lessonId]: "connected" } })), [update]);
  const practice = useCallback((lessonId: string) => update((current) => ({ ...current, statuses: { ...current.statuses, [lessonId]: "practiced" } })), [update]);
  const setMode = useCallback((mode: LessonMode) => update((current) => ({ ...current, mode })), [update]);
  return { progress, start, practice, complete, setMode, update };
}



