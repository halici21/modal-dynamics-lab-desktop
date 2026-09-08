import type { Lens } from "../app/state";
export const modules = [
  {
    name: "SDOF",
    title: "One coordinate. A place to begin.",
    topic: "Undamped single degree of freedom",
    next: "Mass, stiffness and the origin of natural frequency.",
  },
  {
    name: "DAMPING",
    title: "How motion settles.",
    topic: "Damped single degree of freedom",
    next: "Dissipation and the three damping regimes.",
  },
  {
    name: "2DOF",
    title: "Two coordinates. One system.",
    topic: "Coupled degrees of freedom",
    next: "Coupling, coordinated motion and matrix assembly.",
  },
  {
    name: "MODES",
    title: "Patterns within motion.",
    topic: "Mode Shape Lab",
    next: "Natural frequencies, eigenvectors and normalization.",
  },
  {
    name: "MDOF",
    title: "From a pair to a chain.",
    topic: "Multiple degrees of freedom",
    next: "Small systems, modal patterns and nodal points.",
  },
  {
    name: "FREE-FREE",
    title: "Motion without restraint.",
    topic: "Free-free systems",
    next: "Rigid-body motion and the first elastic mode.",
  },
];
export const lenses: Lens[] = [
  "Motion",
  "Forces",
  "Energy",
  "Phase Space",
  "Mathematics",
];
export const lensCopy: Record<Lens, string> = {
  "Phase Space": "Position and velocity trace a closed orbit.",
  Motion: "Follow the carriage and its matching timeline marker.",
  Forces: "Force overlays arrive with the validated physical model.",
  Energy: "Kinetic and potential energy will share this same stage.",
  "Mode Shape": "Relative motion patterns arrive in the Mode Shape Lab.",
  Mathematics: "Equations will link directly to the objects they describe.",
};
