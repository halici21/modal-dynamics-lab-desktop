export type LessonMode = "learn" | "explore" | "inspect";
export type LessonPreset =
  | { kind: "sdof"; mass: number; stiffness: number; damping?: number; x0?: number; v0?: number }
  | { kind: "workspace"; module: number; lens?: string };
export type LessonStep = {
  id: string;
  label: "QUESTION" | "PREDICT" | "EXPERIMENT" | "OBSERVE" | "EXPLAIN" | "EQUATION" | "CHECK" | "CONTINUE";
  prompt: string;
  action?: string;
};
export type LessonDefinition = {
  id: string;
  chapter: number;
  chapterTitle: string;
  module: number;
  title: string;
  workspace: string;
  prerequisites: string[];
  question: string;
  objectives: string[];
  experiment: string;
  equations: string[];
  misconceptions: string[];
  checkpoint: string;
  next: string;
  preset: LessonPreset;
  steps: LessonStep[];
};

const standard = (id: string, chapter: number, chapterTitle: string, module: number, title: string, workspace: string, question: string, next: string, preset: LessonPreset, experiment: string, equations: string[], prerequisites: string[] = []): LessonDefinition => ({
  id, chapter, chapterTitle, module, title, workspace, prerequisites, question,
  objectives: ["name the physical phenomenon before using the abstraction", "predict one controlled change", "connect evidence to a validated result"],
  experiment, equations, misconceptions: ["the animation is the equation", "a displayed scale is an absolute response"], checkpoint: "State what changed, what stayed fixed, and why the result follows.", next, preset,
  steps: [
    { id: id + ":question", label: "QUESTION", prompt: question },
    { id: id + ":predict", label: "PREDICT", prompt: "Make a prediction before changing the system." },
    { id: id + ":experiment", label: "EXPERIMENT", prompt: experiment, action: "Run the controlled experiment" },
    { id: id + ":observe", label: "OBSERVE", prompt: "Watch the stage and evidence view. Scrub or step when useful." },
    { id: id + ":explain", label: "EXPLAIN", prompt: "Describe the cause in your own words before opening the deeper view." },
    { id: id + ":equation", label: "EQUATION", prompt: "Connect the observed relationship to the equation shown by the workspace." },
    { id: id + ":check", label: "CHECK", prompt: "Complete the checkpoint to mark this concept practiced." },
    { id: id + ":continue", label: "CONTINUE", prompt: "Continue to the next concept or explore this system freely." },
  ],
});

export const curriculum: LessonDefinition[] = [
  standard("sdof-undamped", 1, "Why systems vibrate", 0, "Why does the mass keep moving?", "Undamped SDOF", "What carries the mass through equilibrium after the spring pulls it back?", "Damping", { kind: "sdof", mass: 1, stiffness: 100, x0: 0.1, v0: 0 }, "Displace the mass, freeze, then release it. Change stiffness while mass stays fixed.", ["mẍ + kx = 0", "ωₙ = √(k/m)"], []),
  standard("sdof-damped", 2, "Why motion disappears", 1, "Where does the energy go?", "Damped SDOF", "Which damping returns the system fastest without overshooting?", "Forcing", { kind: "sdof", mass: 1, stiffness: 100, damping: 8, x0: 0.1, v0: 0 }, "Compare zero, light, critical and overdamped settings while observing velocity and energy.", ["Fᵈ = −cẋ", "ζ = c/(2√(km))"], ["sdof-undamped"]),
  standard("forced-sdof", 3, "What happens when we keep forcing it", 6, "When does added energy accumulate?", "Forced SDOF", "What changes as excitation frequency approaches the system frequency?", "FRF", { kind: "workspace", module: 6 }, "Sweep excitation below, near and above the natural frequency. Keep transient and steady response visible.", ["mẍ + cẋ + kx = F₀ cos Ωt", "r = Ω/ωₙ"], ["sdof-damped"]),
  standard("frf", 3, "What happens when we keep forcing it", 7, "How does a system answer different frequencies?", "FRF", "How can one input-output relationship expose resonance and phase?", "2DOF", { kind: "workspace", module: 7 }, "Select an FRF point and compare frequency, phase, stage response and numeric value.", ["H(Ω) = X/F"], ["forced-sdof"]),
  standard("two-dof", 4, "Why structures have multiple natural frequencies", 2, "Why does one extra coordinate create another frequency?", "2DOF", "What does the coupling spring contribute to each matrix entry?", "3DOF / MDOF", { kind: "workspace", module: 2 }, "Select a mass and coupling spring, then reveal their contributions to M and K.", ["Mẍ + Kx = 0", "(K − ω²M)φ = 0"], ["sdof-undamped"]),
  standard("modes", 5, "What a mode really is", 3, "What is a mode?", "Mode Browser / 3DOF", "What changes between modes: absolute size, relative shape, sign or frequency?", "Modal superposition", { kind: "workspace", module: 3, lens: "Modes" }, "Preview one mode at a time, flip its sign and switch normalization.", ["Kφ = ω²Mφ", "x = Φq"], ["two-dof"]),
  standard("mdof", 4, "Why structures have multiple natural frequencies", 4, "How does the pattern generalize?", "MDOF", "What does N coordinates imply for the constrained linear system?", "Modes", { kind: "workspace", module: 4 }, "Increase DOF count and look for nodal points and additional natural frequencies.", ["N DOFs → N modes for the standard constrained system"], ["two-dof"]),
  standard("base-excitation", 6, "How support motion excites modes", 8, "What if the support moves?", "Base Excitation", "Which motion is absolute and which is relative when the ground moves?", "Participation", { kind: "workspace", module: 8 }, "Move the base and compare support, relative and absolute response.", ["x = y + z"], ["forced-sdof"]),
  standard("participation", 6, "How support motion excites modes", 9, "Why do some modes participate more?", "Participation / Effective Mass", "How does the excitation direction select modal content?", "Free-Free", { kind: "workspace", module: 9, lens: "Participation" }, "Change the influence direction and compare Γᵢ, effective mass and cumulative mass.", ["Γᵢ = (φᵢᵀMr)/(φᵢᵀMφᵢ)"], ["modes", "base-excitation"]),
  standard("free-free", 7, "What happens when nothing is fixed", 5, "What does zero frequency mean physically?", "Free-Free", "Which modes move the whole body without strain?", "Response spectrum", { kind: "workspace", module: 5, lens: "Rigid basis" }, "Switch between rigid-body and elastic patterns and inspect the zero modes.", ["KφRB = 0", "fRB ≈ 0"], ["modes"]),
  standard("response-spectrum", 8, "How real environments are represented", 10, "How can one record summarize many oscillators?", "Response Spectrum", "Why does a record become a family of oscillator maxima?", "Random vibration", { kind: "workspace", module: 10, lens: "Spectrum" }, "Edit the acceleration record and compare maxima across oscillator periods.", ["record → oscillator family → maximum response"], ["sdof-damped"]),
  standard("random-vibration", 8, "How real environments are represented", 11, "How do we describe excitation statistically?", "Random Vibration", "How does input PSD pass through a system FRF to output variance?", "FEM Modal", { kind: "workspace", module: 11, lens: "PSD" }, "Change force PSD level and bandwidth, then compare output PSD and RMS.", ["Sₓ = |H|²Sᶠ"], ["frf"]),
  standard("fem-modal", 9, "How continuous structures become matrices", 12, "How does a beam become an eigenproblem?", "FE Modal", "Where do element matrices enter the global modal model?", "Independent FEM interpretation", { kind: "workspace", module: 12, lens: "Modes" }, "Refine the mesh, select an element, inspect its DOFs and compare frequency convergence.", ["Kₑ, Mₑ → assembly → Kφ = ω²Mφ"], ["modes", "mdof"]),
];

export const curriculumByModule = Object.fromEntries(curriculum.map((lesson) => [lesson.module, lesson])) as Record<number, LessonDefinition>;
export const lessonForModule = (module: number) => curriculumByModule[module] ?? curriculum[0];
export const curriculumChapters = Array.from(new Map(curriculum.map((lesson) => [lesson.chapter, lesson.chapterTitle])).entries()).map(([number, title]) => ({ number, title }));

