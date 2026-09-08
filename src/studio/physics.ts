/**
 * Modal Dynamics Studio — the single call into the frozen physics engine.
 *
 * This module CALLS the validated solvers; it contains no numerical method of
 * its own. Every value the studio displays enters here and nowhere else, so
 * "displayed formulas and computed values come from the same model"
 * (`AGENTS.md` §7) stays checkable in one place.
 */
import { assembleFE, solveFE, uniformFE, type ElementKind, type FEModel } from "../physics/fem";
import { forcedSdof } from "../physics/dynamics";
import { baseResponse, cx } from "../physics/frequency";
import { modalResponse, normalize, solveModal, type Modal } from "../physics/modal";
import { createSdof, type SdofParameters, type SdofSolution } from "../physics/sdof";
import { chain, rayleigh, type Boundary, type System } from "../physics/systems";

export interface Snapshot {
  x: number[];
  v: number[];
  a: number[];
  energy: number;
}

export interface Sampler {
  sample(t: number): Snapshot;
  horizon: number;
  label: string;
  /** True when the amplitude is a visualization choice, not a response. */
  visual: boolean;
  energyMeaningful: boolean;
}

export interface StudioPhysics {
  system?: System;
  modal?: Modal;
  sdof?: SdofSolution;
  assembly?: ReturnType<typeof assembleFE>;
  feModel?: FEModel;
  sampler?: Sampler;
  error: string;
}

export interface StudioInputs {
  module: number;
  stage: "sdof" | "chain" | "fe" | "rigid";
  sdof: SdafInput;
  n: number;
  masses: number[];
  springs: number[];
  boundary: Boundary;
  alpha: number;
  beta: number;
  sdofC: number;
  x0: number[];
  v0: number[];
  mask: boolean[];
  preview: boolean;
  mode: number;
  amplitude: number;
  sign: 1 | -1;
  force: number;
  omega: number;
  forcePhase: number;
  forcing: "harmonic" | "constant";
  baseAmplitude: number;
  element: ElementKind;
  mesh: number;
  feBoundary: "cantilever" | "fixed-fixed" | "pinned" | "free-free";
  angle: number;
  rigidDof: number;
}

export type SdafInput = SdofParameters;

export function solveStudio(input: StudioInputs): StudioPhysics {
  try {
    if (input.stage === "sdof") {
      const params: SdofParameters =
        input.module === 1
          ? input.sdof
          : (({ damping: _drop, ...rest }) => rest)(input.sdof);
      const sdof = createSdof(params);
      return {
        sdof,
        error: "",
        sampler: {
          horizon: sdof.horizon,
          visual: false,
          energyMeaningful: true,
          label:
            input.module === 1
              ? sdof.regime
              : sdof.omega
                ? "Undamped free response"
                : "Zero stiffness · free translation",
          sample(t) {
            const s = sdof.sample(t);
            return { x: [s.x], v: [s.v], a: [s.a], energy: s.total };
          },
        },
      };
    }

    const feModel =
      input.stage === "fe"
        ? uniformFE(
            input.element,
            input.mesh,
            input.feBoundary,
            1,
            input.element === "frame" ? input.angle : 0,
          )
        : undefined;
    const assembly = feModel ? assembleFE(feModel) : undefined;
    const expand = feModel ? solveFE(feModel).expand : undefined;

    let system: System =
      assembly?.system ??
      chain(
        input.masses.slice(0, input.n),
        input.springs.slice(0, input.n + 1),
        input.boundary,
      );
    system = {
      ...system,
      C:
        input.module === 6
          ? [[input.sdofC]]
          : rayleigh(system.M, system.K, input.alpha, input.beta),
    };
    const modal = solveModal(system);
    const count = system.M.length;
    const chosen = Math.min(input.mode, count - 1);
    const highest = Math.max(
      1,
      ...modal.modes.map((m) => m.omega),
      input.module === 6 || input.module === 8 ? input.omega : 0,
    );
    const horizon = Math.min(
      8,
      32 /
        (input.preview
          ? Math.max(1, modal.modes[chosen].omega)
          : highest),
    );

    let sampler: Sampler | undefined;

    if (input.module === 6) {
      const forced = forcedSdof(
        {
          mass: system.M[0][0],
          stiffness: system.K[0][0],
          damping: input.sdofC,
          x0: input.x0[0] ?? 0,
          v0: input.v0[0] ?? 0,
        },
        input.forcing === "constant"
          ? { kind: "constant", value: input.force }
          : {
              kind: "harmonic",
              amplitude: input.force,
              omega: input.omega,
              phase: input.forcePhase,
            },
      );
      sampler = {
        horizon,
        visual: false,
        energyMeaningful: true,
        label: forced.boundedSteadyState
          ? "Forced total response · transient + steady"
          : "No bounded steady state · analytical growth",
        sample(t) {
          const q = forced.sample(t);
          return { x: [q.x], v: [q.v], a: [q.a], energy: q.energy };
        },
      };
    } else if (input.module === 8) {
      try {
        const response = baseResponse(system, input.omega, cx(input.baseAmplitude));
        sampler = {
          horizon,
          visual: false,
          energyMeaningful: false,
          label: "Harmonic base · absolute x; z = x − y in analysis",
          sample(t) {
            const co = Math.cos(input.omega * t);
            const si = Math.sin(input.omega * t);
            const x = response.absolute.map((z) => z.re * co - z.im * si);
            return {
              x,
              v: response.absolute.map((z) => -input.omega * (z.re * si + z.im * co)),
              a: x.map((v) => -input.omega * input.omega * v),
              energy: 0,
            };
          },
        };
      } catch {
        sampler = undefined;
      }
    } else if (input.preview) {
      const phi = normalize(modal.modes[chosen].phi, system.M, "max", input.sign);
      const w = modal.modes[chosen].omega;
      sampler = {
        horizon,
        visual: true,
        energyMeaningful: false,
        label:
          (w
            ? "Single mode · actual natural frequency"
            : "Zero mode · static, no restoring stiffness") + " · visual amplitude only",
        sample(t) {
          const x = phi.map((v) => input.amplitude * v * Math.cos(w * t));
          return {
            x,
            v: phi.map((v) => -input.amplitude * v * w * Math.sin(w * t)),
            a: x.map((v) => -w * w * v),
            energy: 0,
          };
        },
      };
    } else if (modal.classical) {
      const response = modalResponse(
        modal,
        Array.from({ length: count }, (_, i) => input.x0[i] ?? 0),
        Array.from({ length: count }, (_, i) => input.v0[i] ?? 0),
        Array.from({ length: count }, (_, i) => input.mask[i] ?? true),
      );
      sampler = {
        horizon,
        visual: false,
        energyMeaningful: true,
        label: "Initial-value modal superposition · x in m, rotations in rad",
        sample: response.sample,
      };
    }

    return {
      system,
      modal,
      assembly: assembly
        ? ({ ...assembly, expand: expand ?? assembly.expand } as typeof assembly)
        : undefined,
      feModel,
      sampler,
      error: "",
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** Fixed visual range, computed once per solution — never per frame. */
export function extentOf(sampler: Sampler | undefined) {
  if (!sampler) return 1;
  let max = 0;
  for (let i = 0; i <= 128; i++) {
    const s = sampler.sample((sampler.horizon * i) / 128);
    for (const v of s.x) max = Math.max(max, Math.abs(v));
  }
  return Math.max(1e-6, max);
}
