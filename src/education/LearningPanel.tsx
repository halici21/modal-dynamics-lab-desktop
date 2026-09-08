import { useEffect, useMemo, useState } from "react";
import type { LessonDefinition, LessonMode } from "./curriculum";
import type { PedagogyProgress } from "./progress";

const modes: Array<[LessonMode, string, string]> = [
  ["learn", "Learn", "guided sequence"],
  ["explore", "Explore", "open experiment"],
  ["inspect", "Inspect", "technical depth"],
];
const predictions = ["Slower", "Same", "Faster"];

export function LearningPanel({
  lesson,
  mode,
  progress,
  firstRun,
  onMode,
  onStart,
  onPractice,
  onComplete,
  onSkip,
  onRestart,
  onExplore,
  onExperiment,
  onModule,
  onLens,
}: {
  lesson: LessonDefinition;
  mode: LessonMode;
  progress: PedagogyProgress;
  firstRun: boolean;
  onMode(mode: LessonMode): void;
  onStart(): void;
  onPractice(): void;
  onComplete(): void;
  onSkip(): void;
  onRestart(): void;
  onExplore(): void;
  onExperiment(preset: LessonDefinition["preset"]): void;
  onModule(module: number): void;
  onLens(lens: string): void;
}) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [experimentRun, setExperimentRun] = useState(false);
  const completed = progress.completed.includes(lesson.id);
  useEffect(() => { setActive(false); setStep(0); setPrediction(null); setExperimentRun(false); }, [lesson.id]);
  const status = useMemo(() => progress.statuses[lesson.id] ?? (completed ? "connected" : "introduced"), [completed, lesson.id, progress.statuses]);
  const start = () => { setActive(true); setStep(0); setPrediction(null); setExperimentRun(false); onStart(); };
  const runExperiment = () => { onExperiment(lesson.preset); setExperimentRun(true); setStep(Math.max(2, step)); onPractice(); };
  const continueLesson = () => {
    if (step >= 6) { onComplete(); setStep(7); return; }
    setStep((current) => Math.min(7, current + 1));
  };
  return (
    <section className={`learning-surface learning-${mode}`} aria-label="Learning depth">
      <div className="learning-header">
        <div className="learning-mode-switch" role="group" aria-label="Learning mode">
          {modes.map(([value, label, hint]) => <button key={value} className={mode === value ? "active" : ""} aria-label={value === "inspect" ? "Technical depth" : undefined} aria-pressed={mode === value} title={hint} onClick={() => onMode(value)}>{label}</button>)}
        </div>
        <div className="learning-status" aria-label="Course progress"><span>{lesson.chapter}. {lesson.chapterTitle}</span><span className={`learning-state state-${status}`}>{status}</span></div>
      </div>
      {mode === "explore" && (
        <div className="learning-compact"><div><strong>{firstRun ? "Why does this system keep moving?" : "Explore freely"}</strong><span>{firstRun ? lesson.question + " The stage is live; start a guided lesson when you are ready." : "All controls, scrubbing and plots remain available. The next suggested concept is " + lesson.next + "."}</span></div><div className="learning-actions"><button onClick={start}>Start guided lesson</button>{!firstRun && progress.lastWorkspace !== lesson.module && <button className="quiet" onClick={() => onModule(progress.lastWorkspace)}>Resume last workspace</button>}</div></div>
      )}
      {mode === "inspect" && (
        <div className="learning-compact"><div><strong>Inspect the model</strong><span>Use equations, matrices, residuals, modes and evidence in the existing workspace.</span></div><button onClick={onExplore}>Return to Explore</button><button onClick={start}>Start guided lesson</button></div>
      )}
      {mode === "learn" && !active && !completed && (
        <div className="learning-compact learning-invitation">
          <div><span className="eyebrow">NEXT QUESTION</span><strong>{lesson.question}</strong><span>{firstRun ? "The system is already moving. Start with a short guided experiment or explore freely." : lesson.objectives[0] + "."}</span></div>
          <div className="learning-actions"><button onClick={start}>{firstRun ? "Start guided lesson" : "Resume lesson"}</button><button className="quiet" onClick={onExplore}>Explore freely</button></div>
        </div>
      )}
      {mode === "learn" && !active && completed && (
        <div className="learning-compact"><div><span className="eyebrow">CONNECTED</span><strong>{lesson.title}</strong><span>You can revisit the experiment or continue to {lesson.next}.</span></div><div className="learning-actions"><button onClick={start}>Restart lesson</button><button className="quiet" onClick={onExplore}>Explore freely</button></div></div>
      )}
      {mode === "learn" && active && (
        <div className="lesson-card">
          <div className="lesson-meta"><span>LESSON {lesson.id}</span><span>STEP {Math.min(step + 1, 8)}/8</span></div>
          <h2>{lesson.steps[step].label}</h2>
          <p className="lesson-question">{lesson.steps[step].prompt}</p>
          {step === 1 && <div className="prediction-options" role="group" aria-label="Prediction"><span>What do you predict?</span>{predictions.map((option) => <button key={option} aria-pressed={prediction === option} className={prediction === option ? "selected" : ""} onClick={() => setPrediction(option)}>{option}</button>)}</div>}
          {step === 2 && <div className="lesson-experiment"><span>{lesson.experiment}</span><button onClick={runExperiment}>{experimentRun ? "Experiment applied" : "Run the controlled experiment"}</button></div>}
          {step === 5 && <div className="lesson-equation"><span>Connect to the workspace evidence</span><code>{lesson.equations.join("   ·   ")}</code></div>}
          {step === 6 && <div className="lesson-check"><span>{lesson.checkpoint}</span><button onClick={onComplete}>Mark checkpoint complete</button></div>}
          {step === 7 && <div className="lesson-next"><span>Next concept: {lesson.next}</span><button onClick={() => { const next = lesson.module === 0 ? 1 : lesson.module === 1 ? 6 : lesson.module === 6 ? 7 : lesson.module === 7 ? 2 : lesson.module === 2 ? 4 : lesson.module === 4 ? 3 : lesson.module === 3 ? 8 : lesson.module === 8 ? 9 : lesson.module === 9 ? 5 : lesson.module === 5 ? 10 : lesson.module === 10 ? 11 : lesson.module === 11 ? 12 : 0; onModule(next); onRestart(); }}>Continue to next workspace</button></div>}
          <div className="lesson-controls"><button onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</button>{step < 6 && <button onClick={continueLesson} disabled={step === 1 && !prediction || step === 2 && !experimentRun}>{step === 1 ? "Observe" : step === 2 ? "Explain" : "Continue"}</button>}{step === 6 && <button onClick={() => { onComplete(); setStep(7); }}>Continue</button>}<button className="quiet" onClick={onSkip}>Skip lesson</button><button className="quiet" onClick={onRestart}>Restart</button></div>
        </div>
      )}
    </section>
  );
}





