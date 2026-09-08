import { modules } from "../education/content";
import { lessonForModule } from "../education/curriculum";
import type { PedagogyProgress } from "../education/progress";
const coreModules = ["Undamped SDOF", "Damped SDOF", "2DOF", "Mode Browser / 3DOF", "MDOF", "Free-Free", "Forced SDOF", "FRF", "Base Excitation", "Participation / Effective Mass", "Spectrum fundamentals", "Random vibration", "FE modal playground"];
const groups: Array<[string, number[]]> = [["FOUNDATIONS", [0, 1, 6]], ["MULTI-DOF", [2, 3, 4, 5]], ["FREQUENCY", [7, 8]], ["MODAL", [9]], ["SPECTRA", [10, 11]], ["STRUCTURES", [12]]];
function status(index: number, active: number, progress?: PedagogyProgress) {
  const lesson = lessonForModule(index);
  return progress?.completed.includes(lesson.id) ? "Completed" : active === index ? "Current" : index === active + 1 ? "Next" : "Recommended prerequisite";
}
export function LearningTrajectory({ active, onChange, expanded = false, variant = "learning", progress }: { active: number; onChange(index: number): void; expanded?: boolean; variant?: "learning" | "full"; progress?: PedagogyProgress }) {
  const button = (index: number, name: string) => <button key={name} aria-label={String(index + 1).padStart(2, "0") + " " + name} title={name + " · " + status(index, active, progress)} aria-current={active === index ? "step" : undefined} onClick={() => onChange(index)}><span className="trajectory-number">{String(index + 1).padStart(2, "0")}</span>{expanded && <span className="trajectory-name">{name}</span>}<span className="trajectory-status-sr">{status(index, active, progress)}</span></button>;
  if (variant === "full") return <nav className="trajectory trajectory-r2" aria-label="Learning trajectory">{groups.map(([group, indexes]) => <div className="trajectory-group" key={group}>{expanded && <span className="trajectory-group-label">{group}</span>}{indexes.map((index) => button(index, coreModules[index]))}</div>)}</nav>;
  return <nav className="trajectory" aria-label="Learning trajectory">{modules.map((module, index) => button(index, module.name))}</nav>;
}
