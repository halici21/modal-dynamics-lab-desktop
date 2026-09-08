/**
 * Modal Dynamics Studio — the study root node's Property Manager page.
 *
 * COMSOL precedent: the root node of the model tree has its own Settings
 * window describing the study itself. Everything here is a property of the
 * STUDY rather than of a selected object — DOF count, boundary condition,
 * damping model, mesh, constraints, excitation, mode masking.
 *
 * This is where the R2 parameter dock's study-level capabilities live in R3;
 * none of them were dropped, they moved from a permanent form to the root
 * node's page.
 */
import type { Boundary } from "../physics/systems";
import { fitRayleigh } from "../physics/systems";
import type { Modal } from "../physics/modal";
import { PropertyFact, PropertyRow, PropertySection } from "./PropertyManager";
import type { Study } from "./model";

export interface StudySettingsProps {
  study: Study;
  modal?: Modal;
  n: number;
  onN(v: number): void;
  boundary: Boundary;
  onBoundary(b: Boundary): void;
  alpha: number;
  beta: number;
  onRayleigh(alpha: number, beta: number): void;
  sdofC: number;
  onSdofC(v: number): void;
  preview: boolean;
  onPreview(v: boolean): void;
  amplitude: number;
  onAmplitude(v: number): void;
  element: "bar" | "beam" | "frame";
  onElement(v: "bar" | "beam" | "frame"): void;
  mesh: number;
  onMesh(v: number): void;
  feBoundary: "cantilever" | "fixed-fixed" | "pinned" | "free-free";
  onFeBoundary(v: "cantilever" | "fixed-fixed" | "pinned" | "free-free"): void;
  omega: number;
  onOmega(v: number): void;
  force: number;
  onForce(v: number): void;
  forcePhase: number;
  onForcePhase(v: number): void;
  baseAmplitude: number;
  onBaseAmplitude(v: number): void;
  error: string;
  onError(m: string): void;
}

export function StudySettings(p: StudySettingsProps) {
  const chain = p.study.stage === "chain" || p.study.stage === "rigid";
  const excitation =
    p.study.module === 6 || p.study.module === 8 || p.study.tabs.includes("FRF");
  return (
    <>
      <PropertySection title="Study">
        <PropertyFact label="Name">{p.study.name}</PropertyFact>
        <PropertyFact label="Question">{p.study.summary}</PropertyFact>
      </PropertySection>

      {chain && p.study.module !== 6 && (
        <PropertySection title="Model">
          <label className="prop-select">
            <span className="prop-label">Degrees of freedom</span>
            <select
              aria-label="DOF count"
              value={p.n}
              disabled={p.study.module === 2}
              onChange={(e) => p.onN(+e.target.value)}
            >
              {Array.from({ length: 9 }, (_, i) => i + 2).map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <label className="prop-select">
            <span className="prop-label">Boundary condition</span>
            <select
              aria-label="Boundary condition"
              value={p.boundary}
              onChange={(e) => p.onBoundary(e.target.value as Boundary)}
            >
              {["fixed-fixed", "fixed-free", "free-free"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </PropertySection>
      )}

      {p.study.stage === "fe" && (
        <PropertySection title="Mesh and constraints">
          <label className="prop-select">
            <span className="prop-label">Element type</span>
            <select
              aria-label="FE element"
              value={p.element}
              onChange={(e) =>
                p.onElement(e.target.value as "bar" | "beam" | "frame")
              }
            >
              {["bar", "beam", "frame"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="prop-select">
            <span className="prop-label">Elements</span>
            <select
              aria-label="Mesh elements"
              value={p.mesh}
              onChange={(e) => p.onMesh(+e.target.value)}
            >
              {[1, 2, 4, 8].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="prop-select">
            <span className="prop-label">Constraints</span>
            <select
              aria-label="FE boundary"
              value={p.feBoundary}
              onChange={(e) =>
                p.onFeBoundary(
                  e.target.value as
                    | "cantilever"
                    | "fixed-fixed"
                    | "pinned"
                    | "free-free",
                )
              }
            >
              {["cantilever", "fixed-fixed", "pinned", "free-free"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <PropertyFact label="Model">
            Length 1 m, E 20 MPa, ρ 1000 kg/m³, A 0.01 m², I 1e-5 m⁴. Consistent
            mass, small linear deformation, no shear deformation.
          </PropertyFact>
        </PropertySection>
      )}

      <PropertySection title="Damping model">
        {p.study.module === 6 ? (
          <PropertyRow
            label="Viscous damping c"
            value={p.sdofC}
            unit="N·s/m"
            min={0}
            max={200}
            step={0.5}
            onChange={p.onSdofC}
          />
        ) : (
          <>
            <PropertyRow
              label="Rayleigh α"
              value={p.alpha}
              unit="s⁻¹"
              min={0}
              max={10}
              step={0.05}
              onChange={(v) => p.onRayleigh(v, p.beta)}
            />
            <PropertyRow
              label="Rayleigh β"
              value={p.beta}
              unit="s"
              min={0}
              max={1}
              step={0.001}
              onChange={(v) => p.onRayleigh(p.alpha, v)}
            />
            <button
              onClick={() => {
                try {
                  const elastic = (p.modal?.modes ?? []).filter((m) => m.omega > 0);
                  if (elastic.length < 2)
                    throw new Error("Need two distinct elastic modes to fit.");
                  const fit = fitRayleigh(
                    elastic[0].omega,
                    0.03,
                    elastic.at(-1)!.omega,
                    0.05,
                  );
                  p.onRayleigh(fit.alpha, fit.beta);
                  p.onError("");
                } catch (e) {
                  p.onError((e as Error).message);
                }
              }}
            >
              Fit 3% first, 5% last elastic mode
            </button>
          </>
        )}
        <PropertyFact label="Class">
          {p.modal
            ? p.modal.classical
              ? "Classical: modal equations decouple."
              : "Coupled: use direct FRF or time integration."
            : "—"}
        </PropertyFact>
      </PropertySection>

      {excitation && (
        <PropertySection title="Excitation">
          <PropertyRow
            label="Excitation Ω"
            value={p.omega}
            unit="rad/s"
            min={0}
            max={10000}
            step={0.5}
            onChange={p.onOmega}
          />
          {p.study.module === 6 && (
            <>
              <PropertyRow
                label="Force amplitude"
                value={p.force}
                unit="N"
                min={-100}
                max={100}
                step={0.5}
                onChange={p.onForce}
              />
              <PropertyRow
                label="Force phase"
                value={p.forcePhase}
                unit="rad"
                min={-6.3}
                max={6.3}
                step={0.1}
                onChange={p.onForcePhase}
              />
            </>
          )}
          {p.study.module === 8 && (
            <PropertyRow
              label="Base amplitude"
              value={p.baseAmplitude}
              unit="m"
              min={0}
              max={1}
              step={0.005}
              onChange={p.onBaseAmplitude}
            />
          )}
        </PropertySection>
      )}

      <PropertySection title="Display">
        <label className="prop-check">
          <input
            type="checkbox"
            checked={p.preview}
            onChange={(e) => p.onPreview(e.target.checked)}
          />
          <span>Animate one mode at a time</span>
        </label>
        <PropertyRow
          label="Visualization scale"
          value={p.amplitude}
          unit="×"
          min={0.001}
          max={0.5}
          step={0.005}
          onChange={p.onAmplitude}
        />
        <PropertyFact label="Reading">
          Visualization scale changes only how large the animation looks. It is
          never the physical response amplitude.
        </PropertyFact>
      </PropertySection>

      {p.error && (
        <p role="alert" className="prop-error">
          {p.error}
        </p>
      )}
    </>
  );
}
