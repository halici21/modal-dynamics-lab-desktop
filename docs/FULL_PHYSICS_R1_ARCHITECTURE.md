# FULL PHYSICS R1 — architecture

Release identity: FULL PHYSICS COMPLETION R1, desktop version 0.3.0.

## Authorization and baseline

The user's latest complete implementation prompt explicitly supersedes the frozen V1 exclusions for forcing, FRF, base excitation, spectra, PSD and educational FE, and authorizes all internal gates without stopping between phases. No nonlinear, proprietary-import, cloud, 3D solid/shell, experimental identification or unrelated features were added. The earlier attachment ended at Part C; the replacement full prompt controls this run.

The existing Phase 2 and UI Rebase R1 implementation was audited directly, together with the required four frozen specifications, reports, architecture documents, physics sources, numerical tests, UI integration and performance evidence. Existing damped SDOF was already complete. Baseline: 39 unit tests passed; 67/68 UI tests passed on the fresh baseline, with an immediate paused-RAF assertion observing a pending one-shot ResizeObserver job. No physical equation failed. The final test waits for settled zero RAF while retaining the zero-loop requirement.

## Boundaries

- Physics: common.ts, systems.ts, modal.ts, dynamics.ts, frequency.ts, spectra.ts, rigid.ts and fem.ts are pure TypeScript; they import no DOM, React, animation clock or native APIs. Existing sdof.ts and damping mathematics remain in place.
- Animation: the existing SimulationClock remains the sole production RAF owner. No physics was moved into the clock or Rust.
- Visualization: CoreViews.tsx translates SI/modal values into SVG geometry, interpolates FE bending, and updates refs from the shared clock. No continuous frame values enter React state.
- Application: CoreWorkbench.tsx owns committed model parameters, selected mode/DOF, matrix drafts, boundary/mesh choices, analysis view and validation messages.
- Native: Tauri 2 shell, Vite/React/TypeScript, offline bundled assets, minimal focus capabilities and CSP unchanged.

## Numerical dependency

ml-matrix 6.15.0 is pinned and bundled locally. Its symmetric eigenvalue decomposition uses Householder tridiagonalization and implicit QL. Our wrapper supplies the generalized Cholesky reduction, validation, scaling, back-transformation and post-solve checks. Python 3/NumPy/SciPy are development oracles only; the installed desktop application does not invoke Python or a backend.

The MIT notices for ml-matrix and its four dependency packages ship in public/FULL_PHYSICS_R1_THIRD_PARTY_NOTICES.txt, alongside the existing workbench notices.

## Model and API inventory

System = { M, C, K, labels, optional links/boundary }. All matrices are small dense arrays. Generalized eigen analysis has no N=10 cap; tests include N=16 and FE meshes larger than 10. Interactive chains are 2–10 DOF; the forced SDOF workspace is one DOF. Mode identity assignment is deliberately bounded to N<=10.

- assemble/chain: generic mass, spring and damper contributions, ground links and three boundary families.
- solveModal: full SPD M, PSD K, passive symmetric C, frequencies, mass-normalized vectors, residuals, modal Gram matrices, classical-damping detection, zero classification and clusters.
- normalize/gram/mac/subspaceOverlap/trackModes: max/mass display normalization, orthogonality, sign-invariant MAC, rotation-invariant subspace similarity and global assignment.
- project/reconstruct/modalResponse: general-basis modal coordinates; exact classical free response and optional modal masks.
- forcedSdof/modalForcedResponse/newmark/sampledForce: analytical transient/steady/total harmonic or constant forcing; generic sampled/callback forcing through average-acceleration integration.
- rayleigh/fitRayleigh: passive proportional matrix and two-frequency coefficient fitting.
- directFRF/modalFRF/modalFRFEntry/harmonicResponse: complex direct linear solves, complete or explicitly truncated modal sums, and scalar O(N) modal transfer.
- baseResponse/baseAccelerationResponse: uniform support displacement or acceleration via an influence vector, separate relative and absolute response.
- participation: arbitrary-normalization Gamma, effective mass, ratios and cumulative sums.
- responseSpectrum/scalarPSD/outputPSD/integratePSD: record-based oscillator spectra and one-sided per-Hz stationary PSD/RMS.
- rigid2D/rigid3D/rigidTransform: conceptual rigid-motion bases and exact finite rigid transformations.
- barElement/beamElement/frameElement/assembleFE/solveFE: educational FE matrices, transformation, elimination, common eigen solve and expanded nodal modes.

## UI integration

The existing six-item lab rail is enabled, and an accessible header selector reaches every additional workspace. Three DOF is a generic model preset, not a separate solver. Analysis selection exposes response, modes, matrices, FRF, participation, spectrum, PSD and rigid bases. The FE workspace provides element, mesh, constraint and frame-angle controls.

Single-mode preview uses arbitrary visual amplitude at the true natural frequency. Zero modes remain static in preview; physical zero-mode initial velocity produces drift through modalResponse. No fake zero-mode oscillation is assigned. Reduced motion shows a static mode; step/scrub remain available. Physical initial-value response and visual preview are labeled separately; preview has no invented energy readout.

Matrix input commits only after validation. Nonclassical damping is accepted for direct FRF; modal superposition explains that a coupled damping matrix is unsupported by the decoupled branch. Newmark provides the renderer-independent physical-coordinate time-integration API. The spectrum workspace exercises time integration from editable recorded forcing.

## Lifecycle and performance

Analysis plots unsubscribe when hidden or unmounted. Model switches unmount old subscriptions. Pause, reset, resize and native inactivity use the existing clock. Numeric edits pause and re-evaluate the same initial-value problem at the current time; they are not an instantaneous physical parameter-switching simulation.

Full direct FRF matrices are retained for API validation. The UI uses a scalar modal transfer for classical damping and a single RHS direct solve otherwise. This follows measurement, avoids rebuilding unused matrix entries, and needs no worker/Rust migration for the validated interactive sizes.

## Deliberate UI limits

This is functional physics integration, not a new visual redesign. The existing Scientific Workbench R1 remains. The new modules use utilitarian tables and SVG; no Three.js/WebGPU R&D was started. FE material/section presets are stated in the UI; the pure FE model supports arbitrary positive properties. Large FE initial-condition editors and advanced load record management are not a production solver interface.
