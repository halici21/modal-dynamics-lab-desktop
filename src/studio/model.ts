/**
 * Modal Dynamics Studio — the semantic model.
 *
 * Turns whatever the frozen physics engine assembled for the active study into
 * the object graph the Model Browser, Property Manager and Live Mathematics
 * all read. It mirrors the solver's own objects (masses, links, DOFs, modes,
 * nodes, elements, constraints); it never invents a UI-only taxonomy
 * (`mdl-cad-workbench`, COMSOL precedent).
 */
import type { Modal } from "../physics/modal";
import type { System } from "../physics/systems";
import type { assembleFE } from "../physics/fem";
import { token, type LinkRef, type StudioSelection } from "./selection";

export type StageKind = "sdof" | "chain" | "fe" | "rigid";

export type DockTab =
  | "Equations"
  | "Response"
  | "Forces"
  | "Energy"
  | "Phase"
  | "Matrices"
  | "Modes"
  | "FRF"
  | "Spectrum"
  | "PSD"
  | "Assembly"
  | "Results";

export interface Study {
  /** Index into the frozen CORE_NAMES module numbering — physics unchanged. */
  module: number;
  name: string;
  group: string;
  summary: string;
  stage: StageKind;
  tabs: DockTab[];
  tools: string[];
  derivation: string | null;
}

const SELECT_TOOLS = ["Select", "Force", "Energy", "Equation", "Measure"];
const MODE_TOOLS = ["Select", "Mode", "Normalize", "Scale", "Inspect"];
const FE_TOOLS = ["Select", "Nodes", "Elements", "Constraints", "Mesh", "Modes"];

/**
 * Thirteen studies, grouped by the physical question they answer rather than
 * numbered 01..13. A numbered marker is only honest when the content is a
 * sequence; this is a catalogue (`frontend-design`).
 */
export const STUDIES: Study[] = [
  {
    module: 0,
    name: "Undamped SDOF",
    group: "Single degree of freedom",
    summary: "One coordinate, one natural frequency.",
    stage: "sdof",
    tabs: ["Equations", "Response", "Forces", "Energy", "Phase"],
    tools: SELECT_TOOLS,
    derivation: "sdof-undamped",
  },
  {
    module: 1,
    name: "Damped SDOF",
    group: "Single degree of freedom",
    summary: "One coordinate. Three ways to return.",
    stage: "sdof",
    tabs: ["Equations", "Response", "Forces", "Energy", "Phase"],
    tools: SELECT_TOOLS,
    derivation: "sdof-damped",
  },
  {
    module: 6,
    name: "Forced SDOF",
    group: "Single degree of freedom",
    summary: "Transient plus steady state under harmonic forcing.",
    stage: "chain",
    tabs: ["Equations", "Response", "Forces", "Results"],
    tools: SELECT_TOOLS,
    derivation: "sdof-forced",
  },
  {
    module: 2,
    name: "2DOF",
    group: "Coupled systems",
    summary: "Two coordinates, one coupling spring, two modes.",
    stage: "chain",
    tabs: ["Equations", "Assembly", "Matrices", "Modes", "Response"],
    tools: SELECT_TOOLS,
    derivation: "twodof",
  },
  {
    module: 3,
    name: "Mode Browser / 3DOF",
    group: "Coupled systems",
    summary: "Three coordinates; inspect one mode at a time.",
    stage: "chain",
    tabs: ["Equations", "Modes", "Matrices", "Response"],
    tools: MODE_TOOLS,
    derivation: "mdof",
  },
  {
    module: 4,
    name: "MDOF",
    group: "Coupled systems",
    summary: "Up to ten coordinates; N DOFs give N modal directions.",
    stage: "chain",
    tabs: ["Equations", "Modes", "Matrices", "Response"],
    tools: MODE_TOOLS,
    derivation: "mdof",
  },
  {
    module: 5,
    name: "Free-Free",
    group: "Coupled systems",
    summary: "No support. Rigid-body modes at zero frequency.",
    stage: "rigid",
    tabs: ["Equations", "Modes", "Matrices", "Results"],
    tools: MODE_TOOLS,
    derivation: "free-free",
  },
  {
    module: 7,
    name: "FRF",
    group: "Frequency domain",
    summary: "Output per unit input across a frequency sweep.",
    stage: "chain",
    tabs: ["Equations", "FRF", "Modes", "Response"],
    tools: SELECT_TOOLS,
    derivation: null,
  },
  {
    module: 8,
    name: "Base excitation",
    group: "Frequency domain",
    summary: "Absolute and relative response to a moving support.",
    stage: "chain",
    tabs: ["Equations", "FRF", "Response", "Results"],
    tools: SELECT_TOOLS,
    derivation: null,
  },
  {
    module: 9,
    name: "Participation / effective mass",
    group: "Frequency domain",
    summary: "How much each mode matters for one input direction.",
    stage: "chain",
    tabs: ["Equations", "Results", "Modes", "Matrices"],
    tools: MODE_TOOLS,
    derivation: null,
  },
  {
    module: 10,
    name: "Spectrum fundamentals",
    group: "Records and randomness",
    summary: "Maxima of an elastic oscillator over a record.",
    stage: "chain",
    tabs: ["Spectrum", "Response", "Equations"],
    tools: SELECT_TOOLS,
    derivation: null,
  },
  {
    module: 11,
    name: "Random vibration",
    group: "Records and randomness",
    summary: "Output density and RMS from an input density.",
    stage: "chain",
    tabs: ["PSD", "FRF", "Equations"],
    tools: SELECT_TOOLS,
    derivation: null,
  },
  {
    module: 12,
    name: "FE modal playground",
    group: "Finite elements",
    summary: "Element matrices assembled into a global modal model.",
    stage: "fe",
    tabs: ["Equations", "Assembly", "Matrices", "Modes", "Response"],
    tools: FE_TOOLS,
    derivation: "fem",
  },
];

export const studyFor = (module: number) =>
  STUDIES.find((s) => s.module === module) ?? STUDIES[0];

export const STUDY_GROUPS = [...new Set(STUDIES.map((s) => s.group))];

/* ------------------------------------------------------------------ */
/* Browser tree                                                        */
/* ------------------------------------------------------------------ */

export interface TreeNode {
  id: string;
  label: string;
  /** Secondary value, rendered muted beside the name rather than glued on. */
  detail?: string;
  kind: string;
  token?: string;
  selection: StudioSelection;
  depth: number;
}

export interface TreeGroup {
  id: string;
  label: string;
  nodes: TreeNode[];
  /** Collapsed by default when a group is long (Inspire precedent). */
  collapsible: boolean;
}

const FIXED = { collapsible: false };

/**
 * Build the semantic tree for a chain / SDOF study straight from the assembled
 * `System` (its `links` array is the solver's own object list).
 */
export function chainTree(
  system: System,
  modal: Modal | undefined,
  study: Study,
  extras: { x0: number[]; v0: number[]; damped: boolean },
): TreeGroup[] {
  const links = (system.links ?? []) as LinkRef[];
  const groups: TreeGroup[] = [];
  const model: TreeNode[] = [];
  const grounded = links.filter((l) => l.j === null);

  grounded.forEach((l, gi) => {
    if (l.i === 0)
      model.push({
        id: "ground-0",
        label: "Ground",
        kind: "Support",
        token: token.ground(gi),
        selection: { kind: "ground", index: gi },
        depth: 1,
      });
  });

  const n = system.M.length;
  for (let i = 0; i < n; i++) {
    links.forEach((l, li) => {
      const before =
        (l.j === null && l.i === i && i === 0) || (l.j === i && l.i === i - 1);
      if (before)
        model.push({
          id: `spring-${li}`,
          label: l.label ?? "k" + (li + 1),
          detail: `${l.k} N/m`,
          kind: "Spring",
          token: token.spring(li),
          selection: { kind: "spring", index: li },
          depth: 1,
        });
    });
    model.push({
      id: `mass-${i}`,
      label: `m${i + 1}`,
      detail: `${system.M[i][i]} kg`,
      kind: "Mass",
      token: token.mass(i),
      selection: { kind: "mass", index: i },
      depth: 1,
    });
    if (extras.damped && system.C[i]?.[i])
      model.push({
        id: `damper-${i}`,
        label: `c${i + 1}`,
        kind: "Damper",
        token: token.damper(i),
        selection: { kind: "damper", index: i },
        depth: 1,
      });
  }
  links.forEach((l, li) => {
    if (l.j === null && l.i === n - 1 && n > 0 && l.i !== 0)
      model.push(
        {
          id: `spring-${li}`,
          label: l.label ?? "k" + (li + 1),
          detail: `${l.k} N/m`,
          kind: "Spring",
          token: token.spring(li),
          selection: { kind: "spring", index: li },
          depth: 1,
        },
        {
          id: `ground-${li}`,
          label: "Ground",
          kind: "Support",
          token: token.ground(li),
          selection: { kind: "ground", index: li },
          depth: 1,
        },
      );
  });

  groups.push({ id: "model", label: "Model", nodes: model, ...FIXED });

  groups.push({
    id: "state",
    label: "Initial state",
    collapsible: true,
    nodes: system.M.map((_, i) => ({
      id: `dof-${i}`,
      label: system.labels[i],
      detail: `x₀ ${extras.x0[i] ?? 0}, v₀ ${extras.v0[i] ?? 0}`,
      kind: "DOF",
      token: token.displacement(i),
      selection: { kind: "dof", index: i } as StudioSelection,
      depth: 1,
    })),
  });

  if (modal)
    groups.push({
      id: "study",
      label: `Study: ${study.name}`,
      collapsible: modal.modes.length > 6,
      nodes: modal.modes.map((m, i) => ({
        id: `mode-${i}`,
        label: `Mode ${i + 1}`,
        detail: `${m.frequency.toFixed(4)} Hz${m.kind === "zero" ? ", rigid" : ""}`,
        kind: "Mode",
        token: token.mode(i),
        selection: { kind: "mode", index: i } as StudioSelection,
        depth: 1,
      })),
    });

  groups.push({
    id: "matrices",
    label: "Matrices",
    collapsible: true,
    nodes: (["M", "C", "K"] as const).map((m) => ({
      id: `matrix-${m}`,
      label: m,
      detail: `${system.M.length}×${system.M.length}`,
      kind: "Matrix",
      selection: { kind: "matrix", matrix: m, row: 0, col: 0 } as StudioSelection,
      depth: 1,
    })),
  });

  return groups;
}

/** FE tree: geometry, properties, constraints, study, matrices. */
export function feTree(
  assembly: ReturnType<typeof assembleFE>,
  modal: Modal | undefined,
  kind: string,
): TreeGroup[] {
  const groups: TreeGroup[] = [
    {
      id: "geometry-nodes",
      label: "Geometry · Nodes",
      collapsible: assembly.nodes.length > 6,
      nodes: assembly.nodes.map((p, i) => ({
        id: `node-${i}`,
        label: `Node ${i + 1}`,
        detail: `(${p[0].toFixed(3)}, ${p[1].toFixed(3)}) m`,
        kind: "Node",
        token: token.node(i),
        selection: { kind: "node", index: i } as StudioSelection,
        depth: 1,
      })),
    },
    {
      id: "geometry-elements",
      label: "Geometry · Elements",
      collapsible: assembly.elementData.length > 6,
      nodes: assembly.elementData.map((e, i) => ({
        id: `element-${i}`,
        label: `${kind} ${i + 1}`,
        detail: `nodes ${e.nodes[0] + 1}–${e.nodes[1] + 1}, L ${e.L.toFixed(3)} m`,
        kind: "Element",
        token: token.element(i),
        selection: { kind: "element", index: i } as StudioSelection,
        depth: 1,
      })),
    },
    {
      id: "properties",
      label: "Material and section",
      collapsible: true,
      nodes: [
        {
          id: "material",
          label: "Material",
          detail: `E ${assembly.elementData[0].material.E.toExponential(1)} Pa, ρ ${assembly.elementData[0].material.rho} kg/m³`,
          kind: "Material",
          selection: { kind: "element", index: 0 } as StudioSelection,
          depth: 1,
        },
        {
          id: "section",
          label: "Section",
          detail: `A ${assembly.elementData[0].section.A} m², I ${assembly.elementData[0].section.I.toExponential(0)} m⁴`,
          kind: "Section",
          selection: { kind: "element", index: 0 } as StudioSelection,
          depth: 1,
        },
      ],
    },
    {
      id: "constraints",
      label: "Constraints",
      collapsible: false,
      nodes: assembly.fixed.length
        ? assembly.fixed.map((d) => ({
            id: `fixed-${d}`,
            label: assembly.labels[d],
            detail: "fixed",
            kind: "Support",
            selection: {
              kind: "node",
              index: Math.floor(d / assembly.perNode),
            } as StudioSelection,
            depth: 1,
          }))
        : [
            {
              id: "unconstrained",
              label: "No essential constraint",
              detail: "free-free",
              kind: "Support",
              selection: null,
              depth: 1,
            },
          ],
    },
  ];
  if (modal)
    groups.push({
      id: "study",
      label: "Study · Modal",
      collapsible: modal.modes.length > 6,
      nodes: modal.modes.map((m, i) => ({
        id: `mode-${i}`,
        label: `Mode ${i + 1}`,
        detail: `${m.frequency.toFixed(4)} Hz${m.kind === "zero" ? ", rigid" : ""}`,
        kind: "Mode",
        token: token.mode(i),
        selection: { kind: "mode", index: i } as StudioSelection,
        depth: 1,
      })),
    });
  groups.push({
    id: "matrices",
    label: "Matrices",
    collapsible: true,
    nodes: (["M", "K"] as const).map((m) => ({
      id: `matrix-${m}`,
      label: `Reduced ${m}`,
      detail: `${assembly.system.M.length}×${assembly.system.M.length}`,
      kind: "Matrix",
      selection: { kind: "matrix", matrix: m, row: 0, col: 0 } as StudioSelection,
      depth: 1,
    })),
  });
  return groups;
}
